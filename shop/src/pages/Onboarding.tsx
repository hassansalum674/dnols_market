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
  TOTAL_STEPS,
  validateStep,
} from "../lib/onboarding";
import { stepTitleI18n, shopT } from "../lib/i18n";
import { shopIdFromUid } from "../lib/accountId";
import { languageFromSeller, languageToSeller } from "../lib/sharedPrefs";
import { useAuth } from "../store/auth";
import { loadSettings, saveSettings } from "../store/settings";
import { DASHBOARD_PATH } from "../lib/shopRoutes";
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
  const { user } = useAuth();
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
    const pref = languageToSeller(loadSettings().language);
    setDraft((current) => {
      if (current.step3.language === pref) return current;
      const next = {
        ...current,
        step3: { ...current.step3, language: pref },
      };
      saveDraft(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const profile = loadProfile();
    if (profile?.status === "active") {
      navigate(DASHBOARD_PATH, { replace: true });
    } else if (profile?.status === "pending_review") {
      navigate("/pending", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.documentElement.lang =
      draft.step3.language === "english" ? "en" : "sw";
  }, [draft.step3.language]);

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
    const shopId = user?.uid
      ? shopIdFromUid(user.uid)
      : `shop_${Date.now().toString(36)}`;
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
      title={stepTitleI18n(step, draft.step3.language)}
      draftSaved={saved}
      language={draft.step3.language}
      onLanguageChange={(language) => {
        saveSettings({ language: languageFromSeller(language) });
        updateStep("step3", { language });
      }}
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
      <ExitLink language={draft.step3.language} />
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
  const lang = draft.step3.language;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <label className="lbl">{shopT(lang, "shopName")}</label>
      <input
        className="field"
        value={s.shopName}
        onChange={(e) => updateStep("step1", { shopName: e.target.value })}
        required
      />

      <label className="lbl">{shopT(lang, "category")}</label>
      <ChipSelect
        options={SHOP_CATEGORIES}
        value={s.categories}
        onChange={(v) => updateStep("step1", { categories: v })}
        max={2}
      />

      <PhotoUpload
        label={shopT(lang, "shopPhoto")}
        value={s.profilePhoto}
        onChange={(v) => updateStep("step1", { profilePhoto: v })}
        required
      />

      <label className="lbl">
        {shopT(lang, "shortDesc")}{" "}
        <CharCount current={s.description.length} max={120} />
      </label>
      <textarea
        className="field"
        value={s.description}
        onChange={(e) => updateStep("step1", { description: e.target.value })}
        maxLength={130}
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        {shopT(lang, "continue")}
      </button>
    </form>
  );
}

function Step2({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step2;
  const lang = draft.step3.language;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <p className="hint">{shopT(lang, "noGps")}</p>

      <label className="lbl">{shopT(lang, "street")}</label>
      <input
        className="field"
        value={s.street}
        onChange={(e) => updateStep("step2", { street: e.target.value })}
        required
      />

      <label className="lbl">{shopT(lang, "stallNumber")}</label>
      <input
        className="field"
        value={s.stallNumber}
        onChange={(e) => updateStep("step2", { stallNumber: e.target.value })}
        required
      />

      <label className="lbl">{shopT(lang, "floor")}</label>
      <RadioGroup
        name="floor"
        options={FLOORS}
        value={s.floor}
        onChange={(v) => updateStep("step2", { floor: v })}
      />

      <label className="lbl">{shopT(lang, "block")}</label>
      <input
        className="field"
        value={s.blockName}
        onChange={(e) => updateStep("step2", { blockName: e.target.value })}
      />

      <label className="lbl">
        {shopT(lang, "landmark")}{" "}
        <CharCount current={s.landmark.length} max={80} />
      </label>
      <input
        className="field"
        value={s.landmark}
        onChange={(e) => updateStep("step2", { landmark: e.target.value })}
        maxLength={90}
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        {shopT(lang, "continue")}
      </button>
    </form>
  );
}

function Step3({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step3;
  const lang = s.language;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <label className="lbl">{shopT(lang, "primaryPhone")}</label>
      <input
        className="field"
        type="tel"
        inputMode="tel"
        placeholder="+255 6XX or 7XX XXX XXX"
        value={s.primaryPhone}
        onChange={(e) => updateStep("step3", { primaryPhone: e.target.value })}
        required
      />
      {s.primaryPhone && (
        <p className="hint">{formatTzPhone(s.primaryPhone)}</p>
      )}

      <Toggle
        label={shopT(lang, "whatsappSame")}
        on={s.whatsappSame}
        onChange={(v) => updateStep("step3", { whatsappSame: v })}
      />

      {!s.whatsappSame && (
        <>
          <label className="lbl">{shopT(lang, "whatsapp")}</label>
          <input
            className="field"
            type="tel"
            inputMode="tel"
            placeholder="+255 6XX or 7XX XXX XXX"
            value={s.whatsappPhone}
            onChange={(e) =>
              updateStep("step3", { whatsappPhone: e.target.value })
            }
          />
        </>
      )}

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        {shopT(lang, "continue")}
      </button>
    </form>
  );
}

function Step4({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step4;
  const lang = draft.step3.language;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <Notice>{shopT(lang, "idNotice")}</Notice>

      <label className="lbl">{shopT(lang, "legalName")}</label>
      <input
        className="field"
        value={s.legalName}
        onChange={(e) => updateStep("step4", { legalName: e.target.value })}
        required
      />

      <label className="lbl">{shopT(lang, "nida")}</label>
      <input
        className="field"
        inputMode="numeric"
        value={s.nidaNumber}
        onChange={(e) =>
          updateStep("step4", {
            nidaNumber: e.target.value.replace(/\D/g, "").slice(0, 20),
          })
        }
        maxLength={20}
        required
      />

      <PhotoUpload
        label={shopT(lang, "idFront")}
        value={s.idFront}
        onChange={(v) => updateStep("step4", { idFront: v })}
        required
      />

      <PhotoUpload
        label={shopT(lang, "idBack")}
        value={s.idBack}
        onChange={(v) => updateStep("step4", { idBack: v })}
        required
      />

      <PhotoUpload
        label={shopT(lang, "selfie")}
        value={s.selfieWithId}
        onChange={(v) => updateStep("step4", { selfieWithId: v })}
        cameraOnly
        required
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        {shopT(lang, "continue")}
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
  const lang = draft.step3.language;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <Notice>{shopT(lang, "payoutNotice")}</Notice>

      <label className="lbl">{shopT(lang, "mmProvider")}</label>
      <RadioGroup
        name="provider"
        options={MOBILE_MONEY_PROVIDERS.map((p) => ({
          id: p.id,
          label: p.label,
        }))}
        value={s.provider}
        onChange={(v) => updateStep("step5", { provider: v })}
      />

      <label className="lbl">{shopT(lang, "mmNumber")}</label>
      <input
        className="field"
        type="tel"
        inputMode="tel"
        value={s.mobileMoneyNumber}
        onChange={(e) =>
          updateStep("step5", { mobileMoneyNumber: e.target.value })
        }
        required
      />

      <label className="lbl">{shopT(lang, "accountName")}</label>
      <input
        className="field"
        value={s.accountName}
        onChange={(e) => updateStep("step5", { accountName: e.target.value })}
        required
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        {shopT(lang, "continue")}
      </button>
    </form>
  );
}

function Step6({ draft, updateStep, err, onNext }: StepProps) {
  const s = draft.step6;
  const lang = draft.step3.language;
  return (
    <form
      className="onboarding-form"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <label className="lbl">{shopT(lang, "openDays")}</label>
      <ChipSelect
        options={DAYS}
        value={s.openDays}
        onChange={(v) => updateStep("step6", { openDays: v })}
      />

      <label className="lbl">{shopT(lang, "openingTime")}</label>
      <input
        className="field"
        type="time"
        value={s.openingTime}
        onChange={(e) => updateStep("step6", { openingTime: e.target.value })}
      />

      <label className="lbl">{shopT(lang, "closingTime")}</label>
      <input
        className="field"
        type="time"
        value={s.closingTime}
        onChange={(e) => updateStep("step6", { closingTime: e.target.value })}
      />

      <Toggle
        label={shopT(lang, "closedHolidays")}
        on={s.closedOnHolidays}
        onChange={(v) => updateStep("step6", { closedOnHolidays: v })}
      />

      {err && <p className="err">{err}</p>}
      <button type="submit" className="btn">
        {shopT(lang, "submitReview")}
      </button>
      <p className="hint">{shopT(lang, "reviewHint")}</p>
    </form>
  );
}
