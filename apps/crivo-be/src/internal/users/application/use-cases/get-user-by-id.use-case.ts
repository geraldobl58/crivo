import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repository/user.repository';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, companyId?: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (companyId && user.companyId !== companyId) {
      throw new ForbiddenException(
        'Acesso negado: usuário não pertence à sua organização',
      );
    }

    return user;
  }
}
