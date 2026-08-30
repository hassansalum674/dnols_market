import { useState } from "react";
import { generateCovers } from "../lib/aiClient";

type Props = {
  productName: string;
  category: string;
  condition: string;
  notes?: string;
  existingAiCovers: number;
  onCovers: (urls: string[]) => void;
  disabled?: boolean;
};

export function ProductCoverGenerator({
  productName,
  category,
  condition,
  notes,
  existingAiCovers,
  onCovers,
  disabled,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const need = Math.max(0, 2 - existingAiCovers);
  const canGenerate = productName.trim().length > 0 && need > 0 && !busy && !disabled;

  async function run(variant?: 1 | 2) {
    if (!productName.trim()) {
      setErr("Enter a product name first — AI uses it for the cover shot.");
      return;
    }
    setBusy(true);
    setErr(null);
    setHint(null);
    try {
      const result = await generateCovers({
        name: productName.trim(),
        category,
        condition,
        notes,
        variant,
      });
      onCovers(result.covers.map((c) => c.cdnUrl));
      if (result.hint) setHint(result.hint);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Cover generation failed");
    } finally {
      setBusy(false);
    }
  }

  if (existingAiCovers >= 2) {
    return (
      <p className="hint ai-studio-hint">
        Two AI cover photos ready. Add real detail shots below.
      </p>
    );
  }

  return (
    <div className="ai-cover-studio">
      <div className="ai-studio-head">
        <h3 className="ai-studio-title">AI cover photos</h3>
        <span className="ai-studio-badge">{existingAiCovers}/2</span>
      </div>
      <p className="hint ai-studio-hint">
        We create two premium square covers — a hero shot and a second angle with
        soft blue lighting. Buyers see these first.
      </p>
      {err && <p className="err">{err}</p>}
      {hint && <p className="hint notice-inline">{hint}</p>}
      {busy ? (
        <div className="photo-pipeline processing ai-studio-busy">
          <div className="pipeline-spinner" />
          <p>Generating cover {existingAiCovers + 1}…</p>
          <p className="hint">This can take 15–30 seconds per image.</p>
        </div>
      ) : (
        <div className="ai-studio-actions">
          {need === 2 ? (
            <button
              type="button"
              className="btn ai-generate-btn"
              disabled={!canGenerate}
              onClick={() => void run()}
            >
              Generate both AI covers
            </button>
          ) : (
            <button
              type="button"
              className="btn ai-generate-btn"
              disabled={!canGenerate}
              onClick={() => void run((existingAiCovers + 1) as 1 | 2)}
            >
              Generate cover {existingAiCovers + 1}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
