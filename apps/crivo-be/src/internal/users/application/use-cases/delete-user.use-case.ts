import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repository/user.repository';
import type { UserRepository } from '../../domain/repository/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    id: string,
    companyId?: string,
    currentUserId?: string,
  ): Promise<void> {
    if (currentUserId && id === currentUserId) {
      throw new ForbiddenException(
        'Não é permitido remover o próprio usuário logado',
      );
    }

    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (companyId && existing.companyId !== companyId) {
      throw new ForbiddenException(
        'Acesso negado: usuário não pertence à sua organização',
      );
    }

    if (existing.role === 'OWNER') {
      throw new ForbiddenException(
        'Não é permitido remover o proprietário da conta',
      );
    }

    await this.userRepository.delete(id);
  }
}
