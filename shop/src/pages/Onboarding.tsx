import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CharCount,
  ChipSelect,
  ExitLink,
  Notice,
  OnboardingLayout,
  RadioGroup,
  Toggle,
} from "../components/OnboardingLayout";
import { PhotoUpload } from "../components/PhotoUpload";
import {
  emptyDraft,
  stepTitle,
  TOTAL_STEPS,
  validateStep,
} from "../lib/onboarding";
import { formatTzPhone } from "../lib/validation";
import {
  clearDraft,
  loadDraft,
  loadProfile,
  saveDraft,
  saveProfile,
} from "../storage";
import type { OnboardingDraft } from "../types";
import {
  DAYS,
  FLOORS,
  MOBILE_MONEY_PROVIDERS,
  SHOP_CATEGORIES,
} from "../types";

export function OnboardingPage() {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  const step = Math.min(
    TOTAL_STEPS,
    Math.max(1, Number(stepParam) || 1),
  );

  const [draft, setDraft] = useState<OnboardingDraft>(
    () => loadDraft() ?? emptyDraft(),
  );
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const persist = useCallback((next: OnboardingDraft) => {
    setDraft(next);
    saveDraft(next);
    setSaved(true);
  }, []);

  useEffect(() => {
    const profile = loadProfile();
    if (profile?.status === "active") {
      navigate("/dashboard", { replace: true });
    } else if (profile?.status === "pending_review") {
      navigate("/pending", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!stepParam) {
      const d = loadDraft();
      navigate(`/onboarding/${d?.currentStep ?? 1}`, { replace: true });
    }
  }, [stepParam, navigate]);

  function updateStep<S extends keyof OnboardingDraft>(
    stepKey: S,
    patch: Partial<OnboardingDraft[S]>,
  ) {
    persist({
      ...draft,
      [stepKey]: { ...(draft[stepKey] as object), ...patch },
      currentStep: step,
    });
  }

  function goNext() {
    const validationErr = validateStep(draft, step);
    if (validationErr) {
      setErr(validationErr);
      return;
    }
    setErr(null);
    if (step < TOTAL_STEPS) {
      const next = { ...draft, currentStep: step + 1 };
      persist(next);
      navigate(`/onboarding/${step + 1}`);
    } else {
      submitApplication();
    }
  }

  function submitApplication() {
    const shopId = `shop_${Date.now().toString(36)}`;
    const profile = {
      ...draft,
      status: "pending_review" as const,
      shopId,
      submittedAt: new Date().toISOString(),
      viewsToday: 0,
      viewsThisWeek: 0,
    };
    saveProfile(profile);
    clearDraft();
    navigate("/pending");
  }

  return (
    <OnboardingLayout
      step={step}
      title={stepTitle(step)}
      draftSaved={saved}
      onBack={() => {
        if (step > 1) navigate(`/onboarding/${step - 1}`);
        else navigate("/");
      }}
    >
      {step === 1 && (
        <Step1
          draft={draft}
          updateStep={updateStep}
          err={err}
          onNext={goNext}
        />
      )}
      {step === 2 && (
        <Step2
          draft={draft}
          updateStep={updateStep}
          err={err}
          onNext={goNext}
        />
      )}
      {step === 3 && (
        <Step3
          draft={draft}
          updateStep={updateStep}
          err={err}
          onNext={goNext}
        />
      )}
      {step === 4 && (
        <Step4
          draft={draft}
          updateStep={updateStep}
          err={err}
          onNext={goNext}
        />
      )}
      {step === 5 && (
        <Step5
          draft={draft}
          updateStep={updateStep}
          err={err}
          onNext={goNext}
        />
      )}
      {step === 6 && (
        <Step6
          draft={draft}
          updateStep={updateStep}
          err={err}
          onNext={goNext}
        />
      )}
      <ExitLink />
    </OnboardingLayout>
  );
}

type StepProps = {
  draft: OnboardingDraft;
  updateStep: <S extends keyof OnboardingDraft>(
    stepKey: S,
    patch: Partial<OnboardingDraft[S]>,
  ) => void;
  err: string | null;
  onNext: () => void;
};

function Step1({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step1;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <label className="lbl">Shop name *</label>
      <input
        className="field"
        value={s.shopName}
        onChange={(e) => updateStep("step1", { shopName: e.target.value })}
        placeholder="e.g. Mama Asha's Fabrics"
        required
      />

      <label className="lbl">Category (max 2) *</label>
      <ChipSelect
        options={SHOP_CATEGORIES}
        value={s.categories}
        onChange={(v) => updateStep("step1", { categories: v })}
        max={2}
      />

      <PhotoUpload
        label="Shop profile photo"
        value={s.profilePhoto}
        onChange={(v) => updateStep("step1", { profilePhoto: v })}
        required
      />

      <label className="lbl">
        Short description{" "}
        <CharCount current={s.description.length} max={120} />
      </label>
      <textarea
        className="field"
        value={s.description}
        onChange={(e) => updateStep("step1", { description: e.target.value })}
        maxLength={130}
        placeholder="What do you sell?"
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        Continue
      </button>
    </form>
  );
}

function Step2({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step2;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <p className="hint">No GPS — we use your stall details inside Kariakoo.</p>

      <label className="lbl">Street / lane name *</label>
      <input
        className="field"
        value={s.street}
        onChange={(e) => updateStep("step2", { street: e.target.value })}
        placeholder="e.g. Mchikichini Lane"
        required
      />

      <label className="lbl">Stall or shop number *</label>
      <input
        className="field"
        value={s.stallNumber}
        onChange={(e) => updateStep("step2", { stallNumber: e.target.value })}
        placeholder="e.g. B-42"
        required
      />

      <label className="lbl">Floor *</label>
      <RadioGroup
        name="floor"
        options={FLOORS}
        value={s.floor}
        onChange={(v) => updateStep("step2", { floor: v })}
      />

      <label className="lbl">Block or building name</label>
      <input
        className="field"
        value={s.blockName}
        onChange={(e) => updateStep("step2", { blockName: e.target.value })}
        placeholder="Optional"
      />

      <label className="lbl">
        Landmark hint{" "}
        <CharCount current={s.landmark.length} max={80} />
      </label>
      <input
        className="field"
        value={s.landmark}
        onChange={(e) => updateStep("step2", { landmark: e.target.value })}
        placeholder='e.g. "next to Vodacom kiosk"'
        maxLength={90}
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        Continue
      </button>
    </form>
  );
}

function Step3({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step3;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <label className="lbl">Primary phone number *</label>
      <input
        className="field"
        type="tel"
        inputMode="tel"
        value={s.primaryPhone}
        onChange={(e) => updateStep("step3", { primaryPhone: e.target.value })}
        placeholder="+255 7XX XXX XXX"
        required
      />
      {s.primaryPhone && (
        <p className="hint">{formatTzPhone(s.primaryPhone)}</p>
      )}

      <Toggle
        label="WhatsApp same as primary"
        on={s.whatsappSame}
        onChange={(v) => updateStep("step3", { whatsappSame: v })}
      />

      {!s.whatsappSame && (
        <>
          <label className="lbl">WhatsApp number *</label>
          <input
            className="field"
            type="tel"
            inputMode="tel"
            value={s.whatsappPhone}
            onChange={(e) =>
              updateStep("step3", { whatsappPhone: e.target.value })
            }
            placeholder="+255 7XX XXX XXX"
          />
        </>
      )}

      <label className="lbl">Preferred language</label>
      <RadioGroup
        name="language"
        options={[
          { id: "english" as const, label: "English" },
          { id: "swahili" as const, label: "Swahili" },
        ]}
        value={s.language}
        onChange={(v) => updateStep("step3", { language: v })}
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        Continue
      </button>
    </form>
  );
}

function Step4({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step4;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <Notice>
        Your ID is used only for payment verification and fraud prevention. It
        is never shown to buyers.
      </Notice>

      <label className="lbl">Full legal name (must match ID) *</label>
      <input
        className="field"
        value={s.legalName}
        onChange={(e) => updateStep("step4", { legalName: e.target.value })}
        required
      />

      <label className="lbl">NIDA number (20 digits) *</label>
      <input
        className="field"
        inputMode="numeric"
        value={s.nidaNumber}
        onChange={(e) =>
          updateStep("step4", {
            nidaNumber: e.target.value.replace(/\D/g, "").slice(0, 20),
          })
        }
        placeholder="XXXXXXXXXXXXXXXXXXXX"
        maxLength={20}
        required
      />

      <PhotoUpload
        label="ID photo — front"
        value={s.idFront}
        onChange={(v) => updateStep("step4", { idFront: v })}
        required
      />

      <PhotoUpload
        label="ID photo — back"
        value={s.idBack}
        onChange={(v) => updateStep("step4", { idBack: v })}
        required
      />

      <PhotoUpload
        label="Selfie holding ID"
        value={s.selfieWithId}
        onChange={(v) => updateStep("step4", { selfieWithId: v })}
        cameraOnly
        required
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        Continue
      </button>
    </form>
  );
}

function Step5({
  draft,
  updateStep,
  err,
  onNext,
}: StepProps) {
  const s = draft.step5;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <Notice>
        Payments are released to this number after buyer confirms receipt.
      </Notice>

      <label className="lbl">Mobile money provider *</label>
      <RadioGroup
        name="provider"
        options={MOBILE_MONEY_PROVIDERS.map((p) => ({
          id: p.id,
          label: p.label,
        }))}
        value={s.provider}
        onChange={(v) => updateStep("step5", { provider: v })}
      />

      <label className="lbl">Mobile money number *</label>
      <input
        className="field"
        type="tel"
        inputMode="tel"
        value={s.mobileMoneyNumber}
        onChange={(e) =>
          updateStep("step5", { mobileMoneyNumber: e.target.value })
        }
        placeholder="+255 7XX XXX XXX"
        required
      />

      <label className="lbl">Account name (must match legal name) *</label>
      <input
        className="field"
        value={s.accountName}
        onChange={(e) => updateStep("step5", { accountName: e.target.value })}
        placeholder={draft.step4.legalName || "As on ID"}
        required
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        Continue
      </button>
    </form>
  );
}

function Step6({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step6;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <label className="lbl">Open days *</label>
      <ChipSelect
        options={DAYS}
        value={s.openDays}
        onChange={(v) => updateStep("step6", { openDays: v })}
      />

      <label className="lbl">Opening time</label>
      <input
        className="field"
        type="time"
        value={s.openingTime}
        onChange={(e) => updateStep("step6", { openingTime: e.target.value })}
      />

      <label className="lbl">Closing time</label>
      <input
        className="field"
        type="time"
        value={s.closingTime}
        onChange={(e) => updateStep("step6", { closingTime: e.target.value })}
      />

      <Toggle
        label="Closed on public holidays"
        on={s.closedOnHolidays}
        onChange={(v) => updateStep("step6", { closedOnHolidays: v })}
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        Submit for review
      </button>
      <p className="hint">
        Your shop will be reviewed within 24 hours. No auto-approval.
      </p>
    </form>
  );
}
