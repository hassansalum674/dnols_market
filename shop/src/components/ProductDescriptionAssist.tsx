import { useEffect, useRef, useState } from "react";
import {
  assistDescription,
  type DescriptionLanguage,
} from "../lib/aiClient";

type Props = {
  productName: string;
  category: string;
  condition: string;
  description: string;
  onDescription: (text: string) => void;
};

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function ProductDescriptionAssist({
  productName,
  category,
  condition,
  description,
  onDescription,
}: Props) {
  const [language, setLanguage] = useState<DescriptionLanguage>("en");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const transcriptRef = useRef("");
  const speechSupported = typeof window !== "undefined" && Boolean(getSpeechRecognition());

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  async function run(
    action: "write" | "improve" | "questions",
    voiceText?: string,
  ) {
    if (!productName.trim()) {
      setErr("Enter a product name before using AI description help.");
      return;
    }
    setBusy(true);
    setErr(null);
    setHint(null);
    try {
      const result = await assistDescription({
        action,
        language,
        productName: productName.trim(),
        category,
        condition,
        draft: description,
        voiceTranscript: voiceText || transcript || undefined,
        answers: Object.keys(answers).length ? answers : undefined,
      });
      if (result.questions?.length) {
        setQuestions(result.questions);
        setAnswers({});
      }
      if (result.description) {
        onDescription(result.description);
        setQuestions([]);
        setAnswers({});
        setTranscript("");
      }
      if (result.hint) setHint(result.hint);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Description assist failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleVoice() {
    if (!speechSupported) {
      setErr("Voice input is not supported in this browser. Type your notes instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Ctor = getSpeechRecognition()!;
    const rec = new Ctor();
    rec.lang = language === "sw" ? "sw-TZ" : "en-TZ";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      transcriptRef.current = text;
      setTranscript(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const text = transcriptRef.current.trim();
      if (text) void run("write", text);
    };
    recognitionRef.current = rec;
    setListening(true);
    setErr(null);
    rec.start();
  }

  return (
    <div className="ai-desc-studio">
      <div className="ai-studio-head">
        <h3 className="ai-studio-title">AI description</h3>
        <div className="ai-lang-toggle" role="group" aria-label="Description language">
          <button
            type="button"
            className={`chip ${language === "en" ? "selected" : ""}`}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
          <button
            type="button"
            className={`chip ${language === "sw" ? "selected" : ""}`}
            onClick={() => setLanguage("sw")}
          >
            Kiswahili
          </button>
        </div>
      </div>
      <p className="hint ai-studio-hint">
        Speak or type rough notes — AI writes a short buyer-friendly description (max
        200 characters).
      </p>

      {transcript && (
        <p className="ai-transcript">
          <span className="muted">Heard:</span> {transcript}
        </p>
      )}

      {err && <p className="err">{err}</p>}
      {hint && <p className="hint notice-inline">{hint}</p>}

      <div className="ai-studio-actions">
        {speechSupported && (
          <button
            type="button"
            className={`btn ghost ${listening ? "listening" : ""}`}
            disabled={busy}
            onClick={toggleVoice}
          >
            {listening ? "Stop listening" : "Describe with voice"}
          </button>
        )}
        <button
          type="button"
          className="btn ghost"
          disabled={busy}
          onClick={() => void run("improve")}
        >
          Improve text
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={busy}
          onClick={() => void run("questions")}
        >
          Ask me details
        </button>
      </div>

      {busy && (
        <p className="hint ai-studio-busy-text">AI is writing…</p>
      )}

      {questions.length > 0 && (
        <div className="ai-questions">
          <p className="lbl">A few quick questions</p>
          {questions.map((q) => (
            <label key={q} className="ai-question">
              <span>{q}</span>
              <input
                className="field"
                value={answers[q] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                }
              />
            </label>
          ))}
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => void run("write")}
          >
            Write description
          </button>
        </div>
      )}
    </div>
  );
}
