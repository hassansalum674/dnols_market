import { useMemo, useState } from "react";
import {
  DESC_MAX,
  pickQuestions,
  writeDescription,
  type AssistLang,
  type DescribeQuestion,
} from "../lib/describeAssist";
import { useI18n } from "../store/i18n";

type Props = {
  name: string;
  category: string;
  condition: string;
  variants: string[];
  onApply: (description: string) => void;
};

export function DescriptionAssist({
  name,
  category,
  condition,
  variants,
  onApply,
}: Props) {
  const { lang, t } = useI18n();
  const assistLang: AssistLang = lang === "sw" ? "sw" : "en";
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState<DescribeQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);

  const draft = useMemo(
    () => ({
      notes,
      name,
      category,
      condition,
      variants,
      language: assistLang,
    }),
    [notes, name, category, condition, variants, assistLang],
  );

  const unanswered =
    questions?.filter((q) => !answers[q.id]).map((q) => q.prompt) ?? [];

  function start() {
    const qs = pickQuestions(draft);
    setPreview(null);
    setAnswers({});
    if (qs.length === 0) {
      const text = writeDescription(draft, {});
      setQuestions([]);
      setPreview(text);
      return;
    }
    setQuestions(qs);
  }

  function choose(id: string, option: string) {
    const next = { ...answers, [id]: option };
    setAnswers(next);
    if (questions && questions.every((q) => q.id === id || next[q.id])) {
      setPreview(writeDescription(draft, next));
    } else {
      setPreview(null);
    }
  }

  function writeNow() {
    setPreview(writeDescription(draft, answers));
  }

  function apply() {
    const text = preview || writeDescription(draft, answers);
    onApply(text.slice(0, DESC_MAX));
  }

  return (
    <div className="desc-assist">
      <p className="desc-assist-kicker">{t("descAssistTitle")}</p>
      <p className="hint desc-assist-hint">{t("descAssistHint")}</p>
      <textarea
        className="field"
        rows={2}
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setQuestions(null);
          setAnswers({});
          setPreview(null);
        }}
        placeholder={t("descAssistPlaceholder")}
      />
      <button type="button" className="btn ghost desc-assist-go" onClick={start}>
        {t("descAssistAsk")}
      </button>

      {questions && questions.length > 0 && (
        <div className="desc-assist-qs">
          {questions.map((q) => (
            <div key={q.id} className="desc-assist-q">
              <p className="desc-assist-prompt">{q.prompt}</p>
              <div className="chip-grid">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`chip ${answers[q.id] === opt ? "selected" : ""}`}
                    onClick={() => choose(q.id, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {unanswered.length > 0 && (
            <button
              type="button"
              className="desc-assist-skip"
              onClick={writeNow}
            >
              {t("descAssistSkip")}
            </button>
          )}
        </div>
      )}

      {preview && (
        <div className="desc-assist-preview">
          <p className="desc-assist-prompt">{t("descAssistPreview")}</p>
          <p className="desc-assist-text">{preview}</p>
          <button type="button" className="btn desc-assist-use" onClick={apply}>
            {t("descAssistUse")}
          </button>
        </div>
      )}
    </div>
  );
}
