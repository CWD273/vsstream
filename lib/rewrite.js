export function rewritePlaylist(
  text,
  sourceUrl,
  host
) {
  const base = new URL(sourceUrl);

  return text.replace(
    /^([^#][^\r\n]*)$/gm,
    line => {
      line = line.trim();

      if (!line) {
        return line;
      }

      const absolute =
        new URL(line, base).href;

      const ts = Date.now();

      if (
        absolute.includes(".m3u8")
      ) {
        return `${host}/api/proxy?u=${encodeURIComponent(
          absolute
        )}&t=${ts}`;
      }

      return `${host}/api/segment?u=${encodeURIComponent(
        absolute
      )}&t=${ts}`;
    }
  );
}
