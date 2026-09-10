module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const adminKey = String(process.env.ADMIN_KEY || "").trim();
  const supplied = String(req.headers["x-admin-key"] || "").trim();
  if (!adminKey || supplied !== adminKey) {
    return res.status(403).json({ ok: false, error: "Invalid admin key" });
  }

  return res.status(200).json({
    ok: true,
    env: {
      has_bot_token: !!process.env.BOT_TOKEN,
      has_admin_key: !!process.env.ADMIN_KEY,
      has_webhook_secret: !!process.env.WEBHOOK_SECRET,
      has_public_base_url: !!process.env.PUBLIC_BASE_URL,
      has_apps_script_url: !!process.env.APPS_SCRIPT_URL,
      has_apps_script_secret: !!process.env.APPS_SCRIPT_SECRET,
      public_base_url: process.env.PUBLIC_BASE_URL || "",
      apps_script_url_preview: process.env.APPS_SCRIPT_URL
        ? process.env.APPS_SCRIPT_URL.substring(0, 55) + "..."
        : "",
    },
  });
};
