import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// --- List Companies ---

class AdminCompanySubscriptionDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: 'PROFESSIONAL' })
  planType: string;

  @ApiProperty({ example: 'Professional' })
  planName: string;

  @ApiPropertyOptional({ example: '2026-05-14T00:00:00.000Z', nullable: true })
  currentPeriodEnd: Date | null;

  @ApiProperty({ example: false })
  cancelAtPeriodEnd: boolean;
}

export class AdminCompanyListItemDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Empresa XPTO' })
  name: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90', nullable: true })
  taxId: string | null;

  @ApiPropertyOptional({ example: 'cus_ABC123', nullable: true })
  stripeCustomerId: string | null;

  @ApiPropertyOptional({ example: 'uuid', nullable: true })
  parentCompanyId: string | null;

  @ApiProperty({ example: 5 })
  usersCount: number;

  @ApiProperty({ example: 2 })
  childCompaniesCount: number;

  @ApiPropertyOptional({ type: AdminCompanySubscriptionDto, nullable: true })
  subscription: AdminCompanySubscriptionDto | null;

  @ApiProperty({ example: '2026-04-12T00:00:00.000Z' })
  createdAt: Date;
}

export class PaginatedAdminCompanyResponseDto {
  @ApiProperty({ type: [AdminCompanyListItemDto] })
  items: AdminCompanyListItemDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

// --- Platform Metrics ---

class MetricsOverviewDto {
  @ApiProperty({ example: 150 })
  totalCompanies: number;

  @ApiProperty({ example: 480 })
  totalUsers: number;

  @ApiProperty({ example: 1250000, description: 'Total revenue in cents' })
  totalRevenue: number;
}

class StatusCountDto {
  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: 95 })
  count: number;
}

class PlanCountDto {
  @ApiProperty({ example: 'PROFESSIONAL' })
  planType: string;

  @ApiProperty({ example: 'Professional' })
  planName: string;

  @ApiProperty({ example: 60 })
  count: number;
}

class RecentCompanyDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Nova Empresa' })
  name: string;

  @ApiProperty({ example: '2026-04-16T00:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: 'PROFESSIONAL', nullable: true })
  planType: string | null;

  @ApiPropertyOptional({ example: 'ACTIVE', nullable: true })
  status: string | null;
}

export class PlatformMetricsResponseDto {
  @ApiProperty({ type: MetricsOverviewDto })
  overview: MetricsOverviewDto;

  @ApiProperty({ type: [StatusCountDto] })
  subscriptionsByStatus: StatusCountDto[];

  @ApiProperty({ type: [PlanCountDto] })
  subscriptionsByPlan: PlanCountDto[];

  @ApiProperty({ type: [RecentCompanyDto] })
  recentCompanies: RecentCompanyDto[];
}

// --- Impersonation ---

class ImpersonatedUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'owner@empresa.com' })
  email: string;

  @ApiProperty({ example: 'keycloak-uuid' })
  keycloakId: string;
}

class ImpersonatedCompanyDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Empresa XPTO' })
  name: string;
}

export class ImpersonationResponseDto {
  @ApiProperty({
    description: 'JWT access token for the impersonated user',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  accessToken: string;

  @ApiProperty({ description: 'Token TTL in seconds', example: 300 })
  expiresIn: number;

  @ApiProperty({ type: ImpersonatedUserDto })
  impersonatedUser: ImpersonatedUserDto;

  @ApiProperty({ type: ImpersonatedCompanyDto })
  company: ImpersonatedCompanyDto;
}
