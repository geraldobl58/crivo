import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repository/user.repository';
import type {
  UserFilters,
  UserRepository,
  PaginatedResult,
} from '../../domain/repository/user.repository';
import type { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(filters: UserFilters): Promise<PaginatedResult<UserEntity>> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 10));

    return await this.userRepository.findMany({
      ...filters,
      page,
      limit,
    });
  }
}
