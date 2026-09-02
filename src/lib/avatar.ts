const AVATAR_EVENT = "dnols-avatar";

const PALETTE = [
  { bg: "#FDE8D8", fg: "#C45C26" },
  { bg: "#D6EAF8", fg: "#1A6FD4" },
  { bg: "#D5F5E3", fg: "#1B7A3D" },
  { bg: "#F5D6E8", fg: "#A32963" },
  { bg: "#E8DEF8", fg: "#6C3BCF" },
  { bg: "#FCF3CF", fg: "#9A6B0A" },
  { bg: "#F6D7C8", fg: "#B85C38" },
  { bg: "#D4EDE8", fg: "#1D6B5C" },
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function avatarColors(seed: string): { bg: string; fg: string } {
  return PALETTE[hashSeed(seed || "dnols") % PALETTE.length]!;
}

export function notifyAvatarChange() {
  window.dispatchEvent(new Event(AVATAR_EVENT));
}

export function onAvatarChange(fn: () => void): () => void {
  window.addEventListener(AVATAR_EVENT, fn);
  return () => window.removeEventListener(AVATAR_EVENT, fn);
}

export function resizeImageFile(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose a photo (JPG or PNG)."));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that photo."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo."));
    };
    img.src = url;
  });
}
