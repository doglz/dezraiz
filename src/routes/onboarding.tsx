import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Loader2, MapPin, Check, Baby, Ban, Lock, ChevronDown } from "lucide-react";
import {
  useAuth,
  type Pregnancy,
  type PreciseLocation,
  type VisaStatus,
  type VisaIntent,
  type FamilyStatus,
  type ChildAgeGroup,
  type BankAccountStatus,
  type WorkType,
  type RemittanceFrequency,
  type HousingStatus,
  type LanguageLevel,
  type MainGoal,
  type JourneyStage,
  type PlanningMaturity,
  type FirstAccommodation,
  type FinancialPrepItem,
  type BankingSetupItem,
} from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { PhoneField } from "@/components/PhoneField";
import { Logo } from "@/components/Logo";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
  reverseGeocode,
  nominatimToLocation,
  getBrowserPosition,
  type CountryItem,
} from "@/lib/geo";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    ...seo({
      title: "Onboarding",
      description: "Conte um pouco sobre sua mudança para personalizarmos sua DEZRAIZ.",
      path: "/onboarding",
      noindex: true,
    }),
  }),
  component: () => (
    <RequireAuth requireOnboarding={false}>
      <Onboarding />
    </RequireAuth>
  ),
});

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/* ============================================================
 * Step IDs — ordem e total de etapas variam conforme journey_stage.
 * ============================================================ */
type StepId =
  | "names"
  | "phone"
  | "journey"
  | "destination"          // planning + traveling
  | "current_location"     // living
  | "planning_maturity"    // planning
  | "arrival"              // todos (copy adapta)
  | "visa_intent"          // planning
  | "visa_status"          // traveling + living
  | "first_accommodation"  // traveling
  | "family"               // todos
  | "pregnancy"            // todos
  | "financial_prep"       // planning (multi)
  | "banking_setup"        // traveling (multi)
  | "bank_account"         // living
  | "work"                 // living
  | "remittance"           // living
  | "housing"              // living
  | "language"             // todos
  | "main_goal";           // todos

const HEAD: StepId[] = ["names", "phone", "journey"];

const PLANNING_STEPS: StepId[] = [
  ...HEAD,
  "destination",
  "planning_maturity",
  "arrival",
  "visa_intent",
  "family",
  "pregnancy",
  "financial_prep",
  "language",
  "main_goal",
];

const TRAVELING_STEPS: StepId[] = [
  ...HEAD,
  "destination",
  "arrival",
  "visa_status",
  "first_accommodation",
  "family",
  "pregnancy",
  "banking_setup",
  "language",
  "main_goal",
];

const LIVING_STEPS: StepId[] = [
  ...HEAD,
  "current_location",
  "arrival",
  "visa_status",
  "family",
  "pregnancy",
  "bank_account",
  "work",
  "remittance",
  "housing",
  "language",
  "main_goal",
];

function getSteps(stage: JourneyStage | null): StepId[] {
  if (stage === "planning") return PLANNING_STEPS;
  if (stage === "traveling") return TRAVELING_STEPS;
  if (stage === "living") return LIVING_STEPS;
  return HEAD;
}

/* ---------------- Persistência local do rascunho ---------------- */
// v2 — schema novo com campos condicionais. Drafts v1 são descartados.
const DRAFT_KEY = "dezraiz:onboarding-draft:v2";

interface OnboardingDraft {
  step?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  journeyStage?: JourneyStage | null;
  location?: PreciseLocation | null;
  destinationCountry?: string;
  destinationCountryCode?: string;
  destinationCity?: string;
  arrivalMonth?: number;
  arrivalYear?: number;
  pregnancy?: Pregnancy | null;
  familyStatus?: FamilyStatus | null;
  hasChildren?: boolean | null;
  childAges?: ChildAgeGroup;
  languageLevel?: LanguageLevel | null;
  wantsLanguageTips?: boolean | null;
  mainGoal?: MainGoal | null;
  planningMaturity?: PlanningMaturity | null;
  visaIntent?: VisaIntent | null;
  financialPrep?: FinancialPrepItem[];
  firstAccommodation?: FirstAccommodation | null;
  bankingSetup?: BankingSetupItem[];
  visaStatus?: VisaStatus | null;
  bankAccount?: BankAccountStatus | null;
  workType?: WorkType | null;
  remittance?: RemittanceFrequency | null;
  housing?: HousingStatus | null;
}

function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

function saveOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // quota cheia / private mode — ignora
  }
}

function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function Onboarding() {
  const { user, setOnboarding, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const draft = useMemo(() => loadOnboardingDraft(), []);

  const [step, setStep] = useState(() => {
    const s = draft?.step;
    return typeof s === "number" && s >= 1 ? s : 1;
  });
  const [direction, setDirection] = useState<1 | -1>(1);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // --- Universal head ---
  const [firstName, setFirstName] = useState(draft?.firstName ?? "");
  const [lastName, setLastName] = useState(draft?.lastName ?? "");
  const [phone, setPhone] = useState<string | undefined>(draft?.phone);
  const [journeyStage, setJourneyStage] = useState<JourneyStage | null>(
    draft?.journeyStage ?? null,
  );

  // --- Localização (caminho varia por stage) ---
  const [location, setLocation] = useState<PreciseLocation | null>(draft?.location ?? null);
  const [destinationCountry, setDestinationCountry] = useState<string | undefined>(draft?.destinationCountry);
  const [destinationCountryCode, setDestinationCountryCode] = useState<string | undefined>(draft?.destinationCountryCode);
  const [destinationCity, setDestinationCity] = useState<string | undefined>(draft?.destinationCity);

  // --- Datas ---
  const now = new Date();
  const [month, setMonth] = useState(draft?.arrivalMonth ?? now.getMonth() + 1);
  const [year, setYear] = useState(draft?.arrivalYear ?? now.getFullYear());

  // --- Universal cont. ---
  const [pregnancy, setPregnancy] = useState<Pregnancy | null>(draft?.pregnancy ?? null);
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus | null>(draft?.familyStatus ?? null);
  const [hasChildren, setHasChildren] = useState<boolean | null>(draft?.hasChildren ?? null);
  const [childAges, setChildAges] = useState<ChildAgeGroup>(draft?.childAges ?? {});
  const [languageLevel, setLanguageLevel] = useState<LanguageLevel | null>(draft?.languageLevel ?? null);
  const [wantsLanguageTips, setWantsLanguageTips] = useState<boolean | null>(draft?.wantsLanguageTips ?? null);
  const [mainGoal, setMainGoal] = useState<MainGoal | null>(draft?.mainGoal ?? null);

  // --- Planning only ---
  const [planningMaturity, setPlanningMaturity] = useState<PlanningMaturity | null>(draft?.planningMaturity ?? null);
  const [visaIntent, setVisaIntent] = useState<VisaIntent | null>(draft?.visaIntent ?? null);
  const [financialPrep, setFinancialPrep] = useState<FinancialPrepItem[]>(draft?.financialPrep ?? []);

  // --- Traveling only ---
  const [firstAccommodation, setFirstAccommodation] = useState<FirstAccommodation | null>(draft?.firstAccommodation ?? null);
  const [bankingSetup, setBankingSetup] = useState<BankingSetupItem[]>(draft?.bankingSetup ?? []);

  // --- Traveling + Living ---
  const [visaStatus, setVisaStatus] = useState<VisaStatus | null>(draft?.visaStatus ?? null);

  // --- Living only ---
  const [bankAccount, setBankAccount] = useState<BankAccountStatus | null>(draft?.bankAccount ?? null);
  const [workType, setWorkType] = useState<WorkType | null>(draft?.workType ?? null);
  const [remittance, setRemittance] = useState<RemittanceFrequency | null>(draft?.remittance ?? null);
  const [housing, setHousing] = useState<HousingStatus | null>(draft?.housing ?? null);

  // Lista de steps ativa.
  const stepIds = useMemo(() => getSteps(journeyStage), [journeyStage]);
  const totalSteps = stepIds.length;

  // Se o usuário trocar journey_stage e ficar fora dos limites, ajusta.
  useEffect(() => {
    if (step > totalSteps) setStep(totalSteps);
  }, [step, totalSteps]);

  const currentStepId = stepIds[Math.max(0, Math.min(step, stepIds.length) - 1)] ?? "names";

  // Persistência do rascunho a cada mudança.
  useEffect(() => {
    saveOnboardingDraft({
      step,
      firstName, lastName, phone, journeyStage,
      location, destinationCountry, destinationCountryCode, destinationCity,
      arrivalMonth: month, arrivalYear: year,
      pregnancy, familyStatus, hasChildren, childAges,
      languageLevel, wantsLanguageTips, mainGoal,
      planningMaturity, visaIntent, financialPrep,
      firstAccommodation, bankingSetup,
      visaStatus,
      bankAccount, workType, remittance, housing,
    });
  }, [
    step, firstName, lastName, phone, journeyStage,
    location, destinationCountry, destinationCountryCode, destinationCity,
    month, year,
    pregnancy, familyStatus, hasChildren, childAges,
    languageLevel, wantsLanguageTips, mainGoal,
    planningMaturity, visaIntent, financialPrep,
    firstAccommodation, bankingSetup,
    visaStatus,
    bankAccount, workType, remittance, housing,
  ]);

  // -------- Validação por etapa --------
  const childAgesSelected =
    !!childAges.baby || !!childAges.kid || !!childAges.teen || !!childAges.adult;

  const canContinue = (() => {
    switch (currentStepId) {
      case "names":
        return firstName.trim().length > 0 && lastName.trim().length > 0;
      case "phone":
        return !!phone && isValidPhoneNumber(phone);
      case "journey":
        return !!journeyStage;
      case "destination":
        return !!destinationCountry;
      case "current_location":
        return !!location?.country && !!location?.city;
      case "planning_maturity":
        return !!planningMaturity;
      case "arrival":
        return !!month && !!year;
      case "visa_intent":
        return !!visaIntent;
      case "visa_status":
        return !!visaStatus;
      case "first_accommodation":
        return !!firstAccommodation;
      case "family":
        return !!familyStatus &&
          hasChildren !== null &&
          (hasChildren === false || childAgesSelected);
      case "pregnancy":
        return !!pregnancy;
      case "financial_prep":
        return financialPrep.length > 0;
      case "banking_setup":
        return bankingSetup.length > 0;
      case "bank_account":
        return !!bankAccount;
      case "work":
        return !!workType;
      case "remittance":
        return !!remittance;
      case "housing":
        return !!housing;
      case "language":
        return !!languageLevel && wantsLanguageTips !== null;
      case "main_goal":
        return !!mainGoal;
      default:
        return false;
    }
  })();

  // Anos disponíveis: passado para "living", futuro para os demais.
  const pastYears = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const futureYears = Array.from({ length: 6 }, (_, i) => now.getFullYear() + i);
  const years = journeyStage === "living" ? pastYears : futureYears;

  const restartOnboarding = () => {
    clearOnboardingDraft();
    setStep(1);
    setDirection(1);
    setAttemptedNext(false);
    setSaveError(null);
    setFirstName("");
    setLastName("");
    setPhone(undefined);
    setJourneyStage(null);
    setLocation(null);
    setDestinationCountry(undefined);
    setDestinationCountryCode(undefined);
    setDestinationCity(undefined);
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setPregnancy(null);
    setFamilyStatus(null);
    setHasChildren(null);
    setChildAges({});
    setLanguageLevel(null);
    setWantsLanguageTips(null);
    setMainGoal(null);
    setPlanningMaturity(null);
    setVisaIntent(null);
    setFinancialPrep([]);
    setFirstAccommodation(null);
    setBankingSetup([]);
    setVisaStatus(null);
    setBankAccount(null);
    setWorkType(null);
    setRemittance(null);
    setHousing(null);
  };

  const finish = async () => {
    if (!phone || !journeyStage || !pregnancy) return;
    if (journeyStage === "living" && !location) return;
    if (journeyStage !== "living" && !destinationCountry) return;

    setSaveError(null);
    setSubmitting(true);
    try {
      await setOnboarding({
        phone,
        journeyStage,
        location: journeyStage === "living" ? location ?? undefined : undefined,
        destinationCountry: journeyStage !== "living" ? destinationCountry : undefined,
        destinationCountryCode: journeyStage !== "living" ? destinationCountryCode : undefined,
        destinationCity: journeyStage === "traveling" ? destinationCity : undefined,
        arrivalMonth: month,
        arrivalYear: year,
        pregnancy,
        familyStatus: familyStatus ?? undefined,
        hasChildren: hasChildren ?? undefined,
        childAges: hasChildren ? childAges : undefined,
        languageLevel: languageLevel ?? undefined,
        wantsLanguageTips: wantsLanguageTips ?? undefined,
        mainGoal: mainGoal ?? undefined,
        planningMaturity: journeyStage === "planning" ? planningMaturity ?? undefined : undefined,
        visaIntent: journeyStage === "planning" ? visaIntent ?? undefined : undefined,
        financialPrep: journeyStage === "planning" && financialPrep.length ? financialPrep : undefined,
        firstAccommodation: journeyStage === "traveling" ? firstAccommodation ?? undefined : undefined,
        bankingSetup: journeyStage === "traveling" && bankingSetup.length ? bankingSetup : undefined,
        visaStatus: journeyStage !== "planning" ? visaStatus ?? undefined : undefined,
        bankAccount: journeyStage === "living" ? bankAccount ?? undefined : undefined,
        workType: journeyStage === "living" ? workType ?? undefined : undefined,
        remittance: journeyStage === "living" ? remittance ?? undefined : undefined,
        housing: journeyStage === "living" ? housing ?? undefined : undefined,
      });
      clearOnboardingDraft();
      setSubmitting(false);
      await navigate({ to: "/", replace: true });
      window.setTimeout(() => {
        if (window.location.pathname === "/onboarding") {
          window.location.assign("/");
        }
      }, 300);
    } catch (err) {
      setSubmitting(false);
      const message = err instanceof Error ? err.message : "";
      setSaveError(
        message
          ? `Não foi possível salvar: ${message}`
          : "Não foi possível salvar. Verifique sua conexão e tente novamente.",
      );
    }
  };

  const goNext = async () => {
    if (!canContinue) {
      setAttemptedNext(true);
      return;
    }
    if (currentStepId === "names") {
      void updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() }).catch(
        (err) => {
          console.warn("Could not update profile names during onboarding.", err);
        },
      );
    }
    setSaveError(null);
    setAttemptedNext(false);
    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    } else {
      await finish();
    }
  };

  const goBack = () => {
    if (step > 1) {
      setAttemptedNext(false);
      setDirection(-1);
      setStep(step - 1);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-stretch justify-start bg-background p-0 lg:items-center lg:justify-center lg:bg-secondary/40 lg:p-8">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background px-5 py-7 sm:px-6 lg:min-h-0 lg:max-w-2xl lg:rounded-3xl lg:p-12 lg:shadow-xl">
      {/* Header logo */}
      <div className="flex items-center justify-between pb-6 pt-2">
        <button
          type="button"
          onClick={restartOnboarding}
          className="w-16 text-left text-xs text-muted-foreground hover:text-foreground"
        >
          Recomeçar
        </button>
        <Logo size={32} />
        <button
          type="button"
          onClick={() => logout().catch(() => {})}
          className="w-16 text-right text-xs text-muted-foreground hover:text-foreground"
        >
          Sair
        </button>
      </div>

      {/* Progress */}
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider">
        <span className="text-primary">Etapa {step}/{totalSteps}</span>
        <span className="text-muted-foreground">
          {Math.round((step / totalSteps) * 100)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
      {step > 1 && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={goBack}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </button>
        </div>
      )}

      {/* Animated step container */}
      <div className="relative mt-7 flex-1">
        <div
          key={`${currentStepId}-${step}`}
          className={`animate-[stepIn_0.35s_ease-out] ${submitting ? "pointer-events-none select-none opacity-60" : ""}`}
          style={{
            ["--step-dir" as string]: direction === 1 ? "24px" : "-24px",
          }}
        >
          {currentStepId === "names" && (
            <StepNames
              firstName={firstName}
              lastName={lastName}
              onFirstName={setFirstName}
              onLastName={setLastName}
              showErrors={attemptedNext}
            />
          )}
          {currentStepId === "phone" && <StepPhone value={phone} onChange={setPhone} />}
          {currentStepId === "journey" && (
            <StepJourney value={journeyStage} onChange={setJourneyStage} />
          )}
          {currentStepId === "destination" && (
            <StepDestination
              country={destinationCountry}
              countryCode={destinationCountryCode}
              city={destinationCity}
              onCountry={(name, iso) => {
                setDestinationCountry(name);
                setDestinationCountryCode(iso);
              }}
              onCity={setDestinationCity}
              showCity={journeyStage === "traveling"}
              journeyStage={journeyStage}
            />
          )}
          {currentStepId === "current_location" && (
            <StepCurrentLocation value={location} onChange={setLocation} />
          )}
          {currentStepId === "planning_maturity" && (
            <StepPlanningMaturity value={planningMaturity} onChange={setPlanningMaturity} />
          )}
          {currentStepId === "arrival" && (
            <StepArrival
              month={month}
              year={year}
              years={years}
              onMonth={setMonth}
              onYear={setYear}
              journeyStage={journeyStage}
            />
          )}
          {currentStepId === "visa_intent" && (
            <StepVisaIntent value={visaIntent} onChange={setVisaIntent} />
          )}
          {currentStepId === "visa_status" && (
            <StepVisaStatus value={visaStatus} onChange={setVisaStatus} journeyStage={journeyStage} />
          )}
          {currentStepId === "first_accommodation" && (
            <StepFirstAccommodation value={firstAccommodation} onChange={setFirstAccommodation} />
          )}
          {currentStepId === "family" && (
            <StepFamily
              familyStatus={familyStatus}
              onFamily={setFamilyStatus}
              hasChildren={hasChildren}
              onHasChildren={setHasChildren}
              childAges={childAges}
              onChildAges={setChildAges}
            />
          )}
          {currentStepId === "pregnancy" && (
            <StepPregnancy value={pregnancy} onChange={setPregnancy} />
          )}
          {currentStepId === "financial_prep" && (
            <StepFinancialPrep value={financialPrep} onChange={setFinancialPrep} />
          )}
          {currentStepId === "banking_setup" && (
            <StepBankingSetup value={bankingSetup} onChange={setBankingSetup} />
          )}
          {currentStepId === "bank_account" && (
            <StepBankAccount value={bankAccount} onChange={setBankAccount} />
          )}
          {currentStepId === "work" && (
            <StepWork value={workType} onChange={setWorkType} />
          )}
          {currentStepId === "remittance" && (
            <StepRemittance value={remittance} onChange={setRemittance} />
          )}
          {currentStepId === "housing" && (
            <StepHousing value={housing} onChange={setHousing} />
          )}
          {currentStepId === "language" && (
            <StepLanguage
              level={languageLevel}
              onLevel={setLanguageLevel}
              wantsTips={wantsLanguageTips}
              onWantsTips={setWantsLanguageTips}
            />
          )}
          {currentStepId === "main_goal" && (
            <StepGoal value={mainGoal} onChange={setMainGoal} journeyStage={journeyStage} />
          )}
        </div>
      </div>

      <div className="mb-2 mt-6 flex flex-col gap-2">
        <button
          onClick={goNext}
          disabled={!canContinue || submitting}
          aria-disabled={!canContinue || submitting}
          className="h-12 w-full rounded-xl bg-primary text-base font-semibold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Salvando…" : step < totalSteps ? "Continuar →" : "Começar a usar →"}
        </button>
        {attemptedNext && !canContinue && (
          <p role="alert" className="text-center text-xs text-destructive">
            Responda esta etapa para continuar.
          </p>
        )}
        {saveError && (
          <p role="alert" className="text-center text-xs text-destructive">
            {saveError}
          </p>
        )}
      </div>
      </div>
    </div>
  );
}

/* ============================================================
 * STEP COMPONENTS
 * ============================================================ */

/* ---------------- Step: Names ---------------- */
function StepNames({
  firstName,
  lastName,
  onFirstName,
  onLastName,
  showErrors,
}: {
  firstName: string;
  lastName: string;
  onFirstName: (v: string) => void;
  onLastName: (v: string) => void;
  showErrors?: boolean;
}) {
  const firstError = showErrors && !firstName.trim() ? "Informe seu nome" : null;
  const lastError = showErrors && !lastName.trim() ? "Informe seu sobrenome" : null;
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">Vamos te conhecer</h1>
      <p className="mt-2 text-sm text-muted-foreground">Como podemos te chamar?</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome" htmlFor="onb-first-name" error={firstError}>
          <input
            id="onb-first-name"
            value={firstName}
            onChange={(e) => onFirstName(e.target.value)}
            placeholder="João"
            autoComplete="given-name"
            autoFocus
            aria-invalid={!!firstError || undefined}
            aria-describedby={firstError ? "onb-first-name-error" : undefined}
            className={[
              "h-12 w-full rounded-xl border bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
              firstError ? "border-destructive" : "border-border",
            ].join(" ")}
          />
        </Field>
        <Field label="Sobrenome" htmlFor="onb-last-name" error={lastError}>
          <input
            id="onb-last-name"
            value={lastName}
            onChange={(e) => onLastName(e.target.value)}
            placeholder="Silva"
            autoComplete="family-name"
            aria-invalid={!!lastError || undefined}
            aria-describedby={lastError ? "onb-last-name-error" : undefined}
            className={[
              "h-12 w-full rounded-xl border bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
              lastError ? "border-destructive" : "border-border",
            ].join(" ")}
          />
        </Field>
      </div>
    </>
  );
}

/* ---------------- Step: Phone ---------------- */
function StepPhone({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const invalid = !!value && !isValidPhoneNumber(value);
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">Seu telefone</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Usamos para alertas importantes e contato com suporte.
      </p>
      <div className="mt-6">
        <PhoneField
          label=""
          value={value}
          onChange={onChange}
          defaultCountry="BR"
          invalid={invalid}
          errorMessage="Número inválido"
        />
      </div>
    </>
  );
}

/* ---------------- Step: Journey Stage ---------------- */
function StepJourney({
  value,
  onChange,
}: {
  value: JourneyStage | null;
  onChange: (v: JourneyStage) => void;
}) {
  const options: Array<{
    value: JourneyStage;
    title: string;
    description: string;
  }> = [
    { value: "planning",  title: "Estou planejando",            description: "Ainda no Brasil, organizando a mudança ou viagem." },
    { value: "traveling", title: "Estou viajando / prestes a ir", description: "Datas marcadas ou já em trânsito." },
    { value: "living",    title: "Já moro fora",                description: "Estou estabelecido em outro país." },
  ];
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Em que momento você está?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vamos adaptar a DEZRAIZ para a sua etapa da jornada.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={[
                "w-full rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-background hover:border-primary/40",
              ].join(" ")}
            >
              <p className="text-base font-semibold text-foreground">{opt.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Step: Destination (planning + traveling) ---------------- */
function StepDestination({
  country,
  countryCode,
  city,
  onCountry,
  onCity,
  showCity,
  journeyStage,
}: {
  country: string | undefined;
  countryCode: string | undefined;
  city: string | undefined;
  onCountry: (name: string, iso: string) => void;
  onCity: (city: string | undefined) => void;
  showCity: boolean;
  journeyStage: JourneyStage | null;
}) {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState(city ?? "");

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load countries once
  useEffect(() => {
    fetchCountries()
      .then((list) => {
        setCountries(list);
        setLoadingCountries(false);
        // Restore selected country from prop
        if (countryCode) {
          const match = list.find((c) => c.iso2 === countryCode);
          if (match) setSelectedCountry(match);
        }
      })
      .catch(() => setLoadingCountries(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry || !showCity) return;
    setLoadingStates(true);
    setStates([]);
    setStateName("");
    setCities([]);
    setCityName("");
    onCity(undefined);
    fetchStates(selectedCountry.name)
      .then((s) => { setStates(s); setLoadingStates(false); })
      .catch(() => setLoadingStates(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, showCity]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedCountry || !stateName || !showCity) return;
    setLoadingCities(true);
    setCities([]);
    setCityName("");
    onCity(undefined);
    fetchCities(selectedCountry.name, stateName)
      .then((c) => { setCities(c); setLoadingCities(false); })
      .catch(() => setLoadingCities(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, stateName, showCity]);

  const handleCountryChange = (iso: string) => {
    const c = countries.find((x) => x.iso2 === iso);
    if (!c) return;
    setSelectedCountry(c);
    onCountry(c.name, c.iso2);
    setStateName("");
    setCityName("");
    onCity(undefined);
  };

  const handleCityChange = (v: string) => {
    setCityName(v);
    onCity(v || undefined);
  };

  const headline =
    journeyStage === "planning"
      ? "Para onde você planeja ir?"
      : "Para onde você está indo?";
  const subhead =
    journeyStage === "planning"
      ? "Pode ser só o país — vamos personalizar guias e checklists."
      : "Cidade ajuda a personalizar contatos consulares e dicas locais.";

  const summary = [cityName, stateName, selectedCountry?.name].filter(Boolean).join(", ");

  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{headline}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subhead}</p>

      <div className="mt-6 space-y-3">
        <Field label="País" htmlFor="onb-dest-country">
          <Combobox
            id="onb-dest-country"
            value={selectedCountry?.iso2 ?? ""}
            onChange={handleCountryChange}
            disabled={loadingCountries}
            loading={loadingCountries}
            placeholder="Selecione o país"
            emptyText="Nenhum país encontrado"
            options={countries.map((c) => ({
              value: c.iso2,
              label: `${c.emoji ? c.emoji + " " : ""}${c.name}`,
            }))}
          />
        </Field>

        {showCity && selectedCountry && (
          <Field label="Estado / província" htmlFor="onb-dest-state">
            <Combobox
              id="onb-dest-state"
              value={stateName}
              onChange={setStateName}
              disabled={loadingStates || states.length === 0}
              loading={loadingStates}
              placeholder={states.length === 0 && !loadingStates ? "Indisponível — selecione a cidade abaixo" : "Selecione o estado"}
              emptyText="Nenhum estado encontrado"
              options={states.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        )}

        {showCity && selectedCountry && (stateName || (!loadingStates && states.length === 0)) && (
          <Field label="Cidade (opcional)" htmlFor="onb-dest-city">
            <Combobox
              id="onb-dest-city"
              value={cityName}
              onChange={handleCityChange}
              loading={loadingCities}
              placeholder="Digite ou selecione"
              emptyText="Nenhuma cidade encontrada"
              options={cities.map((c) => ({ value: c, label: c }))}
            />
          </Field>
        )}
      </div>

      {summary && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-foreground">
          <MapPin className="size-4 flex-none translate-y-0.5 text-primary" strokeWidth={1.75} aria-hidden />
          <span>{summary}</span>
        </div>
      )}
    </>
  );
}

/* ---------------- Step: Current Location (living) ---------------- */
function StepCurrentLocation({
  value,
  onChange,
}: {
  value: PreciseLocation | null;
  onChange: (v: PreciseLocation | null) => void;
}) {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [country, setCountry] = useState<CountryItem | null>(null);
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState<"countries" | "states" | "cities" | null>(
    "countries",
  );
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "ok" | "error">("idle");
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries()
      .then((list) => {
        setCountries(list);
        setLoading(null);
      })
      .catch(() => setLoading(null));
  }, []);

  useEffect(() => {
    if (!country) return;
    setLoading("states");
    setStates([]);
    setStateName("");
    setCities([]);
    setCity("");
    fetchStates(country.name)
      .then((s) => {
        setStates(s);
        setLoading(null);
      })
      .catch(() => setLoading(null));
  }, [country]);

  useEffect(() => {
    if (!country || !stateName) return;
    setLoading("cities");
    setCities([]);
    setCity("");
    fetchCities(country.name, stateName)
      .then((c) => {
        setCities(c);
        setLoading(null);
      })
      .catch(() => setLoading(null));
  }, [country, stateName]);

  useEffect(() => {
    if (!country) return;
    onChange({
      ...(value ?? {}),
      country: country.name,
      countryCode: country.iso2,
      state: stateName || undefined,
      city: city || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, stateName, city]);

  const detectLocation = async () => {
    setGeoStatus("locating");
    setGeoError(null);
    try {
      const pos = await getBrowserPosition();
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      const r = await reverseGeocode(coords.latitude, coords.longitude);
      const loc = nominatimToLocation(r, coords);
      onChange(loc);

      const matched = countries.find(
        (c) => c.iso2.toUpperCase() === (loc.countryCode ?? "").toUpperCase(),
      );
      if (matched) {
        setCountry(matched);
        if (loc.state) setStateName(loc.state);
        if (loc.city) setCity(loc.city);
      }
      setGeoStatus("ok");
    } catch (e) {
      setGeoStatus("error");
      setGeoError(
        e instanceof GeolocationPositionError
          ? "Permissão negada ou indisponível."
          : "Não foi possível detectar.",
      );
    }
  };

  const summary = useMemo(() => {
    if (!value) return null;
    return [value.city, value.state, value.country].filter(Boolean).join(", ");
  }, [value]);

  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">Onde você está?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vamos personalizar guias, contatos consulares e alertas locais.
      </p>

      <button
        type="button"
        onClick={detectLocation}
        disabled={geoStatus === "locating"}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary-soft text-sm font-semibold text-primary transition-opacity disabled:opacity-60"
      >
        {geoStatus === "locating" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : geoStatus === "ok" ? (
          <Check className="h-4 w-4" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {geoStatus === "ok" ? "Localização detectada" : "Detectar minha localização"}
      </button>
      {geoError && <p className="mt-2 text-xs text-destructive">{geoError}</p>}

      <div className="mt-5 space-y-3">
        <Field label="País" htmlFor="onb-country">
          <Combobox
            id="onb-country"
            value={country?.iso2 ?? ""}
            onChange={(v) => setCountry(countries.find((c) => c.iso2 === v) ?? null)}
            disabled={loading === "countries"}
            loading={loading === "countries"}
            placeholder="Selecione o país"
            emptyText="Nenhum país encontrado"
            options={countries.map((c) => ({
              value: c.iso2,
              label: `${c.emoji ? c.emoji + " " : ""}${c.name}`,
            }))}
          />
        </Field>

        {country && (
          <Field label="Estado / província" htmlFor="onb-state">
            <Combobox
              id="onb-state"
              value={stateName}
              onChange={setStateName}
              disabled={loading === "states" || states.length === 0}
              loading={loading === "states"}
              placeholder={
                states.length === 0
                  ? "Indisponível — preencha abaixo"
                  : "Selecione o estado"
              }
              emptyText="Nenhum estado encontrado"
              options={states.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        )}

        {country && (stateName || (loading !== "states" && states.length === 0)) && (
          <Field label="Cidade" htmlFor="onb-city">
            <Combobox
              id="onb-city"
              value={city}
              onChange={setCity}
              loading={loading === "cities"}
              placeholder="Digite ou selecione"
              emptyText="Nenhuma cidade encontrada"
              options={cities.map((c) => ({ value: c, label: c }))}
              allowCustomValue
            />
          </Field>
        )}
      </div>

      {summary && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-foreground">
          <MapPin className="size-4 flex-none translate-y-0.5 text-primary" strokeWidth={1.75} aria-hidden />
          <span>{summary}</span>
        </div>
      )}
    </>
  );
}

/* ---------------- Step: Planning Maturity ---------------- */
function StepPlanningMaturity({
  value,
  onChange,
}: {
  value: PlanningMaturity | null;
  onChange: (v: PlanningMaturity) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Em que pé está o planejamento?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vamos focar nas dicas certas para o estágio em que você está.
      </p>
      <div className="mt-6">
        <OptionList<PlanningMaturity>
          value={value}
          onChange={onChange}
          options={[
            { value: "researching",      label: "Estou pesquisando",              description: "Ainda explorando destinos e possibilidades." },
            { value: "decided",          label: "Já decidi para onde vou",        description: "Destino definido, organizando os próximos passos." },
            { value: "docs_in_progress", label: "Documentos em andamento",        description: "Visto, passaporte ou autorização sendo emitidos." },
            { value: "tickets_bought",   label: "Passagens compradas",            description: "Data marcada — hora de fechar os detalhes." },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Arrival ---------------- */
function StepArrival({
  month,
  year,
  years,
  onMonth,
  onYear,
  journeyStage,
}: {
  month: number;
  year: number;
  years: number[];
  onMonth: (m: number) => void;
  onYear: (y: number) => void;
  journeyStage: JourneyStage | null;
}) {
  const isFuture = journeyStage === "planning" || journeyStage === "traveling";
  const headline = isFuture
    ? journeyStage === "planning"
      ? "Quando pretende ir?"
      : "Quando você embarca?"
    : "Quando você chegou?";
  const subhead = isFuture
    ? "Mês e ano previstos — pode ajustar depois."
    : "Mês e ano da sua chegada.";
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{headline}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subhead}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Field label="Mês" htmlFor="onb-month">
          <Combobox
            id="onb-month"
            value={String(month)}
            onChange={(v) => onMonth(Number(v))}
            searchable={false}
            placeholder="Mês"
            options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
          />
        </Field>
        <Field label="Ano" htmlFor="onb-year">
          <Combobox
            id="onb-year"
            value={String(year)}
            onChange={(v) => onYear(Number(v))}
            searchable={false}
            placeholder="Ano"
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
          />
        </Field>
      </div>
    </>
  );
}

/* ---------------- Step: Visa Intent (planning) ---------------- */
function StepVisaIntent({
  value,
  onChange,
}: {
  value: VisaIntent | null;
  onChange: (v: VisaIntent) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Que tipo de visto você pretende?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Direciona quais documentos e prazos vamos te lembrar.
      </p>
      <div className="mt-6">
        <OptionList<VisaIntent>
          value={value}
          onChange={onChange}
          options={[
            { value: "tourist",   label: "Turista",                description: "Vou inicialmente como turista." },
            { value: "work",      label: "Trabalho",               description: "Visto via empresa ou processo seletivo." },
            { value: "student",   label: "Estudante",              description: "Vou estudar fora — graduação, pós ou idiomas." },
            { value: "permanent", label: "Residência permanente",  description: "Cidadania, descendência ou residência definitiva." },
            { value: "unsure",    label: "Ainda não sei",          description: "Pesquisando qual caminho faz mais sentido." },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Visa Status (traveling + living) ---------------- */
function StepVisaStatus({
  value,
  onChange,
  journeyStage,
}: {
  value: VisaStatus | null;
  onChange: (v: VisaStatus) => void;
  journeyStage: JourneyStage | null;
}) {
  const headline =
    journeyStage === "traveling"
      ? "Que visto você está usando para entrar?"
      : "Status atual do seu visto";
  const subhead =
    journeyStage === "traveling"
      ? "Isso ajuda a montar sua checklist de chegada."
      : "Para indicar caminhos certos para o seu caso.";
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{headline}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subhead}</p>
      <div className="mt-6">
        <OptionList<VisaStatus>
          value={value}
          onChange={onChange}
          options={[
            { value: "tourist",      label: "Turista" },
            { value: "work_visa",    label: "Visto de trabalho" },
            { value: "permanent",    label: "Residência permanente" },
            { value: "student",      label: "Estudante" },
            { value: "regularizing", label: journeyStage === "traveling" ? "Em análise" : "Ainda regularizando" },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: First Accommodation (traveling) ---------------- */
function StepFirstAccommodation({
  value,
  onChange,
}: {
  value: FirstAccommodation | null;
  onChange: (v: FirstAccommodation) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Onde vai ficar nos primeiros dias?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Para sugerir o que resolver antes de chegar.
      </p>
      <div className="mt-6">
        <OptionList<FirstAccommodation>
          value={value}
          onChange={onChange}
          options={[
            { value: "hotel",          label: "Hotel ou Airbnb temporário" },
            { value: "friends_family", label: "Casa de amigos / familiares" },
            { value: "rental_ready",   label: "Aluguel já contratado" },
            { value: "undecided",      label: "Ainda decidindo" },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Family ---------------- */
function StepFamily({
  familyStatus,
  onFamily,
  hasChildren,
  onHasChildren,
  childAges,
  onChildAges,
}: {
  familyStatus: FamilyStatus | null;
  onFamily: (v: FamilyStatus) => void;
  hasChildren: boolean | null;
  onHasChildren: (v: boolean) => void;
  childAges: ChildAgeGroup;
  onChildAges: (v: ChildAgeGroup) => void;
}) {
  const ageGroups: { key: keyof ChildAgeGroup; label: string }[] = [
    { key: "baby",  label: "0-2 anos" },
    { key: "kid",   label: "3-12 anos" },
    { key: "teen",  label: "13-17 anos" },
    { key: "adult", label: "18+ anos" },
  ];
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Sua família
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Para personalizar dicas — filhos, escola, saúde da família.
        </p>
      </div>

      <SubField label="Você vai…">
        <OptionList<FamilyStatus>
          value={familyStatus}
          onChange={onFamily}
          options={[
            { value: "alone",         label: "Sozinho(a)" },
            { value: "with_partner",  label: "Com cônjuge" },
            { value: "with_family",   label: "Com filhos / família" },
          ]}
        />
      </SubField>

      <SubField label="Tem filhos?">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onHasChildren(true)}
            className={
              "h-11 rounded-xl border-2 text-sm font-medium transition-colors " +
              (hasChildren === true
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:bg-secondary")
            }
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => {
              onHasChildren(false);
              onChildAges({});
            }}
            className={
              "h-11 rounded-xl border-2 text-sm font-medium transition-colors " +
              (hasChildren === false
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:bg-secondary")
            }
          >
            Não
          </button>
        </div>
        {hasChildren && (
          <div className="mt-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Quais idades? (pode escolher mais de uma)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ageGroups.map((g) => {
                const active = !!childAges[g.key];
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => onChildAges({ ...childAges, [g.key]: !active })}
                    className={
                      "h-10 rounded-lg border text-xs font-medium transition-colors " +
                      (active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary")
                    }
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </SubField>
    </div>
  );
}

/* ---------------- Step: Pregnancy ---------------- */
function StepPregnancy({
  value,
  onChange,
}: {
  value: Pregnancy | null;
  onChange: (v: Pregnancy) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">Você ou sua parceira está grávida?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Para liberar conteúdos sobre maternidade e gestação no exterior.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        <PregnancyCard icon={<Baby className="size-6 text-primary" strokeWidth={1.75} aria-hidden />} label="Sim"               active={value === "yes"}    onClick={() => onChange("yes")} />
        <PregnancyCard icon={<Ban  className="size-6 text-primary" strokeWidth={1.75} aria-hidden />} label="Não"               active={value === "no"}     onClick={() => onChange("no")} />
        <PregnancyCard icon={<Lock className="size-6 text-primary" strokeWidth={1.75} aria-hidden />} label="Prefiro não dizer" active={value === "no_say"} onClick={() => onChange("no_say")} />
      </div>
    </>
  );
}

function PregnancyCard({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors " +
        (active
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:bg-secondary")
      }
    >
      <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </span>
      <span className="font-medium text-foreground">{label}</span>
    </button>
  );
}

/* ---------------- Step: Financial Prep (planning, multi-select) ---------------- */
function StepFinancialPrep({
  value,
  onChange,
}: {
  value: FinancialPrepItem[];
  onChange: (v: FinancialPrepItem[]) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Preparação financeira
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        O que você já fez ou pretende fazer? (pode escolher mais de uma)
      </p>
      <div className="mt-6">
        <MultiSelectList<FinancialPrepItem>
          value={value}
          onChange={onChange}
          options={[
            { value: "has_international_account", label: "Já tenho conta internacional",      description: "Wise, Revolut, Nomad ou similar." },
            { value: "plans_drei",                label: "Pretendo fazer Declaração de Saída", description: "Para sair do regime fiscal brasileiro." },
            { value: "researching_banks",         label: "Pesquisando bancos no destino" },
            { value: "not_yet",                   label: "Ainda não pensei nisso" },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Banking Setup (traveling, multi-select) ---------------- */
function StepBankingSetup({
  value,
  onChange,
}: {
  value: BankingSetupItem[];
  onChange: (v: BankingSetupItem[]) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Como está o setup financeiro?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        O que você já tem em mãos? (pode escolher mais de uma)
      </p>
      <div className="mt-6">
        <MultiSelectList<BankingSetupItem>
          value={value}
          onChange={onChange}
          options={[
            { value: "has_local_account",         label: "Já abri conta no destino" },
            { value: "has_international_account", label: "Tenho conta digital internacional", description: "Wise, Revolut ou similar." },
            { value: "will_open_locally",         label: "Vou abrir conta ao chegar" },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Bank Account (living) ---------------- */
function StepBankAccount({
  value,
  onChange,
}: {
  value: BankAccountStatus | null;
  onChange: (v: BankAccountStatus) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Conta bancária local
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Já abriu conta no país onde mora?
      </p>
      <div className="mt-6">
        <OptionList<BankAccountStatus>
          value={value}
          onChange={onChange}
          options={[
            { value: "yes",         label: "Sim" },
            { value: "no",          label: "Não" },
            { value: "in_progress", label: "Estou abrindo" },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Work (living) ---------------- */
function StepWork({
  value,
  onChange,
}: {
  value: WorkType | null;
  onChange: (v: WorkType) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Como você trabalha?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Define dicas de imposto, contratos e remuneração.
      </p>
      <div className="mt-6">
        <OptionList<WorkType>
          value={value}
          onChange={onChange}
          options={[
            { value: "employed",    label: "Carteira assinada / CLT local" },
            { value: "freelancer",  label: "Autônomo / freelancer" },
            { value: "not_working", label: "Ainda não estou trabalhando" },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Remittance (living) ---------------- */
function StepRemittance({
  value,
  onChange,
}: {
  value: RemittanceFrequency | null;
  onChange: (v: RemittanceFrequency) => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        Envia dinheiro pro Brasil?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Para comparar cotações e indicar os melhores apps.
      </p>
      <div className="mt-6">
        <OptionList<RemittanceFrequency>
          value={value}
          onChange={onChange}
          options={[
            { value: "never",     label: "Nunca" },
            { value: "sometimes", label: "Às vezes" },
            { value: "monthly",   label: "Todo mês" },
          ]}
        />
      </div>
    </>
  );
}

/* ---------------- Step: Housing (living) ---------------- */
function StepHousing({
  value,
  onChange,
}: {
  value: HousingStatus | null;
  onChange: (v: HousingStatus) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          E a moradia?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Para sugerir bairros, contratos e o que mais importa agora.
        </p>
      </div>
      <OptionList<HousingStatus>
        value={value}
        onChange={onChange}
        options={[
          { value: "fixed",         label: "Já tenho moradia fixa" },
          { value: "renting",       label: "Moro de aluguel" },
          { value: "with_friends",  label: "Estou com conhecidos por enquanto" },
          { value: "searching",     label: "Ainda estou procurando" },
        ]}
      />
    </div>
  );
}

/* ---------------- Step: Language ---------------- */
function StepLanguage({
  level,
  onLevel,
  wantsTips,
  onWantsTips,
}: {
  level: LanguageLevel | null;
  onLevel: (v: LanguageLevel) => void;
  wantsTips: boolean | null;
  onWantsTips: (v: boolean) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          E o idioma?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A IA ajusta o tom e indica termos locais quando precisar.
        </p>
      </div>

      <SubField label="Seu nível no idioma do país">
        <OptionList<LanguageLevel>
          value={level}
          onChange={onLevel}
          options={[
            { value: "basic",  label: "Básico",  description: "Travo nas conversas do dia a dia" },
            { value: "manage", label: "Me viro", description: "Falo o necessário, com sotaque" },
            { value: "fluent", label: "Fluente", description: "Trabalho e converso sem dificuldade" },
          ]}
        />
      </SubField>

      <SubField label="Quer dicas para melhorar o idioma local?">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onWantsTips(true)}
            className={
              "h-11 rounded-xl border-2 text-sm font-medium transition-colors " +
              (wantsTips === true
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:bg-secondary")
            }
          >
            Sim, quero
          </button>
          <button
            type="button"
            onClick={() => onWantsTips(false)}
            className={
              "h-11 rounded-xl border-2 text-sm font-medium transition-colors " +
              (wantsTips === false
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:bg-secondary")
            }
          >
            Agora não
          </button>
        </div>
      </SubField>
    </div>
  );
}

/* ---------------- Step: Main Goal ---------------- */
function StepGoal({
  value,
  onChange,
  journeyStage,
}: {
  value: MainGoal | null;
  onChange: (v: MainGoal) => void;
  journeyStage: JourneyStage | null;
}) {
  const headline =
    journeyStage === "planning"
      ? "Sua maior preocupação agora?"
      : journeyStage === "traveling"
        ? "Prioridade nas primeiras semanas?"
        : "O que é mais urgente agora?";
  const subhead = "Vamos colocar isso no topo das suas dicas.";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{headline}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subhead}</p>
      </div>
      <OptionList<MainGoal>
        value={value}
        onChange={onChange}
        options={[
          { value: "documents",    label: "Resolver documentação",      description: "Vistos, RNE, CPF, certidões e burocracia." },
          { value: "job",          label: "Encontrar emprego",           description: "CLT local, freelance ou revalidação de carreira." },
          { value: "bring_family", label: "Trazer a família",            description: "Reunificação familiar, escola e moradia." },
          { value: "language",     label: "Aprender o idioma",           description: "Fluência no dia a dia e no trabalho." },
          { value: "adapt",        label: "Me adaptar à vida aqui",      description: "Rotina, cultura e bem-estar no novo país." },
          { value: "planning",     label: "Ainda estou me planejando",   description: "Quero entender as opções antes de decidir." },
        ]}
      />
    </div>
  );
}

/* ============================================================
 * SHARED HELPER COMPONENTS
 * ============================================================ */

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function SubField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

/* ---------------- Single-select option list ---------------- */
function OptionList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description?: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              "flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-colors " +
              (active
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:bg-secondary")
            }
          >
            <span
              className={
                "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition-colors " +
                (active ? "border-primary bg-primary" : "border-border")
              }
            >
              {active && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              {opt.description && (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {opt.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Multi-select option list ---------------- */
function MultiSelectList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description?: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  const toggle = (v: T) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {options.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={
              "flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-colors " +
              (active
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:bg-secondary")
            }
          >
            <span
              className={
                "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded border-2 transition-colors " +
                (active ? "border-primary bg-primary" : "border-border")
              }
            >
              {active && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              {opt.description && (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {opt.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Combobox (searchable dropdown) ---------------- */
function Combobox({
  id,
  value,
  onChange,
  options,
  loading,
  placeholder,
  emptyText = "Nenhum resultado encontrado",
  loadingText = "Carregando...",
  disabled,
  searchable = true,
  renderOption,
  displayValue,
  error,
  allowCustomValue = false,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
  loadingText?: string;
  disabled?: boolean;
  searchable?: boolean;
  renderOption?: (o: { value: string; label: string }) => React.ReactNode;
  displayValue?: (v: string) => string;
  error?: string | null;
  allowCustomValue?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openUp, setOpenUp] = useState(false);
  const inputId = id ?? "combobox";
  const listboxId = `${inputId}-listbox`;
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const inputText = searchable
    ? open
      ? query
      : (displayValue?.(value) ??
        options.find((o) => o.value === value)?.label ??
        (allowCustomValue ? value : ""))
    : (displayValue?.(value) ??
      options.find((o) => o.value === value)?.label ??
      (allowCustomValue ? value : ""));

  const filtered = useMemo(() => {
    if (!searchable) return options.slice(0, 200);
    const q = query.trim().toLowerCase();
    const list = q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
    return list.slice(0, 200);
  }, [options, query, searchable]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, options, value]);

  useLayoutEffect(() => {
    if (!open) return;
    const recalc = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUp(spaceBelow < 240 && spaceAbove > spaceBelow);
    };
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const commit = (v: string) => {
    onChange(v);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  };

  const justOpenedRef = useRef(false);

  const toggleOpen = () => {
    if (disabled) return;
    if (justOpenedRef.current) {
      justOpenedRef.current = false;
      return;
    }
    setOpen((o) => !o);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        commit(filtered[activeIndex].value);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-autocomplete={searchable ? "list" : "none"}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        disabled={disabled}
        readOnly={!searchable}
        value={inputText}
        onChange={(e) => {
          if (!searchable) return;
          const next = e.target.value;
          setQuery(next);
          if (allowCustomValue) onChange(next);
          setOpen(true);
        }}
        onFocus={() => {
          setFocused(true);
          if (!open) {
            if (allowCustomValue) setQuery(value);
            justOpenedRef.current = true;
            setOpen(true);
          }
        }}
        onBlur={() => {
          setFocused(false);
          if (allowCustomValue) {
            const next = query.trim();
            if (next !== value) onChange(next);
          }
        }}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        placeholder={loading ? loadingText : placeholder ?? "Selecione"}
        aria-invalid={!!error || undefined}
        className={[
          "h-12 w-full rounded-xl border bg-background px-4 pr-11 text-base text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          error
            ? "border-destructive ring-2 ring-destructive/30"
            : focused
              ? "border-primary ring-2 ring-primary/30"
              : "border-border",
        ].join(" ")}
      />
      <span className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground">
        <ChevronDown
          className={["h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0"].join(
            " ",
          )}
        />
      </span>
      {open && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          className={[
            "absolute left-0 right-0 z-50 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg",
            openUp ? "bottom-full mb-2" : "top-full mt-2",
          ].join(" ")}
        >
          {filtered.length > 0 ? (
            filtered.map((o, idx) => {
              const isActive = idx === activeIndex;
              const isSelected = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    id={`${listboxId}-opt-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => commit(o.value)}
                    className={[
                      "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : isSelected
                          ? "bg-accent/60 text-accent-foreground"
                          : "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                    ].join(" ")}
                  >
                    <span className="flex-1 truncate">
                      {renderOption ? renderOption(o) : o.label}
                    </span>
                    {isSelected && <Check className="ml-2 h-4 w-4 flex-none" />}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-2.5 text-sm text-muted-foreground">{emptyText}</li>
          )}
        </ul>
      )}
    </div>
  );
}
