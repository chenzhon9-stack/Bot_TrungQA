const BASE = "https://bot-api.zaloplatforms.com";

function token() {
  const t = String(process.env.BOT_TOKEN || "").trim();
  if (!t) throw new Error("Thiếu BOT_TOKEN");
  return t.replace(/^bot/i, "");
}

async function zaloPost(method, body = {}) {
  const r = await fetch(`${BASE}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  let data;
  try {
    data = JSON.parse(text || "{}");
  } catch (e) {
    data = { ok: false, description: text };
  }

  return { httpStatus: r.status, data };
}

function adminOK(req) {
  const k = String(process.env.ADMIN_KEY || "").trim();
  return !!k && String(req.headers["x-admin-key"] || "").trim() === k;
}

module.exports = { zaloPost, adminOK };
