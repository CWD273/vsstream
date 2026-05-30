export default async function handler(req, res) {
  const { u } = req.query;

  if (!u) {
    return res.status(400).send("Missing URL");
  }

  try {
    const upstream = await fetch(u);

    if (!upstream.ok) {
      return res.status(upstream.status).send("Upstream error");
    }

    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ||
      "application/octet-stream"
    );

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
