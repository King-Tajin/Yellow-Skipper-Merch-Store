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
