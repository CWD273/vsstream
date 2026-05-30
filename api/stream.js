import { getStream } from "../lib/catalog.js";
import { rewritePlaylist } from "../lib/rewrite.js";

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

    const upstream = await fetch(stream.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}`
      });
    }

    const contentType =
      upstream.headers.get("content-type") || "";

    const host = `https://${req.headers.host}`;

    // If it's an HLS playlist, rewrite it
    if (
      contentType.includes("mpegurl") ||
      contentType.includes("m3u") ||
      stream.url.toLowerCase().includes(".m3u8")
    ) {
      const playlist = await upstream.text();

      const rewritten = rewritePlaylist(
        playlist,
        stream.url,
        host
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.apple.mpegurl"
      );

      res.setHeader(
        "Cache-Control",
        "public, max-age=15"
      );

      return res.status(200).send(rewritten);
    }

    // Fallback: proxy non-playlist content directly
    const buffer = Buffer.from(
      await upstream.arrayBuffer()
    );

    res.setHeader(
      "Content-Type",
      contentType || "application/octet-stream"
    );

    return res.status(200).send(buffer);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
