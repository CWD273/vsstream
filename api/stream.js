import { getStream } from "../lib/catalog.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      error: "Missing stream id"
    });
  }

  try {
    const stream = await getStream(id);

    if (!stream) {
      return res.status(404).json({
        error: "Stream not found"
      });
    }

    const host = `https://${req.headers.host}`;

    const ts = Date.now();

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return res.redirect(
      302,
      `${host}/api/proxy?u=${encodeURIComponent(
        stream.url
      )}&t=${ts}`
    );
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
