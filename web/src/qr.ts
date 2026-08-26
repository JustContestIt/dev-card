import qrcodegen from 'qrcode-generator';

/** Render a QR code as a crisp inline SVG (no external images — CSP-friendly). */
export function qrSvg(text: string, sizePx: number): string {
  const qr = qrcodegen(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const cell = sizePx / (n + 2); // 1-module quiet zone
  let path = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        const x = (c + 1) * cell;
        const y = (r + 1) * cell;
        path += `M${x.toFixed(2)} ${y.toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
      }
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" ` +
    `viewBox="0 0 ${sizePx} ${sizePx}" role="img" aria-label="QR"><path d="${path}" fill="currentColor"/></svg>`
  );
}
