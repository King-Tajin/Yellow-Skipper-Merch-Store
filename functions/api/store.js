// noinspection JSUnusedGlobalSymbols
// noinspection JSUnresolvedVariable

const FW_BASE =
  "https://storefront-api.fourthwall.com/v1/collections/all/products";

export async function onRequestGet(context) {
  const incoming = new URL(context.request.url);
  const size = incoming.searchParams.get("size") ?? "50";
  const page = incoming.searchParams.get("page") ?? "0";
  const currency = incoming.searchParams.get("currency") ?? "USD";
  const debug = incoming.searchParams.get("debug") === "1";

  const url = `${FW_BASE}?storefront_token=${context.env.FW_TOKEN}&size=${size}&page=${page}&currency=${currency}`;

  const fwRes = await fetch(url, { method: "GET" });

  if (!fwRes.ok) {
    const errorBody = await fwRes.text();
    return new Response(errorBody, {
      status: fwRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const data = await fwRes.text();

  if (debug) {
    try {
      const json = JSON.parse(data);
      const first = json.results?.[0] ?? json;
      return new Response(JSON.stringify(first, null, 2), {
        status: fwRes.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch {
      return new Response(data, {
        status: fwRes.status,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }

  return new Response(data, {
    status: fwRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
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
