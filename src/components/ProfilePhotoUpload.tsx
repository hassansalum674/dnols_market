import { useRef, useState } from "react";
import { avatarColors, resizeImageFile } from "../lib/avatar";

type Props = {
  previewUrl: string | null;
  seed: string;
  initial: string;
  onChange: (dataUrl: string | null) => void;
};

export function ProfilePhotoUpload({
  previewUrl,
  seed,
  initial,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const colors = avatarColors(seed || initial);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setErr(null);
    try {
      onChange(await resizeImageFile(file, 480));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save that photo.");
    }
  }

  function openPicker(camera: boolean) {
    const input = inputRef.current;
    if (!input) return;
    if (camera) input.setAttribute("capture", "user");
    else input.removeAttribute("capture");
    input.click();
  }

  return (
    <div className="profile-photo-upload">
      <div
        className={`profile-photo-preview ${previewUrl ? "has-photo" : ""}`}
        style={
          previewUrl
            ? undefined
            : { background: colors.bg, color: colors.fg }
        }
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" />
        ) : (
          <span className="profile-photo-fallback">{initial}</span>
        )}
      </div>

      {previewUrl ? (
        <div className="photo-actions">
          <button
            type="button"
            className="btn ghost photo-btn"
            onClick={() => openPicker(false)}
          >
            Change photo
          </button>
          <button
            type="button"
            className="btn ghost photo-btn"
            onClick={() => {
              setErr(null);
              onChange(null);
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="photo-actions">
          <button
            type="button"
            className="btn ghost photo-btn"
            onClick={() => openPicker(true)}
          >
            Camera
          </button>
          <button
            type="button"
            className="btn ghost photo-btn"
            onClick={() => openPicker(false)}
          >
            Gallery
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void handleFile(file);
        }}
      />
      {err && <p className="err">{err}</p>}
    </div>
  );
}
