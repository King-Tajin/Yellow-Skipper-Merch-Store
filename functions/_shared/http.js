export const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export function ok(body) {
  return jsonResponse(body, 200);
}

export function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function readJsonBody(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

export async function upstreamErrorResponse(res) {
  const errorBody = await res.text();
  return new Response(errorBody, { status: res.status, headers: CORS });
}

export function optionsResponse(methods) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": `${methods}, OPTIONS`,
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/**
 * @param {{ ASSETS: { fetch: (input: URL | Request | string, init?: RequestInit) => Promise<Response> } }} env
 * @param {Request} request
 * @param {string} path
 * @returns {Promise<Response>}
 */
export async function fetchAsset(env, request, path) {
  let res = await env.ASSETS.fetch(new URL(path, request.url));
  if (res.status >= 300 && res.status < 400) {
    const redirectTo = res.headers.get("Location");
    if (redirectTo) {
      res = await env.ASSETS.fetch(new URL(redirectTo, request.url));
    }
  }
  return res;
}
