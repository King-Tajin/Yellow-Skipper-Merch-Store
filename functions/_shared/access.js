import { jsonResponse } from "./http.js";
import { getListedProducts } from "./products.js";
import { hasValidSession } from "./session.js";

export async function guardUnlistedVariants(request, env, variantIds) {
  if (await hasValidSession(request, env.UNLISTED_CODE)) return null;

  let products;
  try {
    products = await getListedProducts(env);
  } catch {
    return jsonResponse(
      { ok: false, error: "Unable to verify items right now, try again" },
      503
    );
  }

  const listed = new Set(
    products.flatMap((product) =>
      (product.variants ?? []).map((variant) => variant.id)
    )
  );

  if (variantIds.every((id) => typeof id === "string" && listed.has(id))) {
    return null;
  }

  return jsonResponse(
    {
      ok: false,
      error: "Access code required for these items, re-enter your code",
    },
    403
  );
}
