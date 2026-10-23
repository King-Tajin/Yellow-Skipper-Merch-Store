// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

import { postCart, probeVariants, readCartRequest } from "../_shared/cart.js";
import { ok, optionsResponse, parseJson } from "../_shared/http.js";

export async function onRequestPost(context) {
  const input = await readCartRequest(
    context.request,
    "items",
    "No items provided"
  );
  if (input.error) return ok({ ok: false, error: input.error });

  const { currency, list: items } = input;

  let cartRes, cartText;
  try {
    cartRes = await postCart(items, currency, context.env);
    cartText = await cartRes.text();
  } catch (err) {
    return ok({
      ok: false,
      error: "Network error creating cart",
      detail: String(err),
    });
  }

  const cart = parseJson(cartText);

  if (!cartRes.ok) {
    if (cart && cart.code === "CART_OFFER_NOT_AVAILABLE") {
      const { unavailable: unavailableVariantIds } = await probeVariants(
        items.map((i) => i.variantId),
        currency,
        context.env
      );
      if (cart.variantId && !unavailableVariantIds.includes(cart.variantId)) {
        unavailableVariantIds.push(cart.variantId);
      }
      return ok({
        ok: false,
        error: "Some items are currently unavailable",
        code: cart.code,
        unavailableVariantIds,
        detail: cartText,
      });
    }
    return ok({
      ok: false,
      error: `Cart creation failed (FW ${cartRes.status})`,
      detail: cartText,
    });
  }

  if (!cart) {
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

export function onRequestOptions() {
  return optionsResponse("POST");
}
