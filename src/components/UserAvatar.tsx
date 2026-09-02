import { useEffect, useId, useState } from "react";
import type { AuthUser } from "../store/auth";
import {
  avatarColors,
  notifyAvatarChange,
  onAvatarChange,
  resizeImageFile,
} from "../lib/avatar";
import { loadProfile, saveProfile } from "../lib/profile";
import { userDisplayName, userInitial } from "../lib/userDisplay";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, number> = { sm: 28, md: 36, lg: 64, xl: 88 };

type Props = {
  user: AuthUser;
  size?: Size;
  className?: string;
  /** Camera badge — tap to set or replace the photo. */
  editable?: boolean;
};

export function UserAvatar({
  user,
  size = "md",
  className = "",
  editable = false,
}: Props) {
  const px = SIZE[size];
  const inputId = useId();
  const [imgFailed, setImgFailed] = useState(false);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [hideRemote, setHideRemote] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const initial = userInitial(user);
  const colors = avatarColors(user.uid || user.email || initial);
  const label = userDisplayName(user);

  useEffect(() => {
    const sync = () => {
      const p = loadProfile(user.uid);
      setCustomUrl(p.avatarDataUrl ?? null);
      setHideRemote(Boolean(p.preferLetterAvatar));
      setImgFailed(false);
    };
    sync();
    return onAvatarChange(sync);
  }, [user.uid]);

  const photo = customUrl || (!hideRemote && !imgFailed && user.photoURL) || null;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr(null);
    try {
      const dataUrl = await resizeImageFile(file);
      saveProfile(user.uid, { avatarDataUrl: dataUrl, preferLetterAvatar: false });
      setCustomUrl(dataUrl);
      notifyAvatarChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save that photo.");
    }
  }

  const face = (
    <span
      className={`user-avatar user-avatar--${size} ${photo ? "has-photo" : ""}`.trim()}
      style={{
        width: px,
        height: px,
        background: photo ? "#eee" : colors.bg,
        color: colors.fg,
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          width={px}
          height={px}
          referrerPolicy="no-referrer"
          onError={() => {
            if (customUrl) {
              setCustomUrl(null);
            } else {
              setImgFailed(true);
            }
          }}
        />
      ) : (
        <span className="user-avatar-fallback">{initial}</span>
      )}
    </span>
  );

  if (!editable) {
    return (
      <span
        className={`user-avatar-wrap ${className}`.trim()}
        style={{ width: px, height: px }}
        role="img"
        aria-label={`${label} avatar`}
      >
        {face}
      </span>
    );
  }

  return (
    <div className={`user-avatar-edit ${className}`.trim()}>
      <label
        className="user-avatar-edit-hit"
        htmlFor={inputId}
        style={{ width: px, height: px }}
      >
        {face}
        <span className="user-avatar-camera" aria-hidden>
          <CameraIcon />
        </span>
        <span className="sr-only">Change profile photo</span>
      </label>
      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onFile(file);
        }}
      />
      {err && <p className="err user-avatar-err">{err}</p>}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5h3.2l1.3-2.2h7L16.8 8.5H20v10H4V8.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.2" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
