// Locally-generated grayscale editorial placeholders (inline SVG data URIs) —
// no network dependency, so the interface renders identically everywhere.
// Swap for real photography once the CMS/DAM is wired up.

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function monogram(seed: string) {
  const words = seed.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ");
  const letters = words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "GA";
}

export function editorialImage(seed: string, width = 1200, height = 1500) {
  const h = hash(seed);
  const base = 18 + (h % 10); // 18-27% lightness for a near-black ground
  const lift = 6 + (h % 6); // subtle gradient lift
  const angle = (h % 4) * 45;
  const label = monogram(seed);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="hsl(0,0%,${base}%)" />
      <stop offset="100%" stop-color="hsl(0,0%,${base + lift}%)" />
    </linearGradient>
    <pattern id="lines" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="26" stroke="hsl(0,0%,100%)" stroke-opacity="0.035" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)" />
  <rect width="${width}" height="${height}" fill="url(#lines)" />
  <rect x="${width * 0.06}" y="${height * 0.06}" width="${width * 0.88}" height="${height * 0.88}" fill="none" stroke="hsl(0,0%,100%)" stroke-opacity="0.12" stroke-width="1.5" />
  <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(width * 0.16)}"
    fill="hsl(0,0%,100%)" fill-opacity="0.16" letter-spacing="4">${label}</text>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
