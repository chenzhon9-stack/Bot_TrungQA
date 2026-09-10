module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const adminKey = String(process.env.ADMIN_KEY || "").trim();
  const supplied = String(req.headers["x-admin-key"] || "").trim();
  if (!adminKey || supplied !== adminKey) {
    return res.status(403).json({ ok: false, error: "Invalid admin key" });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    return res.status(500).json({ ok: false, error: "Missing APPS_SCRIPT_URL" });
  }

  const payload = {
    source: "vercel_test_forward",
    received_at: new Date().toISOString(),
    forward_secret: process.env.APPS_SCRIPT_SECRET || process.env.WEBHOOK_SECRET || "",
    data: {
      ok: true,
      result: {
        update_id: "TEST_" + Date.now(),
        event_name: "message.text.received",
        message: {
          message_id: "TEST_MSG_" + Date.now(),
          text: "/id",
          chat: { id: "caadb17bc4252d7b7434", type: "private", title: "Test" },
          from: { id: "caadb17bc4252d7b7434", display_name: "Trungvt" },
        },
      },
    },
  };

  try {
    const r = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }

    return res.status(200).json({
      ok: r.ok,
      apps_script_status: r.status,
      apps_script_response: json,
      sent_payload: payload,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
};
