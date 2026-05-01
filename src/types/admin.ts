// Admin panel types — DEZRAIZ
// When Supabase is wired in later, these types stay; only the data source changes.

export type Plan = "Livre" | "Raízes" | "Terra";
export type SubscriptionStatus = "ativa" | "trial" | "cancelada";
export type SponsorTier = "ouro" | "prata" | "bronze";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  country: string;
  countryFlag: string;
  plan: Plan;
  signupDate: string; // ISO
  lastActivity: string; // ISO
  city?: string;
  phone?: string;
  journeyStage?: "planning" | "traveling" | "living";
}

export interface Subscription {
  id: string;
  userName: string;
  userEmail: string;
  plan: Plan;
  status: SubscriptionStatus;
  startDate: string;
  nextBilling: string;
  amount: number;
}

export interface UsageRow {
  userId: string;
  userName: string;
  plan: Plan;
  mapsSearches: number;
  aiQueries: number;
  estimatedCost: number;
  nearLimit?: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  monthlyValue: number;
  startDate: string;
  renewalDate: string;
}

export interface GrowthPoint {
  date: string; // YYYY-MM-DD
  users: number;
}

export interface PlanDistribution {
  plan: Plan;
  value: number;
  color: string;
}

export interface OverviewStats {
  totalUsers: number;
  newToday: number;
  newTodayDelta: number; // %
  mrr: number;
  mrrWeeklyDelta: number; // R$
  activeUsers7d: number;
  conversionRate: number; // %
}

export interface SubscriptionStats {
  active: number;
  trial: number;
  canceledThisMonth: number;
}

export interface UsageStats {
  mapsSearches: number;
  mapsCost: number;
  aiQueries: number;
  aiCost: number;
  totalCost: number;
  monthlyRevenue: number;
  margin: number;
}
