import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Pregnancy = "yes" | "no" | "no_say";

// Em que momento da jornada o usuário está:
// - planning: planejando a mudança / viagem (ainda no Brasil)
// - traveling: já viajando ou prestes a embarcar
// - living: já mora fora
export type JourneyStage = "planning" | "traveling" | "living";

export type VisaStatus =
  | "tourist"
  | "work_visa"
  | "permanent"
  | "student"
  | "regularizing";

export type FamilyStatus = "alone" | "with_partner" | "with_family";
export type BankAccountStatus = "yes" | "no" | "in_progress";
export type WorkType = "employed" | "freelancer" | "not_working";
export type RemittanceFrequency = "never" | "sometimes" | "monthly";
export type HousingStatus = "fixed" | "searching" | "with_friends" | "renting";
export type LanguageLevel = "basic" | "manage" | "fluent";
export type MainGoal =
  | "documents"
  | "job"
  | "bring_family"
  | "language"
  | "adapt"
  | "planning";

// --- Branch-specific types (asked only in certain journey stages) ---
export type PlanningMaturity =
  | "researching"
  | "decided"
  | "docs_in_progress"
  | "tickets_bought";

export type VisaIntent =
  | "tourist"
  | "work"
  | "student"
  | "permanent"
  | "unsure";

export type FirstAccommodation =
  | "hotel"
  | "friends_family"
  | "rental_ready"
  | "undecided";

export type FinancialPrepItem =
  | "has_international_account"
  | "plans_drei"
  | "researching_banks"
  | "not_yet";

export type BankingSetupItem =
  | "has_local_account"
  | "has_international_account"
  | "will_open_locally";

export interface ChildAgeGroup {
  baby?: boolean; // 0-2
  kid?: boolean; // 3-12
  teen?: boolean; // 13-17
  adult?: boolean; // 18+
}

export interface PreciseLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  country: string;
  countryCode?: string;
  state?: string;
  city?: string;
  neighbourhood?: string;
  postcode?: string;
  formatted?: string;
}

export interface Onboarding {
  phone: string;
  journeyStage: JourneyStage;

  location?: PreciseLocation;
  destinationCountry?: string;
  destinationCountryCode?: string;
  destinationCity?: string;

  arrivalMonth?: number;
  arrivalYear?: number;

  pregnancy: Pregnancy;
  familyStatus?: FamilyStatus;
  hasChildren?: boolean;
  childAges?: ChildAgeGroup;
  languageLevel?: LanguageLevel;
  wantsLanguageTips?: boolean;
  mainGoal?: MainGoal;

  // --- Planning only ---
  planningMaturity?: PlanningMaturity;
  visaIntent?: VisaIntent;
  financialPrep?: FinancialPrepItem[];

  // --- Traveling only ---
  firstAccommodation?: FirstAccommodation;
  bankingSetup?: BankingSetupItem[];

  // --- Traveling + Living ---
  visaStatus?: VisaStatus;

  // --- Living only ---
  bankAccount?: BankAccountStatus;
  workType?: WorkType;
  remittance?: RemittanceFrequency;
  housing?: HousingStatus;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: PreciseLocation;
  onboarding?: Onboarding;
  isPremium?: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  setOnboarding: (data: Onboarding) => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName">>) => Promise<void>;
  upgrade: () => Promise<void>;
}

// --- Internal helpers ---

interface ProfileRow {
  first_name: string;
  last_name: string;
  phone: string | null;
  plan: "livre" | "raizes" | "terra";
}

interface OnboardingRow {
  phone: string | null;
  journey_stage: JourneyStage;
  location: PreciseLocation | null;
  destination_country: string | null;
  destination_country_code: string | null;
  destination_city: string | null;
  arrival_month: number | null;
  arrival_year: number | null;
  pregnancy: Pregnancy;
  family_status: FamilyStatus | null;
  has_children: boolean | null;
  child_ages: ChildAgeGroup | null;
  language_level: LanguageLevel | null;
  wants_language_tips: boolean | null;
  main_goal: MainGoal | null;
  planning_maturity: PlanningMaturity | null;
  visa_intent: VisaIntent | null;
  financial_prep: FinancialPrepItem[] | null;
  first_accommodation: FirstAccommodation | null;
  banking_setup: BankingSetupItem[] | null;
  visa_status: VisaStatus | null;
  bank_account: BankAccountStatus | null;
  work_type: WorkType | null;
  remittance: RemittanceFrequency | null;
  housing: HousingStatus | null;
}

function profileDisplayName(firstName?: string, lastName?: string, email?: string) {
  const fullName = [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || email?.split("@")[0] || "";
}

async function syncAuthMetadata(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
}) {
  const displayName = profileDisplayName(data.firstName, data.lastName, data.email);
  const metadata: Record<string, string | null> = {};

  if (data.firstName !== undefined) metadata.first_name = data.firstName;
  if (data.lastName !== undefined) metadata.last_name = data.lastName;
  if (displayName) {
    metadata.display_name = displayName;
    metadata.full_name = displayName;
    metadata.name = displayName;
  }
  if (data.phone !== undefined) metadata.phone = data.phone;

  if (Object.keys(metadata).length === 0) return;

  const { error } = await supabase.auth.updateUser({ data: metadata });
  if (error) throw new Error(error.message);
}

async function ensureProfileRow(
  authUser: AuthUser,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
  } = {},
) {
  const metadata = authUser.user_metadata ?? {};
  const row = {
    id: authUser.id,
    first_name:
      data.firstName ??
      metadata.first_name ??
      profileDisplayName(undefined, undefined, authUser.email),
    last_name: data.lastName ?? metadata.last_name ?? "",
    phone: data.phone ?? metadata.phone ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "id" });

  if (error) throw new Error(error.message);
}

function rowToOnboarding(row: OnboardingRow): Onboarding {
  return {
    phone: row.phone ?? "",
    journeyStage: row.journey_stage,
    location: row.location ?? undefined,
    destinationCountry: row.destination_country ?? undefined,
    destinationCountryCode: row.destination_country_code ?? undefined,
    destinationCity: row.destination_city ?? undefined,
    arrivalMonth: row.arrival_month ?? undefined,
    arrivalYear: row.arrival_year ?? undefined,
    pregnancy: row.pregnancy,
    familyStatus: row.family_status ?? undefined,
    hasChildren: row.has_children ?? undefined,
    childAges: row.child_ages ?? undefined,
    languageLevel: row.language_level ?? undefined,
    wantsLanguageTips: row.wants_language_tips ?? undefined,
    mainGoal: row.main_goal ?? undefined,
    planningMaturity: row.planning_maturity ?? undefined,
    visaIntent: row.visa_intent ?? undefined,
    financialPrep: row.financial_prep ?? undefined,
    firstAccommodation: row.first_accommodation ?? undefined,
    bankingSetup: row.banking_setup ?? undefined,
    visaStatus: row.visa_status ?? undefined,
    bankAccount: row.bank_account ?? undefined,
    workType: row.work_type ?? undefined,
    remittance: row.remittance ?? undefined,
    housing: row.housing ?? undefined,
  };
}

async function loadUserData(authUser: AuthUser): Promise<User> {
  const [profileResult, onboardingResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name,last_name,phone,plan")
      .eq("id", authUser.id)
      .single(),
    supabase
      .from("onboarding")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data as ProfileRow | null;
  const onboardingRow = onboardingResult.data as OnboardingRow | null;

  const onboarding = onboardingRow ? rowToOnboarding(onboardingRow) : undefined;
  return {
    firstName: profile?.first_name || authUser.email?.split("@")[0] || "Você",
    lastName: profile?.last_name || "",
    email: authUser.email ?? "",
    phone: profile?.phone ?? undefined,
    location: onboarding?.location,
    isPremium: profile ? profile.plan !== "livre" : false,
    onboarding,
  };
}

// --- Context ---

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Ref so mutations always have the current auth user ID without stale closure issues
  const authUserRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        authUserRef.current = session.user;
        const u = await loadUserData(session.user);
        setUser(u);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        authUserRef.current = session?.user ?? null;
        if (session) {
          const u = await loadUserData(session.user);
          setUser(u);
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,

    login: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },

    loginWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw new Error(error.message);
    },

    register: async (firstName, lastName, email, password) => {
      const displayName = profileDisplayName(firstName, lastName, email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            full_name: displayName,
            name: displayName,
          },
        },
      });
      if (error) throw new Error(error.message);
      // session is null when email confirmation is required
      if (!data.session) throw new Error("EMAIL_CONFIRMATION_REQUIRED");
    },

    logout: async () => {
      await supabase.auth.signOut();
    },

    setOnboarding: async (data) => {
      const authUser = authUserRef.current;
      const uid = authUser?.id;
      if (!uid || !authUser) throw new Error("Sessão expirada. Faça login novamente.");

      const now = new Date().toISOString();
      await ensureProfileRow(authUser, {
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: data.phone ?? null,
      });

      const row = {
        user_id: uid,
        phone: data.phone ?? null,
        journey_stage: data.journeyStage,
        location: data.location ?? null,
        destination_country: data.destinationCountry ?? null,
        destination_country_code: data.destinationCountryCode ?? null,
        destination_city: data.destinationCity ?? null,
        arrival_month: data.arrivalMonth ?? null,
        arrival_year: data.arrivalYear ?? null,
        pregnancy: data.pregnancy,
        family_status: data.familyStatus ?? null,
        has_children: data.hasChildren ?? null,
        child_ages: data.childAges ?? null,
        language_level: data.languageLevel ?? null,
        wants_language_tips: data.wantsLanguageTips ?? null,
        main_goal: data.mainGoal ?? null,
        planning_maturity: data.planningMaturity ?? null,
        visa_intent: data.visaIntent ?? null,
        financial_prep: data.financialPrep ?? null,
        first_accommodation: data.firstAccommodation ?? null,
        banking_setup: data.bankingSetup ?? null,
        visa_status: data.visaStatus ?? null,
        bank_account: data.bankAccount ?? null,
        work_type: data.workType ?? null,
        remittance: data.remittance ?? null,
        housing: data.housing ?? null,
        updated_at: now,
      };

      // Upsert onboarding row
      const { error: onbError } = await supabase
        .from("onboarding")
        .upsert(row, { onConflict: "user_id" });

      if (onbError) throw new Error(`Onboarding: ${onbError.message}`);

      await syncAuthMetadata({ phone: data.phone ?? null });

      setUser((prev) =>
        prev ? { ...prev, phone: data.phone, onboarding: data } : prev,
      );
    },

    updateProfile: async (data) => {
      const authUser = authUserRef.current;
      const uid = authUser?.id;
      if (!uid || !authUser) return;

      await ensureProfileRow(authUser, {
        firstName: data.firstName ?? user?.firstName,
        lastName: data.lastName ?? user?.lastName,
        phone: user?.phone ?? null,
      });
      await syncAuthMetadata({
        firstName: data.firstName ?? user?.firstName,
        lastName: data.lastName ?? user?.lastName,
        email: authUser.email ?? undefined,
      });
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
    },

    upgrade: async () => {
      const authUser = authUserRef.current;
      const uid = authUser?.id;
      if (!uid) return;

      const { error } = await supabase
        .from("profiles")
        .update({ plan: "raizes", updated_at: new Date().toISOString() })
        .eq("id", uid);

      if (error) throw new Error(error.message);
      setUser((prev) => (prev ? { ...prev, isPremium: true } : prev));
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
