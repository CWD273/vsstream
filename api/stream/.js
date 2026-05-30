import { getCatalog }
  from "../../lib/catalog.js";

import { rewritePlaylist }
  from "../../lib/rewrite.js";

export default async function handler(
  req,
  res
) {
  const { id } = req.query;

  try {
    const streams = await getCatalog();

    const stream =
      streams[Number(id)];

    if (!stream) {
      return res
        .status(404)
        .send("Not found");
    }

    const upstream =
      await fetch(stream.url);

    const text =
      await upstream.text();

    const host =
      `https://${req.headers.host}`;

    const playlist =
      rewritePlaylist(
        text,
        stream.url,
        host
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.send(playlist);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
