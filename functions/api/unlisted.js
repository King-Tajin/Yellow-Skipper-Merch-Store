// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

const FW_BASE = "https://storefront-api.fourthwall.com/v1/collections";
const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const code = typeof body.code === "string" ? body.code : "";

  if (!context.env.UNLISTED_CODE || code !== context.env.UNLISTED_CODE) {
    return json({ error: "Invalid code" }, 401);
  }

  const size = body.size ?? 50;
  const page = body.page ?? 0;
  const currency = body.currency ?? "USD";
  const handle = context.env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";

  const url = `${FW_BASE}/${handle}/products?storefront_token=${context.env.FW_TOKEN}&size=${size}&page=${page}&currency=${currency}`;

  const fwRes = await fetch(url, { method: "GET" });

  if (!fwRes.ok) {
    const errorBody = await fwRes.text();
    return new Response(errorBody, { status: fwRes.status, headers: CORS });
  }

  const data = await fwRes.text();

  return new Response(data, {
    status: fwRes.status,
    headers: CORS,
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
