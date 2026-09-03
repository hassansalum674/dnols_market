import { apiBase } from "./apiBase";
import {
  CLOUD_DENIED,
  CLOUD_OFFLINE,
  CLOUD_TAKEN,
  type RiderDoc,
} from "./deliveryCloud";

export const API_UNAVAILABLE = "API_UNAVAILABLE";

export async function claimRiderViaApi(
  idToken: string,
  phone: string,
): Promise<RiderDoc | null> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}/riders/claim`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ phone }),
    });
  } catch {
    throw new Error(API_UNAVAILABLE);
  }
  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    rider?: RiderDoc;
    error?: string;
    message?: string;
  };
  if (res.status === 404 && body.error !== "not_linked") {
    throw new Error(API_UNAVAILABLE);
  }
  if (res.status === 404 || body.error === "not_linked") return null;
  if (res.status === 409 || body.error === "rider_taken") {
    throw new Error(CLOUD_TAKEN);
  }
  if (res.status === 403 || body.error === "permission_denied") {
    throw new Error(CLOUD_DENIED);
  }
  if (!res.ok || !body.rider) {
    if (res.status >= 500) throw new Error(API_UNAVAILABLE);
    throw new Error(CLOUD_OFFLINE);
  }
  return body.rider;
}
