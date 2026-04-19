import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Accept Stripe price IDs (price_*) or product IDs (prod_*)
  function resolvePrice(envValue: string | undefined): string | null {
    if (!envValue) return null;
    const trimmed = envValue.trim();
    if (trimmed.length <= 10) return null;
    if (trimmed.startsWith('price_') || trimmed.startsWith('prod_'))
      return trimmed;
    return null;
  }

  console.log('🧹 Cleaning existing data...\n');

  try {
    // Limpa tabelas do Better Auth (auth_*) — gerenciadas via raw SQL pois não são modelos Prisma
    await pool.query('DELETE FROM auth_account');
    await pool.query('DELETE FROM auth_session');
    await pool.query('DELETE FROM auth_verification');
    await pool.query('DELETE FROM auth_user');
    console.log(
      '  ✅ Better Auth tables cleared (auth_account, auth_session, auth_user, auth_verification)',
    );
  } catch {
    console.log('  ⚠️  Better Auth tables not found — skipping (first run?)');
  }

  try {
    // Limpa self-referential FK antes de deletar companies
    await prisma.company.updateMany({ data: { parentCompanyId: null } });

    // Deleta na ordem correta (filhos antes de pais)
    await prisma.chartOfAccount.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.company.deleteMany();
    await prisma.plan.deleteMany();

    console.log('  ✅ All app data cleared\n');
  } catch {
    console.log('  ⚠️  Tables not found — skipping cleanup (first run?)\n');
  }
  console.log('🌱 Seeding database...\n');

  // ───────────────────────────────────────────
  // 1. Seed Plans
  // ───────────────────────────────────────────
  const plans = [
    {
      type: 'TRIAL' as const,
      name: 'Trial',
      description: 'Teste grátis por tempo limitado, sem compromisso',
      priceMonthly: 0,
      trialDays: 1,
      maxUsers: 5,
      maxCompany: 1,
      maxTransactions: 100,
      maxContacts: 50,
      isActive: true,
      stripePriceId: resolvePrice(process.env.STRIPE_PRICE_TRIAL),
    },
    {
      type: 'BASIC' as const,
      name: 'Basic',
      description: 'Para profissionais autônomos e pequenos escritórios',
      priceMonthly: 29900,
      trialDays: 0,
      maxUsers: 5,
      maxCompany: 1,
      maxTransactions: 1000,
      maxContacts: 500,
      isActive: true,
      stripePriceId: resolvePrice(process.env.STRIPE_PRICE_BASIC),
    },
    {
      type: 'PROFESSIONAL' as const,
      name: 'Professional',
      description: 'Para escritórios em crescimento com múltiplas empresas',
      priceMonthly: 39900,
      trialDays: 0,
      maxUsers: 5,
      maxCompany: 3,
      maxTransactions: 10000,
      maxContacts: 5000,
      isActive: true,
      stripePriceId: resolvePrice(process.env.STRIPE_PRICE_PROFESSIONAL),
    },
    {
      type: 'ENTERPRISE' as const,
      name: 'Enterprise',
      description:
        'Solução completa para grandes escritórios e redes contábeis',
      priceMonthly: 99900,
      trialDays: 0,
      maxUsers: -1,
      maxCompany: -1,
      maxTransactions: -1,
      maxContacts: -1,
      isActive: true,
      stripePriceId: resolvePrice(process.env.STRIPE_PRICE_ENTERPRISE),
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { type: plan.type },
      create: plan,
      update: {
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        trialDays: plan.trialDays,
        maxUsers: plan.maxUsers,
        maxCompany: plan.maxCompany,
        maxTransactions: plan.maxTransactions,
        maxContacts: plan.maxContacts,
        isActive: plan.isActive,
        // Only update stripePriceId if a real value is resolved
        ...(plan.stripePriceId !== null && {
          stripePriceId: plan.stripePriceId,
        }),
      },
    });
    console.log(`  ✅ Plan "${plan.name}" created`);
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
