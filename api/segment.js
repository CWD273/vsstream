export default async function handler(req, res) {
  const { u } = req.query;

  console.log("========== SEGMENT REQUEST ==========");
  console.log("Time:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("u:", u);

  if (!u) {
    console.error("Missing URL parameter");

    return res.status(400).json({
      error: "Missing URL",
      requestUrl: req.url,
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

    const contentType =
      upstream.headers.get("content-type");

    const contentLength =
      upstream.headers.get("content-length");

    console.log("Upstream URL:", u);
    console.log("Upstream Status:", upstream.status);
    console.log("Upstream Content-Type:", contentType);
    console.log("Upstream Content-Length:", contentLength);

    if (!upstream.ok) {
      const body = await upstream.text();

      console.error("Upstream returned error");
      console.error("Status:", upstream.status);
      console.error("Body Preview:", body.slice(0, 500));

      return res.status(upstream.status).json({
        error: "Upstream error",
        status: upstream.status,
        contentType,
        bodyPreview: body.slice(0, 200)
      });
    }

    const buffer = Buffer.from(
      await upstream.arrayBuffer()
    );

    console.log(
      "Downloaded bytes:",
      buffer.length
    );

    res.setHeader(
      "Content-Type",
      contentType || "video/mp2t"
    );

    if (contentLength) {
      res.setHeader(
        "Content-Length",
        contentLength
      );
    }

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Accept-Ranges",
      "bytes"
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    console.log(
      "Response sent successfully"
    );

    return res.send(buffer);

  } catch (err) {
    console.error("Proxy exception:");
    console.error(err);

    return res.status(500).json({
      error: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined
    });
  }
}
