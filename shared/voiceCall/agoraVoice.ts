import type {
  ConnectionState,
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

export type VoiceSession = {
  leave: () => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
};

export function isMicPermissionError(e: unknown): boolean {
  const name =
    e && typeof e === "object" && "name" in e
      ? String((e as { name: string }).name)
      : "";
  const msg = e instanceof Error ? e.message : String(e);
  return (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    /permission|denied|NotAllowed|NotFoundError/i.test(msg)
  );
}

export async function joinVoiceChannel(opts: {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  onRemoteJoined?: () => void;
  onRemoteLeft?: () => void;
  onConnectionLost?: () => void;
}): Promise<VoiceSession> {
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
  AgoraRTC.setLogLevel(4);

  const client: IAgoraRTCClient = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
  });
  let mic: IMicrophoneAudioTrack | null = null;
  let intentionalLeave = false;
  let ready = false;
  let remoteCount = 0;

  client.on("user-published", async (user, mediaType) => {
    if (mediaType !== "audio") return;
    try {
      await client.subscribe(user, "audio");
      user.audioTrack?.play();
      remoteCount += 1;
      opts.onRemoteJoined?.();
    } catch {
      /* subscribe can fail if we already left */
    }
  });

  client.on("user-unpublished", (user, mediaType) => {
    if (mediaType === "audio") user.audioTrack?.stop();
  });

  client.on("user-left", () => {
    remoteCount = Math.max(0, remoteCount - 1);
    if (remoteCount === 0) opts.onRemoteLeft?.();
  });

  client.on(
    "connection-state-change",
    (cur: ConnectionState) => {
      if (intentionalLeave || !ready) return;
      if (cur === "DISCONNECTED") {
        opts.onConnectionLost?.();
      }
    },
  );

  await client.join(opts.appId, opts.channel, opts.token, opts.uid);
  try {
    mic = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: "speech_standard",
    });
    await client.publish([mic]);
    ready = true;
  } catch (e) {
    intentionalLeave = true;
    mic?.close();
    await client.leave().catch(() => undefined);
    client.removeAllListeners();
    throw e;
  }

  return {
    async setMuted(muted: boolean) {
      await mic?.setMuted(muted);
    },
    async leave() {
      intentionalLeave = true;
      try {
        mic?.close();
        mic = null;
        await client.leave();
      } finally {
        client.removeAllListeners();
      }
    },
  };
}
