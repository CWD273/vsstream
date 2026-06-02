import { rewritePlaylist } from "../lib/rewrite.js";

export default async function handler(req, res) {
  const { u } = req.query;

  if (!u) {
    return res.status(400).send("Missing URL");
  }

  try {
    const upstream = await fetch(u, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .send(await upstream.text());
    }

    const playlist = await upstream.text();

    const host =
      `https://${req.headers.host}`;

    const rewritten =
      rewritePlaylist(
        playlist,
        u,
        host
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return res.send(rewritten);

  } catch (err) {
    return res.status(500).send(err.message);
  }
}
