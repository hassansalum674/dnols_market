import { useState } from "react";
import { describeProduct, type DescribeReply } from "../api";
import { DESC_MAX, type AssistLang } from "../lib/describeAssist";
import { useI18n } from "../store/i18n";

type Props = {
  name: string;
  category: string;
  condition: string;
  variants: string[];
  photos: string[];
  onApply: (description: string) => void;
};

type Bubble = {
  role: "user" | "assistant";
  text: string;
  photoOnly?: boolean;
  options?: string[];
};

export function DescriptionAssist({
  name,
  category,
  condition,
  variants,
  photos,
  onApply,
}: Props) {
  const { lang, t } = useI18n();
  const assistLang: AssistLang = lang === "sw" ? "sw" : "en";
  const [notes, setNotes] = useState("");
  const [reply, setReply] = useState("");
  const [thread, setThread] = useState<Bubble[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const looking = photos.slice(0, 2);
  const started = thread.length > 0;
  const canSend = started
    ? reply.trim().length > 0
    : notes.trim().length > 0 || looking.length > 0;

  async function send(userText: string) {
    const text = userText.trim();
    const photoStart = !started && looking.length > 0;
    if (busy) return;
    if (!text && !photoStart) return;
    setErr(null);
    setBusy(true);
    setOptions([]);
    const photoOnly = !text && photoStart;
    const display = text || t("descAssistPhotoOnly");
    const nextThread: Bubble[] = [
      ...thread,
      { role: "user", text: display, photoOnly },
    ];
    setThread(nextThread);
    setNotes("");
    setReply("");
    try {
      const res: DescribeReply = await describeProduct({
        name,
        category,
        condition,
        variants,
        photos: looking,
        language: assistLang,
        messages: nextThread.map((b) => ({
          role: b.role,
          content: b.photoOnly ? "" : b.text,
        })),
      });
      if (res.done && res.description) {
        setPreview(res.description.slice(0, DESC_MAX));
        setThread([
          ...nextThread,
          { role: "assistant", text: res.description.slice(0, DESC_MAX) },
        ]);
        return;
      }
      const question = (res.question || "").trim();
      setThread([
        ...nextThread,
        { role: "assistant", text: question, options: res.options },
      ]);
      setOptions(res.options ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("descAssistFail"));
      setThread(thread);
      if (thread.length === 0 && text) setNotes(text);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setThread([]);
    setOptions([]);
    setPreview(null);
    setErr(null);
    setReply("");
  }

  return (
    <div className="desc-assist">
      <p className="desc-assist-kicker">{t("descAssistTitle")}</p>
      <p className="hint desc-assist-hint">{t("descAssistHint")}</p>

      {looking.length > 0 ? (
        <div className="desc-assist-photos">
          {looking.map((url) => (
            <img key={url} src={url} alt="" />
          ))}
          <span>{t("descAssistLooking")}</span>
        </div>
      ) : (
        <p className="hint desc-assist-need-photo">{t("descAssistNeedPhoto")}</p>
      )}

      {thread.length > 0 && (
        <div className="desc-assist-thread">
          {thread.map((b, i) => (
            <div
              key={`${b.role}-${i}`}
              className={`desc-assist-bubble ${b.role === "user" ? "me" : "ai"}`}
            >
              {b.text}
            </div>
          ))}
        </div>
      )}

      {preview ? (
        <div className="desc-assist-preview">
          <p className="desc-assist-prompt">{t("descAssistPreview")}</p>
          <p className="desc-assist-text">{preview}</p>
          <button
            type="button"
            className="btn desc-assist-use"
            onClick={() => onApply(preview)}
          >
            {t("descAssistUse")}
          </button>
          <button type="button" className="desc-assist-skip" onClick={reset}>
            {t("descAssistAgain")}
          </button>
        </div>
      ) : (
        <>
          {options.length > 0 && !busy && (
            <div className="chip-grid">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="chip"
                  onClick={() => void send(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          <textarea
            className="field"
            rows={2}
            value={started ? reply : notes}
            onChange={(e) => {
              if (started) setReply(e.target.value);
              else setNotes(e.target.value);
            }}
            placeholder={
              started ? t("descAssistTypeAnswer") : t("descAssistPlaceholder")
            }
            disabled={busy}
          />
          <div className="desc-assist-actions">
            <button
              type="button"
              className="btn ghost desc-assist-go"
              disabled={busy || !canSend}
              onClick={() => void send(started ? reply : notes)}
            >
              {busy
                ? t("descAssistThinking")
                : started
                  ? t("descAssistReply")
                  : t("descAssistAsk")}
            </button>
            {started && thread.some((b) => b.role === "assistant") && (
              <button
                type="button"
                className="desc-assist-skip"
                disabled={busy}
                onClick={() => void send(t("descAssistWriteNow"))}
              >
                {t("descAssistWriteNow")}
              </button>
            )}
          </div>
        </>
      )}

      {err && <p className="err">{err}</p>}
    </div>
  );
}
