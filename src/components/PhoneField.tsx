import { useEffect, useId, useRef, useState } from "react";
import { AsYouType, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { AlertCircle } from "lucide-react";
import { CountrySelector } from "@/components/CountrySelector";
import { callingCode } from "@/lib/countries";

interface Props {
  /** E.164 string ("+5511…") — empty when blank. */
  value: string | undefined;
  onChange: (e164: string | undefined) => void;
  /** Default country when value is empty. */
  defaultCountry?: CountryCode;
  /** Show validation error styling. */
  invalid?: boolean;
  label?: string;
  errorMessage?: string;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  placeholder?: string;
  required?: boolean;
}

/**
 * Unified phone field: CountrySelector pill + national-number input,
 * sharing a single visual border. Formats as the user types and keeps
 * the parent value as a normalized E.164 string.
 */
export function PhoneField({
  value,
  onChange,
  defaultCountry = "BR",
  invalid,
  label = "Telefone",
  errorMessage,
  inputRef,
  placeholder = "Digite seu número",
  required,
}: Props) {
  const reactId = useId();
  const inputId = `phone-${reactId}`;

  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [national, setNational] = useState("");
  const [focused, setFocused] = useState(false);
  const internalRef = useRef<HTMLInputElement | null>(null);
  const ref = inputRef ?? internalRef;

  // Sync from controlled value on mount / external changes.
  useEffect(() => {
    if (!value) return;
    const parsed = parsePhoneNumberFromString(value);
    if (parsed?.country) {
      setCountry(parsed.country);
      setNational(parsed.formatNational());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (nextNational: string, nextCountry: CountryCode) => {
    if (!nextNational.trim()) {
      onChange(undefined);
      return;
    }
    const parsed = parsePhoneNumberFromString(nextNational, nextCountry);
    onChange(parsed ? parsed.number : `+${callingCode(nextCountry)}${nextNational.replace(/\D/g, "")}`);
  };

  const onInput = (raw: string) => {
    // Format as the user types in the selected country's style.
    const formatter = new AsYouType(country);
    const formatted = formatter.input(raw);
    setNational(formatted);
    emit(formatted, country);
  };

  const onCountryChange = (iso2: string) => {
    const cc = iso2 as CountryCode;
    setCountry(cc);
    // Re-format current digits in the new country style.
    const digits = national.replace(/\D/g, "");
    if (digits) {
      const reformatted = new AsYouType(cc).input(digits);
      setNational(reformatted);
      emit(reformatted, cc);
    } else {
      emit("", cc);
    }
    // Move focus to the input so the user can keep typing.
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div
        className={[
          "flex h-12 items-stretch overflow-hidden rounded-xl border bg-background transition-all",
          invalid
            ? "border-[var(--color-state-error)] ring-2 ring-[var(--color-state-error)]/40"
            : focused
              ? "border-primary ring-2 ring-primary/30"
              : "border-border",
        ].join(" ")}
      >
        <CountrySelector value={country} onChange={onCountryChange} />
        <span aria-hidden className="my-2 w-px bg-border" />
        <input
          id={inputId}
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={national}
          placeholder={placeholder}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid && errorMessage ? `${inputId}-err` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {invalid && errorMessage && (
        <p
          id={`${inputId}-err`}
          className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--color-state-error)]"
        >
          <AlertCircle className="size-4 flex-none" strokeWidth={1.75} aria-hidden />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
