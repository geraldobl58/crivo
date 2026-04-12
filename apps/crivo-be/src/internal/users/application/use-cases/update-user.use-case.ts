import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repository/user.repository';
import type {
  UserRepository,
  UpdateUserData,
} from '../../domain/repository/user.repository';
import type { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, data: UpdateUserData): Promise<UserEntity> {
    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return this.userRepository.update(id, data);
  }
}
