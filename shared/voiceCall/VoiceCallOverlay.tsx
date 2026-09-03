export type VoiceCallPhase = "incoming" | "outgoing" | "in_call" | "ended";

type Props = {
  open: boolean;
  phase: VoiceCallPhase;
  peerName: string;
  subtitle: string;
  muted: boolean;
  error: string | null;
  labels: {
    accept: string;
    decline: string;
    mute: string;
    unmute: string;
    end: string;
  };
  onAccept: () => void;
  onDecline: () => void;
  onToggleMute: () => void;
  onEnd: () => void;
};

export function VoiceCallOverlay({
  open,
  phase,
  peerName,
  subtitle,
  muted,
  error,
  labels,
  onAccept,
  onDecline,
  onToggleMute,
  onEnd,
}: Props) {
  if (!open) return null;
  const initial = (peerName.trim().charAt(0) || "•").toUpperCase();

  return (
    <div className="voice-call-overlay" role="dialog" aria-modal="true">
      <div className="voice-call-avatar" aria-hidden>
        {initial}
      </div>
      <h2 className="voice-call-name">{peerName}</h2>
      <p className="voice-call-timer">{subtitle}</p>
      {error && <p className="err">{error}</p>}
      <div className="voice-call-actions">
        {phase === "incoming" && (
          <>
            <button
              type="button"
              className="voice-call-round decline"
              onClick={onDecline}
            >
              {labels.decline}
            </button>
            <button
              type="button"
              className="voice-call-round accept"
              onClick={onAccept}
            >
              {labels.accept}
            </button>
          </>
        )}
        {(phase === "outgoing" || phase === "in_call") && (
          <>
            <button
              type="button"
              className={`voice-call-round mute${muted ? " on" : ""}`}
              onClick={onToggleMute}
            >
              {muted ? labels.unmute : labels.mute}
            </button>
            <button
              type="button"
              className="voice-call-round end"
              onClick={onEnd}
            >
              {labels.end}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
