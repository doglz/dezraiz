import type {
  AdminUser,
  GrowthPoint,
  OverviewStats,
  PlanDistribution,
  Sponsor,
  Subscription,
  SubscriptionStats,
  UsageRow,
  UsageStats,
} from "@/types/admin";

// ============================================================
// MOCK DATA — substituir por queries Supabase no futuro
// ============================================================

export const overviewStats: OverviewStats = {
  totalUsers: 1247,
  newToday: 23,
  newTodayDelta: 12,
  mrr: 8430,
  mrrWeeklyDelta: 620,
  activeUsers7d: 487,
  conversionRate: 4.2,
};

// 30 dias de crescimento
export const growthData: GrowthPoint[] = (() => {
  const out: GrowthPoint[] = [];
  let users = 1080;
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    users += Math.floor(Math.random() * 12) + 2;
    out.push({ date: d.toISOString().slice(0, 10), users });
  }
  return out;
})();

export const planDistribution: PlanDistribution[] = [
  { plan: "Livre", value: 78, color: "#71717a" },
  { plan: "Raízes", value: 18, color: "#27c166" },
  { plan: "Terra", value: 4, color: "#f5d547" },
];

const COUNTRIES = [
  { name: "Portugal", flag: "🇵🇹" },
  { name: "EUA", flag: "🇺🇸" },
  { name: "Reino Unido", flag: "🇬🇧" },
  { name: "Espanha", flag: "🇪🇸" },
  { name: "Irlanda", flag: "🇮🇪" },
  { name: "Canadá", flag: "🇨🇦" },
  { name: "Alemanha", flag: "🇩🇪" },
  { name: "Austrália", flag: "🇦🇺" },
];

const FIRST = [
  "Mariana", "João", "Ana", "Pedro", "Beatriz", "Lucas", "Camila", "Rafael",
  "Juliana", "Felipe", "Larissa", "Gustavo", "Patrícia", "Bruno", "Isabela",
  "Tiago", "Fernanda", "Diego", "Carolina", "Mateus", "Aline", "Vinícius",
  "Letícia", "Henrique", "Renata", "Thiago", "Gabriela", "André", "Natália", "Rodrigo",
];
const LAST = [
  "Silva", "Souza", "Oliveira", "Santos", "Ferreira", "Costa", "Almeida",
  "Rodrigues", "Pereira", "Carvalho", "Gomes", "Martins", "Araújo", "Ribeiro",
  "Mendes", "Barbosa", "Cardoso", "Rocha", "Nogueira", "Teixeira",
];

const PLANS: Array<AdminUser["plan"]> = ["Livre", "Livre", "Livre", "Livre", "Livre", "Raízes", "Raízes", "Terra"];
const STAGES: Array<AdminUser["journeyStage"]> = ["planning", "traveling", "living"];

function randDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString();
}

export const users: AdminUser[] = Array.from({ length: 30 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  const country = COUNTRIES[i % COUNTRIES.length];
  return {
    id: `u_${(i + 1).toString().padStart(4, "0")}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`.replace(/[áàâã]/g, "a").replace(/[éê]/g, "e").replace(/[í]/g, "i").replace(/[óô]/g, "o").replace(/[ú]/g, "u").replace(/[ç]/g, "c"),
    country: country.name,
    countryFlag: country.flag,
    plan: PLANS[i % PLANS.length],
    signupDate: randDate(180),
    lastActivity: randDate(14),
    city: ["Lisboa", "Miami", "Londres", "Madrid", "Dublin", "Toronto", "Berlim", "Sydney"][i % 8],
    journeyStage: STAGES[i % STAGES.length],
  };
});

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export const subscriptionStats: SubscriptionStats = {
  active: 180,
  trial: 42,
  canceledThisMonth: 8,
};

const SUB_STATUSES: Array<Subscription["status"]> = ["ativa", "ativa", "ativa", "trial", "trial", "cancelada"];
const PLAN_PRICES: Record<AdminUser["plan"], number> = { Livre: 0, Raízes: 39.9, Terra: 89.9 };

export const subscriptions: Subscription[] = Array.from({ length: 20 }, (_, i) => {
  const u = users[i];
  const plan: AdminUser["plan"] = i % 4 === 0 ? "Terra" : "Raízes";
  return {
    id: `s_${(i + 1).toString().padStart(4, "0")}`,
    userName: u.name,
    userEmail: u.email,
    plan,
    status: SUB_STATUSES[i % SUB_STATUSES.length],
    startDate: randDate(120),
    nextBilling: (() => {
      const d = new Date();
      d.setDate(d.getDate() + Math.floor(Math.random() * 30) + 1);
      return d.toISOString();
    })(),
    amount: PLAN_PRICES[plan],
  };
});

// ============================================================
// USAGE & COST
// ============================================================

export const usageStats: UsageStats = {
  mapsSearches: 12480,
  mapsCost: 318,
  aiQueries: 28900,
  aiCost: 145,
  totalCost: 463,
  monthlyRevenue: 8430,
  margin: 94,
};

export const usageRows: UsageRow[] = Array.from({ length: 10 }, (_, i) => {
  const u = users[i];
  const maps = 800 - i * 65 + Math.floor(Math.random() * 80);
  const ai = 1500 - i * 110 + Math.floor(Math.random() * 150);
  const cost = (maps * 0.025 + ai * 0.005);
  return {
    userId: u.id,
    userName: u.name,
    plan: u.plan,
    mapsSearches: maps,
    aiQueries: ai,
    estimatedCost: Math.round(cost * 100) / 100,
    nearLimit: i < 3,
  };
});

// ============================================================
// SPONSORS
// ============================================================

export const sponsors: Sponsor[] = [
  {
    id: "sp_001",
    name: "Wise",
    tier: "ouro",
    monthlyValue: 4500,
    startDate: "2025-08-01T00:00:00.000Z",
    renewalDate: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "sp_002",
    name: "Remessa Online",
    tier: "prata",
    monthlyValue: 2200,
    startDate: "2025-11-15T00:00:00.000Z",
    renewalDate: "2026-05-15T00:00:00.000Z",
  },
  {
    id: "sp_003",
    name: "SafetyWing",
    tier: "bronze",
    monthlyValue: 900,
    startDate: "2026-01-10T00:00:00.000Z",
    renewalDate: "2026-07-10T00:00:00.000Z",
  },
];
