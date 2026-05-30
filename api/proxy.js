import { rewritePlaylist }
  from "../lib/rewrite.js";

export default async function handler(
  req,
  res
) {
  const { u } = req.query;

  if (!u) {
    return res.status(400)
      .send("Missing URL");
  }

  try {
    const upstream =
      await fetch(u);

    if (!upstream.ok) {
      return res.status(
        upstream.status
      ).send("Upstream failed");
    }

    const text =
      await upstream.text();

    const host =
      `https://${req.headers.host}`;

    const rewritten =
      rewritePlaylist(
        text,
        u,
        host
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.setHeader(
      "Cache-Control",
      "public,max-age=15"
    );

    res.send(rewritten);
  } catch (err) {
    res.status(500)
      .send(err.message);
  }
}
