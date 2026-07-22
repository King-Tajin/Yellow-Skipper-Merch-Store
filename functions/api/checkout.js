// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

const FW_BASE = "https://storefront-api.fourthwall.com/v1";
const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function ok(body) {
  return new Response(JSON.stringify(body), { status: 200, headers: CORS });
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return ok({ ok: false, error: "Invalid JSON body" });
  }

  const currency = body.currency ?? "USD";
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    return ok({ ok: false, error: "No items provided" });
  }

  let cartRes, cartText;
  try {
    cartRes = await fetch(
      `${FW_BASE}/carts?storefront_token=${context.env.FW_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      },
    );
    cartText = await cartRes.text();
  } catch (err) {
    return ok({
      ok: false,
      error: "Network error creating cart",
      detail: String(err),
    });
  }

  if (!cartRes.ok) {
    return ok({
      ok: false,
      error: `Cart creation failed (FW ${cartRes.status})`,
      detail: cartText,
    });
  }

  let cart;
  try {
    cart = JSON.parse(cartText);
  } catch {
    return ok({
      ok: false,
      error: "FW returned non-JSON for cart",
      detail: cartText,
    });
  }

  const cartId = cart.id;
  if (!cartId) {
    return ok({
      ok: false,
      error: "FW cart missing id field",
      detail: cartText,
    });
  }

  return ok({ ok: true, cartId });
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
