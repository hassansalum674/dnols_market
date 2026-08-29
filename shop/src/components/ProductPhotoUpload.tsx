import { useEffect, useRef, useState } from "react";
import {
  type PhotoPipelineResult,
  type PhotoProcessMode,
  processProductPhoto,
  revokePreviewUrl,
} from "../lib/photoPipeline";

type Props = {
  mode: PhotoProcessMode;
  onConfirm: (cdnUrl: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
};

type Stage = "pick" | "processing" | "preview" | "error";

export function ProductPhotoUpload({
  mode,
  onConfirm,
  onCancel,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("pick");
  const [preview, setPreview] = useState<PhotoPipelineResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.beforeUrl) revokePreviewUrl(preview.beforeUrl);
    };
  }, [preview]);

  async function handleFile(file: File) {
    setStage("processing");
    setErr(null);
    try {
      const result = await processProductPhoto(file, mode);
      setPreview(result);
      setStage("preview");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Processing failed");
      setStage("error");
    }
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  function retake() {
    if (preview?.beforeUrl) revokePreviewUrl(preview.beforeUrl);
    setPreview(null);
    setErr(null);
    setStage("pick");
    inputRef.current?.click();
  }

  function confirm() {
    if (!preview) return;
    onConfirm(preview.after.cdnUrl);
    revokePreviewUrl(preview.beforeUrl);
    setPreview(null);
    setStage("pick");
  }

  const isCover = mode === "cover";

  if (stage === "processing") {
    return (
      <div className="photo-pipeline processing">
        <div className="pipeline-spinner" />
        <p>Processing photo…</p>
        <p className="hint">
          {isCover
            ? "Removing background, white fill, square crop"
            : "Compressing to WebP"}
        </p>
      </div>
    );
  }

  if (stage === "preview" && preview) {
    return (
      <div className="photo-pipeline preview">
        <h4>Before / after</h4>
        <p className="hint">
          {isCover
            ? "Cover photo: white background, 1:1 crop, min 800×800px. Buyers only see the processed version."
            : "Detail photo: compressed WebP. No background removal."}
        </p>
        <div className="before-after">
          <figure>
            <img src={preview.beforeUrl} alt="Original" />
            <figcaption>Before</figcaption>
          </figure>
          <figure>
            <img src={preview.after.cdnUrl} alt="Processed" />
            <figcaption>
              After · {preview.after.width}×{preview.after.height} ·{" "}
              {preview.after.sizeKb}KB
            </figcaption>
          </figure>
        </div>
        {preview.after.provider === "fallback" && isCover && (
          <p className="hint notice-inline">
            Background removal API not configured — used center crop with white
            fill. Set FAPIAPI_API_KEY on Render for FAPIhub background removal.
          </p>
        )}
        <div className="btn-row">
          <button type="button" className="btn ghost" onClick={retake}>
            Retake
          </button>
          <button type="button" className="btn" onClick={confirm}>
            Use this photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-pipeline pick">
      {stage === "error" && err && <p className="err">{err}</p>}
      <button
        type="button"
        className="btn ghost photo-add-btn"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        + Add {isCover ? "cover" : "photo"}
      </button>
      {onCancel && (
        <button type="button" className="photo-cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onInput}
      />
    </div>
  );
}
