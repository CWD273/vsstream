import { getStream } from "../lib/catalog.js";
import { rewritePlaylist } from "../lib/rewrite.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  try {
    const stream = await getStream(id);

    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    const upstream = await fetch(stream.url);

    if (!upstream.ok) {
      return res.status(upstream.status).send("Upstream failed");
    }

    const playlist = await upstream.text();

    const host = `https://${req.headers.host}`;

    const rewritten = rewritePlaylist(
      playlist,
      stream.url,
      host
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.send(rewritten);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
