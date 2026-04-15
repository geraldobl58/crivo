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

  async execute(id: string, companyId?: string): Promise<void> {
    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (companyId && existing.companyId !== companyId) {
      throw new ForbiddenException(
        'Acesso negado: usuário não pertence à sua organização',
      );
    }

    await this.userRepository.delete(id);
  }
}
