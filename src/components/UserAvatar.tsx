import { useState } from "react";
import type { AuthUser } from "../store/auth";
import { userInitial } from "../lib/userDisplay";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, number> = { sm: 22, md: 32, lg: 56, xl: 104 };

type Props = {
  user: AuthUser;
  size?: Size;
  className?: string;
};

export function UserAvatar({ user, size = "md", className = "" }: Props) {
  const px = SIZE[size];
  const [imgFailed, setImgFailed] = useState(false);
  const initial = userInitial(user);
  const showPhoto = Boolean(user.photoURL) && !imgFailed;

  return (
    <span
      className={`user-avatar user-avatar--${size} ${className}`.trim()}
      style={{ width: px, height: px }}
      aria-hidden={!showPhoto}
    >
      {showPhoto ? (
        <img
          src={user.photoURL!}
          alt=""
          width={px}
          height={px}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="user-avatar-fallback">{initial}</span>
      )}
    </span>
  );
}
