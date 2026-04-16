import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KeycloakCreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  temporary?: boolean;
  enabled?: boolean;
}

export interface KeycloakCreateUserResult {
  keycloakId: string;
}

export interface KeycloakUpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

export interface KeycloakResetPasswordInput {
  password: string;
  temporary?: boolean;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private tokenCache: TokenCache | null = null;

  private readonly baseUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.getOrThrow<string>('KEYCLOAK_BASE_URL');
    this.realm = this.config.getOrThrow<string>('KEYCLOAK_REALM');
    this.clientId = this.config.getOrThrow<string>('KEYCLOAK_CLIENT_ID');
    this.clientSecret = this.config.getOrThrow<string>(
      'KEYCLOAK_CLIENT_SECRET',
    );
  }

  private get adminApiUrl(): string {
    return `${this.baseUrl}/admin/realms/${this.realm}`;
  }

  /**
   * Obtém access token via Client Credentials Grant.
   * Usa cache em memória com margem de 30s antes da expiração.
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.tokenCache && this.tokenCache.expiresAt > now) {
      return this.tokenCache.accessToken;
    }

    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to obtain admin token: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to authenticate with Keycloak Admin API',
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: now + (data.expires_in - 30) * 1000,
    };

    return data.access_token;
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Response> {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(`${this.adminApiUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Cria um usuário no Keycloak e retorna o keycloakId.
   */
  async createUser(
    input: KeycloakCreateUserInput,
  ): Promise<KeycloakCreateUserResult> {
    const payload = {
      email: input.email,
      username: input.email,
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
      enabled: input.enabled ?? true,
      emailVerified: true,
      credentials: [
        {
          type: 'password',
          value: input.password,
          temporary: input.temporary ?? false,
        },
      ],
    };

    const response = await this.request('POST', '/users', payload);

    if (response.status === 409) {
      throw new ServiceUnavailableException(
        `User with email "${input.email}" already exists in Keycloak`,
      );
    }

    if (response.status !== 201) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to create Keycloak user: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to create user in Keycloak',
      );
    }

    // Keycloak retorna o ID no header Location: .../users/{id}
    const location = response.headers.get('Location');
    if (!location) {
      throw new ServiceUnavailableException(
        'Keycloak did not return user Location header',
      );
    }

    const keycloakId = location.split('/').pop()!;

    return { keycloakId };
  }

  /**
   * Atualiza email, nome ou status de um usuário no Keycloak.
   */
  async updateUser(
    keycloakId: string,
    input: KeycloakUpdateUserInput,
  ): Promise<void> {
    const payload: Record<string, unknown> = {};

    if (input.email !== undefined) {
      payload.email = input.email;
      payload.username = input.email;
    }
    if (input.firstName !== undefined) payload.firstName = input.firstName;
    if (input.lastName !== undefined) payload.lastName = input.lastName;
    if (input.enabled !== undefined) payload.enabled = input.enabled;

    const response = await this.request('PUT', `/users/${keycloakId}`, payload);

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to update Keycloak user ${keycloakId}: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to update user in Keycloak',
      );
    }
  }

  /**
   * Atribui uma realm role ao usuário.
   */
  async assignRealmRole(keycloakId: string, roleName: string): Promise<void> {
    // Primeiro busca o role object pelo nome
    const rolesResponse = await this.request(
      'GET',
      `/roles/${encodeURIComponent(roleName)}`,
    );

    if (!rolesResponse.ok) {
      const error = await rolesResponse.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to find Keycloak role "${roleName}": ${rolesResponse.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        `Keycloak role "${roleName}" not found`,
      );
    }

    const role = (await rolesResponse.json()) as { id: string; name: string };

    // Atribui a role ao usuário
    const response = await this.request(
      'POST',
      `/users/${keycloakId}/role-mappings/realm`,
      [{ id: role.id, name: role.name }],
    );

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to assign role "${roleName}" to user ${keycloakId}: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to assign role in Keycloak',
      );
    }
  }

  /**
   * Força troca ou reset de senha do usuário.
   */
  async resetPassword(
    keycloakId: string,
    input: KeycloakResetPasswordInput,
  ): Promise<void> {
    const payload = {
      type: 'password',
      value: input.password,
      temporary: input.temporary ?? false,
    };

    const response = await this.request(
      'PUT',
      `/users/${keycloakId}/reset-password`,
      payload,
    );

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to reset password for user ${keycloakId}: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to reset password in Keycloak',
      );
    }
  }

  /**
   * Remove um usuário do Keycloak.
   */
  async deleteUser(keycloakId: string): Promise<void> {
    const response = await this.request('DELETE', `/users/${keycloakId}`);

    if (response.status === 404) {
      this.logger.warn(
        `Keycloak user ${keycloakId} not found (already deleted?)`,
      );
      return;
    }

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to delete Keycloak user ${keycloakId}: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to delete user in Keycloak',
      );
    }
  }

  /**
   * Busca um usuário no Keycloak por email.
   * Retorna null se não encontrado.
   */
  async findUserByEmail(
    email: string,
  ): Promise<{ keycloakId: string; email: string } | null> {
    const response = await this.request(
      'GET',
      `/users?email=${encodeURIComponent(email)}&exact=true`,
    );

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Failed to search Keycloak user by email: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to search user in Keycloak',
      );
    }

    const users = (await response.json()) as Array<{
      id: string;
      email: string;
    }>;

    if (users.length === 0) return null;

    return { keycloakId: users[0].id, email: users[0].email };
  }

  /**
   * Gera um access token impersonando um usuário via Keycloak Token Exchange.
   * Requer que o client tenha permissão de token-exchange no Keycloak.
   *
   * @see https://www.keycloak.org/docs/latest/securing_apps/#_token-exchange
   */
  async exchangeToken(
    targetKeycloakId: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      requested_subject: targetKeycloakId,
      subject_token: await this.getAccessToken(),
      subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      this.logger.error(
        `Token exchange failed for user ${targetKeycloakId}: ${response.status} — ${error}`,
      );
      throw new ServiceUnavailableException(
        'Failed to generate impersonation token. Ensure token-exchange is enabled in Keycloak.',
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }
}
