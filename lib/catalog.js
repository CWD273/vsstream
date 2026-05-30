const CATALOG_URL =
  "https://siteitsc.github.io/streamdata.json";

let cache = null;
let cacheTime = 0;

export async function getCatalog() {
  const now = Date.now();

  if (cache && now - cacheTime < 300000) {
    return cache;
  }

  const response = await fetch(CATALOG_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch catalog");
  }

  cache = await response.json();
  cacheTime = now;

  return cache;
}

export async function getStream(id) {
  const catalog = await getCatalog();

  return catalog[id] || null;
}
