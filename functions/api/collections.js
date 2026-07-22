// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

const FW_BASE = "https://storefront-api.fourthwall.com/v1/collections";
const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export async function onRequestGet(context) {
  const url = `${FW_BASE}?storefront_token=${context.env.FW_TOKEN}`;
  const fwRes = await fetch(url, { method: "GET" });

  if (!fwRes.ok) {
    const errorBody = await fwRes.text();
    return new Response(errorBody, { status: fwRes.status, headers: CORS });
  }

  const json = await fwRes.json();
  const list = Array.isArray(json) ? json : (json.results ?? []);
  const hiddenHandle = context.env.UNLISTED_COLLECTION_HANDLE ?? "unlisted";

  const visible = list.filter((c) => {
    const handle = c.slug ?? c.handle ?? "";
    return handle !== hiddenHandle && handle !== "all";
  });

  return new Response(JSON.stringify(visible), { status: 200, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
