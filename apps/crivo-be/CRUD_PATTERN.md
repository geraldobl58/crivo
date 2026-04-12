# Padrão CRUD - Clean Architecture + DDD

Este documento descreve o padrão utilizado para criar módulos CRUD no **crivo-be**.
Use o módulo `companies` como referência para criar novos módulos.

---

## Estrutura de Pastas

```
src/internal/<module>/
├── domain/                          # Camada de Domínio (regras de negócio puras)
│   ├── entities/
│   │   └── <entity>.entity.ts       # Entidade do domínio (classe com readonly props)
│   ├── enums/                       # Enums de domínio (se necessário)
│   ├── value-objects/               # Value Objects (se necessário)
│   └── repository/
│       └── <entity>.repository.ts   # Interface do repositório + tipos auxiliares
│
├── application/                     # Camada de Aplicação (orquestração)
│   └── use-cases/
│       ├── create-<entity>.use-case.ts
│       ├── get-<entity>.use-case.ts        # Listagem com filtros/paginação
│       ├── get-<entity>-by-id.use-case.ts
│       ├── update-<entity>.use-case.ts
│       └── delete-<entity>.use-case.ts
│
├── infrastructure/                  # Camada de Infraestrutura (implementações concretas)
│   ├── http/
│   │   ├── <entity>.controller.ts   # Controller REST com Swagger
│   │   └── dtos/
│   │       ├── create-<entity>.dto.ts
│   │       ├── update-<entity>.dto.ts
│   │       └── get-<entity>.query.dto.ts
│   └── prisma/
│       └── prisma-<entity>.repository.ts  # Implementação Prisma do repositório
│
└── <entity>.module.ts               # Módulo NestJS (wiring DI)
```

---

## Passo a Passo para Criar um Novo CRUD

### 1. Domain Layer

#### 1.1 Entidade (`domain/entities/<entity>.entity.ts`)

```typescript
export class ExampleEntity {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
```

> A entidade é uma classe imutável (readonly). O construtor recebe um objeto com todas as propriedades.

#### 1.2 Interface do Repositório (`domain/repository/<entity>.repository.ts`)

```typescript
import { ExampleEntity } from '../entities/example.entity.js';

export type CreateExampleData = {
  name: string;
};

export type UpdateExampleData = Partial<CreateExampleData>;

export type ExampleFilters = {
  name?: string;
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

export const EXAMPLE_REPOSITORY = 'ExampleRepository';

export interface ExampleRepository {
  create(data: CreateExampleData): Promise<ExampleEntity>;
  findMany(filters: ExampleFilters): Promise<PaginatedResult<ExampleEntity>>;
  findById(id: string): Promise<ExampleEntity | null>;
  update(id: string, data: UpdateExampleData): Promise<ExampleEntity>;
  delete(id: string): Promise<void>;
}
```

> - `EXAMPLE_REPOSITORY` é a **injection token** usada no NestJS DI.
> - `PaginatedResult<T>` é genérico e pode ser reutilizado.
> - A interface **não depende** de Prisma ou qualquer framework.

---

### 2. Application Layer (Use Cases)

Cada operação CRUD é um use-case isolado. Todos seguem o mesmo padrão:

```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ExampleRepository,
  EXAMPLE_REPOSITORY,
} from '../../domain/repository/example.repository.js';

@Injectable()
export class GetExampleByIdUseCase {
  constructor(
    @Inject(EXAMPLE_REPOSITORY)
    private readonly exampleRepository: ExampleRepository,
  ) {}

  async execute(id: string): Promise<ExampleEntity> {
    const entity = await this.exampleRepository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Recurso com ID ${id} não encontrado`);
    }
    return entity;
  }
}
```

**Regras dos Use Cases:**

- Use `@Inject(TOKEN)` para injetar a **interface** do repositório.
- Validações de negócio ficam aqui (ex: verificar duplicatas antes de criar).
- Lançar exceptions do NestJS (`NotFoundException`, `ConflictException`, etc.).
- Cada use-case tem exatamente um método `execute()`.

---

### 3. Infrastructure Layer

#### 3.1 Prisma Repository (`infrastructure/prisma/prisma-<entity>.repository.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../libs/prisma/prisma.service.js';
import {
  ExampleRepository,
  ExampleFilters,
  CreateExampleData,
  UpdateExampleData,
  PaginatedResult,
} from '../../domain/repository/example.repository.js';
import { ExampleEntity } from '../../domain/entities/example.entity.js';

@Injectable()
export class PrismaExampleRepository implements ExampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExampleData): Promise<ExampleEntity> {
    const record = await this.prisma.example.create({ data });
    return new ExampleEntity(record);
  }

  async findMany(
    filters: ExampleFilters,
  ): Promise<PaginatedResult<ExampleEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.name && {
        name: { contains: filters.name, mode: 'insensitive' as const },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.example.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.example.count({ where }),
    ]);

    return {
      items: items.map((item) => new ExampleEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ... findById, update, delete seguem o mesmo padrão
}
```

> - Sempre retornar `new Entity(record)` para mapear o resultado do Prisma para a entidade do domínio.
> - Usar `Promise.all` para executar queries paralelas (count + findMany).

#### 3.2 Controller (`infrastructure/http/<entity>.controller.ts`)

```typescript
@ApiTags('Recursos')
@Controller('resources')
export class ExampleController {
  constructor(
    private readonly createExample: CreateExampleUseCase,
    private readonly getExamples: GetExamplesUseCase,
    private readonly getExampleById: GetExampleByIdUseCase,
    private readonly updateExample: UpdateExampleUseCase,
    private readonly deleteExample: DeleteExampleUseCase,
  ) {}

  @Post()                                    // POST /resources
  @Get()                                     // GET /resources?name=x&page=1&limit=10
  @Get(':id')                                // GET /resources/:id
  @Patch(':id')                              // PATCH /resources/:id
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT)  // DELETE /resources/:id
}
```

**Regras do Controller:**

- Usar `ParseUUIDPipe` para validar IDs.
- Decorar com Swagger (`@ApiOperation`, `@ApiResponse`, etc.).
- `DELETE` retorna `204 No Content`.
- Os DTOs usam `class-validator` para validação e `@nestjs/swagger` para documentação.

#### 3.3 DTOs (`infrastructure/http/dtos/`)

- **CreateDto**: campos obrigatórios com `@IsNotEmpty()`
- **UpdateDto**: campos opcionais com `@IsOptional()`
- **QueryDto**: filtros + paginação com `@Type(() => Number)` para query params

---

### 4. Module (`<entity>.module.ts`)

```typescript
@Module({
  controllers: [ExampleController],
  providers: [
    {
      provide: EXAMPLE_REPOSITORY, // Token da interface
      useClass: PrismaExampleRepository, // Implementação concreta
    },
    CreateExampleUseCase,
    GetExamplesUseCase,
    GetExampleByIdUseCase,
    UpdateExampleUseCase,
    DeleteExampleUseCase,
  ],
  exports: [EXAMPLE_REPOSITORY],
})
export class ExampleModule {}
```

> O binding `provide/useClass` é o que permite trocar implementações (ex: Prisma → TypeORM) sem alterar use-cases.

### 5. Registrar no AppModule

```typescript
// src/app.module.ts
import { ExampleModule } from './internal/examples/example.module';

@Module({
  imports: [
    // ... outros módulos
    ExampleModule,
  ],
})
export class AppModule {}
```

---

## Fluxo de Dependências

```
Controller → Use Case → Repository Interface ← Prisma Repository
   (HTTP)    (Application)     (Domain)           (Infrastructure)
```

- A **camada de domínio** não depende de nada externo.
- O **use-case** depende apenas da interface do repositório.
- O **controller** depende apenas dos use-cases.
- A **implementação Prisma** depende do domínio e do PrismaService.
- O **módulo** faz o wiring de tudo via Dependency Injection do NestJS.

---

## Checklist para Novo CRUD

- [ ] Criar model no `prisma/schema.prisma`
- [ ] Rodar `npm run prisma:migrate` e `npm run prisma:generate`
- [ ] Criar `domain/entities/<entity>.entity.ts`
- [ ] Criar `domain/repository/<entity>.repository.ts`
- [ ] Criar use-cases em `application/use-cases/`
- [ ] Criar `infrastructure/prisma/prisma-<entity>.repository.ts`
- [ ] Criar DTOs em `infrastructure/http/dtos/`
- [ ] Criar `infrastructure/http/<entity>.controller.ts`
- [ ] Criar `<entity>.module.ts`
- [ ] Importar módulo no `app.module.ts`
- [ ] Testar endpoints via Swagger (`/docs`)
