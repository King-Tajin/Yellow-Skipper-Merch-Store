// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

import { readCartRequest, probeVariants } from "../_shared/cart.js";
import { ok, optionsResponse } from "../_shared/http.js";

const MAX_VARIANTS = 50;

export async function onRequestPost(context) {
  const input = await readCartRequest(
    context.request,
    "variantIds",
    "No variants provided"
  );
  if (input.error) return ok({ ok: false, error: input.error });

  const variantIds = input.list
    .filter((id) => typeof id === "string")
    .slice(0, MAX_VARIANTS);

  const { unavailable, unknown } = await probeVariants(
    variantIds,
    input.currency,
    context.env
  );

  return ok({ ok: true, unavailableVariantIds: [...unavailable, ...unknown] });
}

export function onRequestOptions() {
  return optionsResponse("POST");
}
