const { zaloPost, adminOK } = require("./zalo");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!adminOK(req)) {
    return res.status(403).json({ ok: false, error: "Invalid admin key" });
  }

  const body = req.body || {};
  const chatId = String(body.chat_id || "").trim();
  const text = String(body.text || "").trim();

  if (!chatId || !text) {
    return res.status(400).json({ ok: false, error: "Missing chat_id or text" });
  }

  try {
    const result = await zaloPost("sendMessage", { chat_id: chatId, text });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
