import { useRef } from "react";
import { compressToWebP } from "../lib/image";

type Props = {
  label: string;
  value: string | null;
  onChange: (dataUrl: string) => void;
  cameraOnly?: boolean;
  required?: boolean;
};

export function PhotoUpload({
  label,
  value,
  onChange,
  cameraOnly = false,
  required,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const dataUrl = await compressToWebP(file);
    onChange(dataUrl);
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="photo-upload">
      <label className="lbl">
        {label}
        {required && " *"}
      </label>
      {value ? (
        <div className="photo-preview">
          <img src={value} alt="" />
          <button
            type="button"
            className="photo-change"
            onClick={() => inputRef.current?.click()}
          >
            Change photo
          </button>
        </div>
      ) : (
        <div className="photo-actions">
          <button
            type="button"
            className="btn ghost photo-btn"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.setAttribute("capture", "environment");
                inputRef.current.click();
              }
            }}
          >
            Camera
          </button>
          {!cameraOnly && (
            <button
              type="button"
              className="btn ghost photo-btn"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.removeAttribute("capture");
                  inputRef.current.click();
                }
              }}
            >
              Gallery
            </button>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onInput}
      />
    </div>
  );
}
