export function rewritePlaylist(text, sourceUrl, host) {
  const base = new URL(sourceUrl);

  return text.replace(
    /^([^#][^\r\n]*)$/gm,
    (line) => {
      line = line.trim();

      if (!line) return line;

      const absolute =
        new URL(line, base).href;

      const lower =
        absolute.toLowerCase();

      const isPlaylist =
        lower.endsWith(".m3u8") ||
        lower.includes(".m3u8?");

      if (isPlaylist) {
        return `${host}/api/proxy?u=${encodeURIComponent(
          absolute
        )}`;
      }

      return `${host}/api/segment?u=${encodeURIComponent(
        absolute
      )}`;
    }
  );
}
