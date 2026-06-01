export default async function handler(req, res) {
  const { u } = req.query;

  console.log("REQUEST:", req.url);
  console.log("QUERY:", req.query);

  if (!u) {
    console.error("Missing u parameter");

    return res.status(400).json({
      error: "Missing URL",
      request: req.url,
      query: req.query
    });
  }

  try {
    const upstream = await fetch(u, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    console.log(
      "FETCH",
      u,
      upstream.status
    );

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "Upstream error",
        status: upstream.status,
        url: u
      });
    }

    const contentType =
      upstream.headers.get("content-type") ||
      "application/octet-stream";

    res.setHeader(
      "Content-Type",
      contentType
    );

    const buffer = Buffer.from(
      await upstream.arrayBuffer()
    );

    res.send(buffer);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
}
