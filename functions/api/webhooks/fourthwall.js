// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function toBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifySignature(rawBody, signature, secret) {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody)
  );
  return timingSafeEqual(toBase64(digest), signature);
}

function formatMoney(amount) {
  if (!amount || typeof amount.value !== "number") return null;
  return `${amount.value.toFixed(2)} ${amount.currency ?? ""}`.trim();
}

function extractItems(order) {
  const rawItems = order.items ?? order.lineItems ?? order.orderItems ?? [];
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((item) => ({
    name: item.name ?? item.title ?? item.variantName ?? "Item",
    quantity: item.quantity ?? 1,
  }));
}

async function notifyDiscordBot(order, webhookUrl, webhookSecret) {
  const headers = { "Content-Type": "application/json" };
  if (webhookSecret) {
    headers["X-Webhook-Secret"] = webhookSecret;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      total: formatMoney(order.amounts?.total),
      items: extractItems(order),
    }),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const rawBody = await request.text();

  if (env.FW_WEBHOOK_SECRET) {
    const signature = request.headers.get("X-Fourthwall-Hmac-SHA256");
    const valid = await verifySignature(
      rawBody,
      signature,
      env.FW_WEBHOOK_SECRET
    );
    if (!valid) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid signature" }),
        { status: 401, headers: CORS }
      );
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: CORS,
    });
  }

  console.log("Fourthwall webhook received:", JSON.stringify(event));

  if (
    event.type === "ORDER_PLACED" &&
    event.data?.status === "CONFIRMED" &&
    env.DISCORD_WEBHOOK_URL
  ) {
    try {
      await notifyDiscordBot(
        event.data,
        env.DISCORD_WEBHOOK_URL,
        env.DISCORD_WEBHOOK_SECRET
      );
    } catch {
      return new Response(JSON.stringify({ ok: true, discord: false }), {
        status: 200,
        headers: CORS,
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: CORS,
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Fourthwall-Hmac-SHA256",
    },
  });
}
