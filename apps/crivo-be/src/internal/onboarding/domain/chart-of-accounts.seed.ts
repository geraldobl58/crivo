import type { AccountType } from '@prisma/client';

interface ChartOfAccountSeed {
  readonly code: string;
  readonly name: string;
  readonly type: AccountType;
}

export const DEFAULT_CHART_OF_ACCOUNTS: readonly ChartOfAccountSeed[] = [
  // ATIVO
  { code: '1', name: 'Ativo', type: 'ASSET' },
  { code: '1.1', name: 'Ativo Circulante', type: 'ASSET' },
  { code: '1.1.01', name: 'Caixa', type: 'ASSET' },
  { code: '1.1.02', name: 'Bancos Conta Movimento', type: 'ASSET' },
  { code: '1.1.03', name: 'Aplicações Financeiras', type: 'ASSET' },
  { code: '1.1.04', name: 'Clientes (Contas a Receber)', type: 'ASSET' },
  { code: '1.1.05', name: 'Estoques', type: 'ASSET' },
  { code: '1.1.06', name: 'Impostos a Recuperar', type: 'ASSET' },
  { code: '1.1.07', name: 'Adiantamentos', type: 'ASSET' },
  { code: '1.2', name: 'Ativo Não Circulante', type: 'ASSET' },
  { code: '1.2.01', name: 'Imobilizado', type: 'ASSET' },
  { code: '1.2.02', name: 'Intangível', type: 'ASSET' },
  { code: '1.2.03', name: 'Investimentos', type: 'ASSET' },

  // PASSIVO
  { code: '2', name: 'Passivo', type: 'LIABILITY' },
  { code: '2.1', name: 'Passivo Circulante', type: 'LIABILITY' },
  { code: '2.1.01', name: 'Fornecedores', type: 'LIABILITY' },
  { code: '2.1.02', name: 'Salários a Pagar', type: 'LIABILITY' },
  { code: '2.1.03', name: 'Impostos a Recolher', type: 'LIABILITY' },
  {
    code: '2.1.04',
    name: 'Empréstimos e Financiamentos (CP)',
    type: 'LIABILITY',
  },
  { code: '2.1.05', name: 'Obrigações Trabalhistas', type: 'LIABILITY' },
  { code: '2.2', name: 'Passivo Não Circulante', type: 'LIABILITY' },
  {
    code: '2.2.01',
    name: 'Empréstimos e Financiamentos (LP)',
    type: 'LIABILITY',
  },

  // PATRIMÔNIO LÍQUIDO
  { code: '3', name: 'Patrimônio Líquido', type: 'EQUITY' },
  { code: '3.1', name: 'Capital Social', type: 'EQUITY' },
  { code: '3.2', name: 'Reservas de Capital', type: 'EQUITY' },
  { code: '3.3', name: 'Reservas de Lucros', type: 'EQUITY' },
  { code: '3.4', name: 'Lucros ou Prejuízos Acumulados', type: 'EQUITY' },

  // RECEITAS
  { code: '4', name: 'Receitas', type: 'REVENUE' },
  { code: '4.1', name: 'Receita Operacional Bruta', type: 'REVENUE' },
  { code: '4.1.01', name: 'Receita de Vendas de Produtos', type: 'REVENUE' },
  { code: '4.1.02', name: 'Receita de Prestação de Serviços', type: 'REVENUE' },
  { code: '4.2', name: 'Deduções da Receita', type: 'REVENUE' },
  { code: '4.2.01', name: 'Devoluções de Vendas', type: 'REVENUE' },
  { code: '4.2.02', name: 'Impostos sobre Vendas', type: 'REVENUE' },
  { code: '4.3', name: 'Receitas Financeiras', type: 'REVENUE' },
  { code: '4.4', name: 'Outras Receitas Operacionais', type: 'REVENUE' },

  // DESPESAS
  { code: '5', name: 'Despesas', type: 'EXPENSE' },
  { code: '5.1', name: 'Despesas Operacionais', type: 'EXPENSE' },
  { code: '5.1.01', name: 'Despesas com Pessoal', type: 'EXPENSE' },
  { code: '5.1.02', name: 'Despesas Administrativas', type: 'EXPENSE' },
  { code: '5.1.03', name: 'Despesas Comerciais', type: 'EXPENSE' },
  { code: '5.1.04', name: 'Despesas Tributárias', type: 'EXPENSE' },
  { code: '5.2', name: 'Despesas Financeiras', type: 'EXPENSE' },
  { code: '5.2.01', name: 'Juros e Multas', type: 'EXPENSE' },
  { code: '5.2.02', name: 'Tarifas Bancárias', type: 'EXPENSE' },
  {
    code: '5.3',
    name: 'Custo dos Produtos/Serviços Vendidos',
    type: 'EXPENSE',
  },
  {
    code: '5.3.01',
    name: 'CPV - Custo dos Produtos Vendidos',
    type: 'EXPENSE',
  },
  {
    code: '5.3.02',
    name: 'CSV - Custo dos Serviços Vendidos',
    type: 'EXPENSE',
  },
] as const;
