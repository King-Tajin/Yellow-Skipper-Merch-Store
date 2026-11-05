// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

import { collectionProductsUrl } from "../_shared/collections.js";
import {
  CORS,
  jsonResponse,
  optionsResponse,
  readJsonBody,
  upstreamErrorResponse,
} from "../_shared/http.js";
import {
  createSessionCookie,
  hasValidSession,
  safeEqual,
} from "../_shared/session.js";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstile(token, secret, request) {
  const params = new URLSearchParams({ secret, response: token });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) params.append("remoteip", ip);
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function onRequestPost(context) {
  const body = await readJsonBody(context.request);
  if (!body) return jsonResponse({ error: "Invalid JSON body" }, 400);

  const code = typeof body.code === "string" ? body.code : "";
  const accessCode = context.env.UNLISTED_CODE;
  const hasSession = await hasValidSession(context.request, accessCode);
  let sessionCookie = null;

  if (!hasSession) {
    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      return jsonResponse({ error: "Verification unavailable" }, 503);
    }

    const token =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    if (
      !token ||
      !(await verifyTurnstile(token, turnstileSecret, context.request))
    ) {
      return jsonResponse({ error: "Verification failed" }, 403);
    }

    if (!accessCode || !safeEqual(code, accessCode)) {
      return jsonResponse({ error: "Invalid code" }, 401);
    }

    sessionCookie = await createSessionCookie(accessCode);
  }

  const handle = context.env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";
  const url = collectionProductsUrl(handle, context.env, {
    size: body.size ?? 50,
    page: body.page ?? 0,
    currency: body.currency ?? "USD",
  });

  const fwRes = await fetch(url, { method: "GET" });

  if (!fwRes.ok) return upstreamErrorResponse(fwRes);

  const data = await fwRes.text();

  const headers = new Headers(CORS);
  if (sessionCookie) headers.append("Set-Cookie", sessionCookie);

  return new Response(data, { status: fwRes.status, headers });
}

export function onRequestOptions() {
  return optionsResponse("POST");
}
