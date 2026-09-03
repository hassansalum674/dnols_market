type RestValue = Record<string, unknown>;

function firestoreProjectId(): string {
  return process.env.FIREBASE_PROJECT_ID?.trim() || "dnols-2a394";
}

function unwrap(value: unknown): unknown {
  if (!value || typeof value !== "object") return undefined;
  const o = value as RestValue;
  if ("stringValue" in o) return o.stringValue;
  if ("integerValue" in o) return Number(o.integerValue);
  if ("doubleValue" in o) return Number(o.doubleValue);
  if ("booleanValue" in o) return o.booleanValue;
  if ("timestampValue" in o) return o.timestampValue;
  if ("nullValue" in o) return null;
  if ("arrayValue" in o) {
    const values = (o.arrayValue as { values?: unknown[] })?.values ?? [];
    return values.map(unwrap);
  }
  if ("mapValue" in o) {
    const fields = (o.mapValue as { fields?: RestValue })?.fields ?? {};
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, unwrap(v)]),
    );
  }
  return undefined;
}

export type CallOrderRow = {
  buyerUid: string;
  riderId: string | null;
  riderAuthUid: string | null;
  deliveryStatus: string;
};

export async function fetchOrderForCaller(
  idToken: string,
  orderId: string,
): Promise<CallOrderRow | null> {
  const projectId = firestoreProjectId();
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId,
  )}/databases/(default)/documents/orders/${encodeURIComponent(orderId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = new Error(`firestore_${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  const body = (await res.json()) as { fields?: RestValue };
  const fields = body.fields ?? {};
  const buyerUid = String(unwrap(fields.buyerUid) ?? "");
  const riderIdRaw = unwrap(fields.riderId);
  const riderAuthRaw = unwrap(fields.riderAuthUid);
  return {
    buyerUid,
    riderId: typeof riderIdRaw === "string" && riderIdRaw ? riderIdRaw : null,
    riderAuthUid:
      typeof riderAuthRaw === "string" && riderAuthRaw ? riderAuthRaw : null,
    deliveryStatus: String(unwrap(fields.deliveryStatus) ?? "unassigned"),
  };
}

export async function fetchRiderDocFields(
  idToken: string,
  riderId: string,
): Promise<Record<string, unknown> | null> {
  const projectId = firestoreProjectId();
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId,
  )}/databases/(default)/documents/riders/${encodeURIComponent(riderId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = new Error(`firestore_${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  const body = (await res.json()) as { fields?: RestValue };
  const fields = body.fields ?? {};
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, unwrap(v)]),
  );
}

export async function patchRiderAuthUid(
  idToken: string,
  riderId: string,
  authUid: string,
): Promise<void> {
  const projectId = firestoreProjectId();
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId,
  )}/databases/(default)/documents/riders/${encodeURIComponent(
    riderId,
  )}?updateMask.fieldPaths=authUid`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        authUid: { stringValue: authUid },
      },
    }),
  });
  if (!res.ok) {
    const err = new Error(`firestore_${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
}
