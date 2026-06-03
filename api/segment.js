export default async function handler(req, res) {
  const { u } = req.query;

  console.log("========== SEGMENT REQUEST ==========");
  console.log("Time:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("u:", u);

  if (!u) {
    return res.status(400).json({
      error: "Missing URL",
      requestUrl: req.url,
      query: req.query
    });
  }

  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    };

    if (req.headers.range) {
      headers.Range = req.headers.range;
      console.log(
        "Forwarding Range:",
        req.headers.range
      );
    }

    const upstream = await fetch(u, {
      headers,
      cache: "no-store"
    });

    const contentType =
      upstream.headers.get("content-type");

    const contentLength =
      upstream.headers.get("content-length");

    const contentRange =
      upstream.headers.get("content-range");

    const acceptRanges =
      upstream.headers.get("accept-ranges");

    console.log("Upstream Status:", upstream.status);
    console.log("Content-Type:", contentType);
    console.log("Content-Length:", contentLength);
    console.log("Content-Range:", contentRange);

    if (!upstream.ok) {
      const body = await upstream.text();

      console.error("Upstream Error");
      console.error("Status:", upstream.status);
      console.error("Body:", body);

      return res.status(upstream.status).json({
        error: "Upstream error",
        status: upstream.status,
        body
      });
    }

    const buffer = Buffer.from(
      await upstream.arrayBuffer()
    );

    res.status(upstream.status);

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

    if (contentRange) {
      res.setHeader(
        "Content-Range",
        contentRange
      );
    }

    if (acceptRanges) {
      res.setHeader(
        "Accept-Ranges",
        acceptRanges
      );
    } else {
      res.setHeader(
        "Accept-Ranges",
        "bytes"
      );
    }

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.send(buffer);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
}
