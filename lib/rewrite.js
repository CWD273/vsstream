export function rewritePlaylist(text, sourceUrl, host) {
  const base = new URL(sourceUrl);

  return text.replace(/^([^#][^\r\n]*)$/gm, line => {
    const absolute = new URL(line.trim(), base).href;
    return `${host}/api/segment?u=${encodeURIComponent(absolute)}`;
  });
}
