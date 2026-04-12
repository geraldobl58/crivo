import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repository/user.repository';
import type {
  UserRepository,
  CreateUserData,
} from '../../domain/repository/user.repository';
import type { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(data: CreateUserData): Promise<UserEntity> {
    const existingByEmail = await this.userRepository.findByEmail(data.email);

    if (existingByEmail) {
      throw new ConflictException(
        `Já existe um usuário com o email ${data.email}`,
      );
    }

    const existingByKeycloakId = await this.userRepository.findByKeycloakId(
      data.keycloakId,
    );

    if (existingByKeycloakId) {
      throw new ConflictException(
        `Já existe um usuário com o keycloakId ${data.keycloakId}`,
      );
    }

    return this.userRepository.create(data);
  }
}
