export type CallTokenResponse = {
  token: string;
  channel: string;
  appId: string;
  uid: number;
  expireAt: string;
};

export class CallApiError extends Error {
  code: "delivered" | "forbidden" | "http";

  constructor(code: "delivered" | "forbidden" | "http", message: string) {
    super(message);
    this.code = code;
    this.name = "CallApiError";
  }
}

export async function fetchCallToken(opts: {
  apiBase: string;
  idToken: string;
  orderId: string;
  userId: string;
}): Promise<CallTokenResponse> {
  const res = await fetch(`${opts.apiBase}/call/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.idToken}`,
    },
    body: JSON.stringify({ orderId: opts.orderId, userId: opts.userId }),
  });
  const body = (await res.json().catch(() => ({}))) as CallTokenResponse & {
    error?: string;
    message?: string;
  };
  if (res.status === 403) {
    const err = String(body.error ?? "");
    const msg = String(body.message ?? "");
    if (err === "delivered" || /deliver/i.test(msg)) {
      throw new CallApiError("delivered", msg || "Delivery complete");
    }
    throw new CallApiError("forbidden", msg || "You cannot join this call.");
  }
  if (!res.ok || !body.token || !body.channel || !body.appId) {
    throw new CallApiError(
      "http",
      body.message || body.error || "Could not start the call.",
    );
  }
  return {
    token: body.token,
    channel: body.channel,
    appId: body.appId,
    uid: Number(body.uid) || 1,
    expireAt: body.expireAt || new Date(Date.now() + 3600_000).toISOString(),
  };
}
