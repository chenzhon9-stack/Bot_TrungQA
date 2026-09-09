const { zaloPost, adminOK } = require("./zalo");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!adminOK(req)) {
    return res.status(403).json({ ok: false, error: "Invalid admin key" });
  }

  try {
    const action = String((req.body && req.body.action) || "").trim();

    if (action === "getMe") {
      return res.status(200).json(await zaloPost("getMe"));
    }

    if (action === "getWebhookInfo") {
      return res.status(200).json(await zaloPost("getWebhookInfo"));
    }

    if (action === "deleteWebhook") {
      return res.status(200).json(await zaloPost("deleteWebhook"));
    }

    if (action === "setWebhook") {
      const base = String(process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");

      if (!base.startsWith("https://")) {
        return res.status(400).json({
          ok: false,
          error: "PUBLIC_BASE_URL phải bắt đầu bằng https://",
        });
      }

      const secret = String(process.env.WEBHOOK_SECRET || "").trim();
      if (!secret) {
        return res.status(400).json({
          ok: false,
          error: "Thiếu WEBHOOK_SECRET",
        });
      }

      const webhookUrl = base + "/api/webhook";

      const result = await zaloPost("setWebhook", {
        url: webhookUrl,
        secret_token: secret,
      });

      return res.status(200).json({
        ...result,
        requestedWebhookUrl: webhookUrl,
      });
    }

    return res.status(400).json({
      ok: false,
      error: "Action không hợp lệ",
      action,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      ok: false,
      error: String(e.message || e),
    });
  }
};
