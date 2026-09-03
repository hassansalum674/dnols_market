export type VoiceCallPhase = "incoming" | "outgoing" | "in_call" | "ended";

type Props = {
  open: boolean;
  phase: VoiceCallPhase;
  peerName: string;
  subtitle: string;
  timer?: string;
  muted: boolean;
  speakerOn: boolean;
  error: string | null;
  labels: {
    accept: string;
    decline: string;
    mute: string;
    unmute: string;
    speaker: string;
    speakerOff: string;
    end: string;
  };
  onAccept: () => void;
  onDecline: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEnd: () => void;
};

export function VoiceCallOverlay({
  open,
  phase,
  peerName,
  subtitle,
  timer,
  muted,
  speakerOn,
  error,
  labels,
  onAccept,
  onDecline,
  onToggleMute,
  onToggleSpeaker,
  onEnd,
}: Props) {
  if (!open) return null;
  const initial = (peerName.trim().charAt(0) || "•").toUpperCase();
  const inActiveCall = phase === "outgoing" || phase === "in_call";

  return (
    <div className="voice-call-overlay voice-call-overlay--v2" role="dialog" aria-modal="true">
      <div className="voice-call-avatar" aria-hidden>
        {initial}
      </div>
      <h2 className="voice-call-name">{peerName}</h2>
      <p className="voice-call-sub">{subtitle}</p>
      {timer && inActiveCall && (
        <p className="voice-call-timer" aria-live="polite">
          {timer}
        </p>
      )}
      {error && <p className="voice-call-err">{error}</p>}
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
        {inActiveCall && (
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
              className={`voice-call-round speaker${speakerOn ? " on" : ""}`}
              onClick={onToggleSpeaker}
            >
              {speakerOn ? labels.speaker : labels.speakerOff}
            </button>
          </>
        )}
      </div>
      {(inActiveCall || phase === "ended") && (
        <button type="button" className="voice-call-end-main" onClick={onEnd}>
          {labels.end}
        </button>
      )}
    </div>
  );
}
