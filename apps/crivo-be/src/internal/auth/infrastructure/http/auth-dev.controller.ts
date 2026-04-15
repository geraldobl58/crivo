import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../../libs/auth/public.decorator';
import { DevTokenDto } from './dtos/dev-token.dto';

@ApiTags('Auth (Dev)')
@Controller('auth')
export class AuthDevController {
  constructor(private readonly config: ConfigService) {}

  @Post('dev-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[DEV ONLY] Obter token do Keycloak via usuário/senha',
    description:
      'Endpoint exclusivo para desenvolvimento local. ' +
      'Retorna o access_token do Keycloak usando Resource Owner Password Credentials. ' +
      '**Não disponível em produção.**',
  })
  @ApiOkResponse({
    description: 'Token obtido com sucesso',
    schema: {
      properties: {
        access_token: { type: 'string' },
        expires_in: { type: 'number' },
        refresh_token: { type: 'string' },
        token_type: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Credenciais inválidas' })
  @ApiForbiddenResponse({ description: 'Endpoint desabilitado em produção' })
  async devToken(@Body() dto: DevTokenDto) {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException(
        'This endpoint is not available in production',
      );
    }

    const baseUrl = this.config.getOrThrow<string>('KEYCLOAK_BASE_URL');
    const realm = this.config.getOrThrow<string>('KEYCLOAK_REALM');
    const clientId =
      this.config.get<string>('KEYCLOAK_WEB_CLIENT_ID') ?? 'crivo-web';

    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      username: dto.username,
      password: dto.password,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ServiceUnavailableException(
        (error as Record<string, string>).error_description ??
          'Failed to obtain token from Keycloak',
      );
    }

    return response.json();
  }
}
