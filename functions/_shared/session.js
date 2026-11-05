const SESSION_COOKIE = "unlisted_session";
const SESSION_SECONDS = 1800;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return toHex(signature);
}

export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export async function hasValidSession(request, secret) {
  if (!secret) return false;
  const value = readCookie(request, SESSION_COOKIE);
  if (!value) return false;
  const [expiry, signature] = value.split(".");
  if (!expiry || !signature) return false;
  if (!(Number(expiry) > Date.now() / 1000)) return false;
  return safeEqual(signature, await sign(expiry, secret));
}

export async function createSessionCookie(secret) {
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const signature = await sign(expiry, secret);
  return `${SESSION_COOKIE}=${expiry}.${signature}; Path=/api; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}
