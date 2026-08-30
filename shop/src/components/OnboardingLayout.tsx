import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";
import { SellHeader } from "./SellHeader";
import { TOTAL_STEPS } from "../lib/onboarding";

type Props = {
  step: number;
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  backTo?: string;
  draftSaved?: boolean;
};

export function OnboardingLayout({
  step,
  title,
  children,
  onBack,
  backTo,
  draftSaved,
}: Props) {
  const navigate = useNavigate();
  const savedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (draftSaved && savedRef.current) {
      savedRef.current.classList.add("visible");
      const t = setTimeout(() => savedRef.current?.classList.remove("visible"), 2000);
      return () => clearTimeout(t);
    }
  }, [draftSaved]);

  function handleBack() {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else if (step > 1) {
      navigate(`/onboarding/${step - 1}`);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="onboarding-shell">
      <SellHeader hideSellerCta />
      <div className="onboarding-body">
        <button type="button" className="back-link" onClick={handleBack}>
          ← Back
        </button>
        <ProgressBar current={step} total={TOTAL_STEPS} />
        <h1 className="onboarding-title">{title}</h1>
        <span ref={savedRef} className="draft-saved" aria-live="polite">
          Draft saved
        </span>
        {children}
      </div>
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="notice">{children}</p>;
}

export function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <span className={`char-count ${current > max ? "over" : ""}`}>
      {current}/{max}
    </span>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="toggle">
      <span>{label}</span>
      <button
        type="button"
        className={`toggle-btn ${on ? "on" : ""}`}
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  max,
}: {
  options: { id: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  max?: number;
}) {
  function toggle(id: T) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else if (!max || value.length < max) {
      onChange([...value, id]);
    }
  }

  return (
    <div className="chip-grid">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`chip ${value.includes(opt.id) ? "selected" : ""}`}
          onClick={() => toggle(opt.id)}
          disabled={!value.includes(opt.id) && max !== undefined && value.length >= max}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { id: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div className="radio-group">
      {options.map((opt) => (
        <label key={opt.id} className="radio-row">
          <input
            type="radio"
            name={name}
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export function ExitLink() {
  return (
    <Link to="/" className="exit-link">
      Save & exit — resume anytime
    </Link>
  );
}
