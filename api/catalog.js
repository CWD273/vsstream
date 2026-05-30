import { getCatalog } from "../lib/catalog.js";

export default async function handler(req, res) {
  try {
    const catalog = await getCatalog();

    const output = Object.entries(catalog).map(
      ([id, stream]) => ({
        id,
        title: stream.title,
        tn: stream.tn
      })
    );

    res.status(200).json(output);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}
