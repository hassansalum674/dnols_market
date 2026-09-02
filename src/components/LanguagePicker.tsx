import type { AppLanguage } from "../lib/i18n";
import { useI18n } from "../store/i18n";

export function LanguagePicker({
  value,
  onChange,
}: {
  value: AppLanguage;
  onChange: (lang: AppLanguage) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="lang-cards" role="group" aria-label={t("language")}>
      <button
        type="button"
        className={`lang-card ${value === "en" ? "on" : ""}`}
        onClick={() => onChange("en")}
      >
        <strong>English</strong>
        <span>English</span>
      </button>
      <button
        type="button"
        className={`lang-card ${value === "sw" ? "on" : ""}`}
        onClick={() => onChange("sw")}
      >
        <strong>Kiswahili</strong>
        <span>Swahili</span>
      </button>
    </div>
  );
}
