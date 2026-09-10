module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const expected = String(process.env.WEBHOOK_SECRET || "").trim();
  const supplied = String(
    req.headers["x-bot-api-secret-token"] ||
    req.headers["x-webhook-secret"] ||
    ""
  ).trim();

  if (expected && supplied !== expected) {
    console.log(JSON.stringify({ type: "WEBHOOK_REJECTED", at: new Date().toISOString() }));
    return res.status(403).json({ ok: false, error: "Invalid webhook secret" });
  }

  console.log(JSON.stringify({
    type: "WEBHOOK_RECEIVED",
    at: new Date().toISOString(),
    body: req.body || null,
  }));

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (appsScriptUrl) {
    const forwardPayload = {
      source: "vercel_webhook",
      received_at: new Date().toISOString(),
      forward_secret: process.env.APPS_SCRIPT_SECRET || process.env.WEBHOOK_SECRET || "",
      data: req.body || {},
    };

    try {
      const r = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(forwardPayload),
      });
      const text = await r.text();
      console.log(JSON.stringify({
        type: "FORWARD_RESULT",
        status: r.status,
        response: text.substring(0, 300),
      }));
    } catch (err) {
      console.error("Forward to Apps Script error:", err);
    }
  } else {
    console.log(JSON.stringify({ type: "FORWARD_SKIPPED", reason: "Missing APPS_SCRIPT_URL" }));
  }

  return res.status(200).json({ ok: true, message: "Webhook received" });
};
