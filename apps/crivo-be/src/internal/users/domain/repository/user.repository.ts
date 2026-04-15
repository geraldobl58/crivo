import { UserEntity } from '../entities/user.entity';
import { Role } from '../enums/user.role.enum';

export type CreateUserData = {
  keycloakId: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: Role;
  companyId?: string;
};

export type UpdateUserData = Partial<CreateUserData>;

export type UserFilters = {
  companyId?: string;
  firstname?: string;
  email?: string;
  role?: Role;
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const USER_REPOSITORY = 'UserRepository';

export interface UserRepository {
  create(data: CreateUserData): Promise<UserEntity>;
  findMany(filters: UserFilters): Promise<PaginatedResult<UserEntity>>;
  findById(id: string): Promise<UserEntity | null>;
  findByKeycloakId(keycloakId: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  update(id: string, data: UpdateUserData): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
