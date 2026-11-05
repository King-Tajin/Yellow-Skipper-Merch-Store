// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

import { guardUnlistedVariants } from "../_shared/access.js";
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

  const denied = await guardUnlistedVariants(
    context.request,
    context.env,
    variantIds
  );
  if (denied) return denied;

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
