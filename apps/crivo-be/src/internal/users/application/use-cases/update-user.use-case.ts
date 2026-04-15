import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

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

  async execute(
    id: string,
    data: UpdateUserData,
    companyId?: string,
  ): Promise<UserEntity> {
    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (companyId && existing.companyId !== companyId) {
      throw new ForbiddenException(
        'Acesso negado: usuário não pertence à sua organização',
      );
    }

    return this.userRepository.update(id, data);
  }
}
