import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../libs/prisma/prisma.service';
import {
  UserRepository,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  PaginatedResult,
} from '../../domain/repository/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/user.role.enum';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(record: {
    id: string;
    keycloakId: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    role: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity({
      ...record,
      role: record.role as Role,
    });
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        keycloakId: data.keycloakId,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        role: data.role,
        companyId: data.companyId,
      },
    });
    return this.toEntity(user);
  }

  async findMany(filters: UserFilters): Promise<PaginatedResult<UserEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.firstname && {
        firstname: {
          contains: filters.firstname,
          mode: 'insensitive' as const,
        },
      }),
      ...(filters.email && {
        email: { contains: filters.email, mode: 'insensitive' as const },
      }),
      ...(filters.role && {
        role: filters.role,
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByKeycloakId(keycloakId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { keycloakId } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.keycloakId !== undefined && { keycloakId: data.keycloakId }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.firstname !== undefined && { firstname: data.firstname }),
        ...(data.lastname !== undefined && { lastname: data.lastname }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
      },
    });
    return this.toEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
