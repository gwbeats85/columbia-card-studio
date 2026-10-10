export type BackgroundStyle = 'studio' | 'spotlight' | 'diagonal' | 'paper' | 'image';

const PAPER = '#F1F4E6';
const NEAR_WHITE = '#FAFAF7';
const DARK_INK = '#121212';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function rgba(color: string, alpha: number) {
  const value = color.trim();
  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return value;
  const expanded = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${clamp01(alpha)})`;
}

function polygon(ctx: CanvasRenderingContext2D, points: Array<[number, number]>) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  const narrow = radius * 0.18;
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + narrow, y - narrow);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x + narrow, y + narrow);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - narrow, y + narrow);
  ctx.lineTo(x - radius, y);
  ctx.lineTo(x - narrow, y - narrow);
  ctx.closePath();
  ctx.fill();
}

export function backgroundInk(style: BackgroundStyle): string {
  return style === 'paper' ? DARK_INK : NEAR_WHITE;
}

export function drawBrandBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: BackgroundStyle,
  accent: string,
  base: string,
  strength: number,
): void {
  if (width <= 0 || height <= 0) return;

  const intensity = clamp01(strength);
  const unit = Math.min(width, height);
  const cx = width * 0.5;
  const cy = height * 0.5;

  ctx.save();
  try {
    // These styles are owned by the legacy studio/image paths. Keeping the
    // function a no-op here avoids painting over their caller-provided scene.
    if (style === 'studio' || style === 'image') return;

    if (style === 'spotlight') {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      const pool = ctx.createRadialGradient(cx, height * 0.42, unit * 0.04, cx, height * 0.42, height * 0.76);
      pool.addColorStop(0, rgba(accent, 0.2 * intensity));
      pool.addColorStop(0.46, rgba(accent, 0.08 * intensity));
      pool.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = accent;
      ctx.lineWidth = unit * 0.012;
      ctx.globalAlpha = 0.15 * intensity;
      ctx.beginPath();
      ctx.arc(width * 0.02, height * 0.47, height * 0.39, -Math.PI * 0.55, Math.PI * 0.56);
      ctx.stroke();
      ctx.globalAlpha = 0.06 * intensity;
      ctx.lineWidth = unit * 0.003;
      ctx.beginPath();
      ctx.arc(width * 0.02, height * 0.47, height * 0.44, -Math.PI * 0.48, Math.PI * 0.51);
      ctx.stroke();

      ctx.globalAlpha = 0.58 * intensity;
      ctx.fillStyle = accent;
      ctx.fillRect(width * 0.11, height * 0.91, width * 0.78, unit * 0.0025);
      return;
    }

    if (style === 'diagonal') {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = rgba(accent, 0.24 * intensity);
      polygon(ctx, [[0, 0], [width * 0.42, 0], [width * 0.11, height * 0.2], [0, height * 0.24]]);
      polygon(ctx, [[width, height], [width * 0.58, height], [width * 0.89, height * 0.8], [width, height * 0.76]]);

      ctx.fillStyle = rgba(accent, 0.11 * intensity);
      polygon(ctx, [[0, height * 0.055], [width * 0.29, 0], [width * 0.34, 0], [0, height * 0.095]]);
      polygon(ctx, [[width, height * 0.945], [width * 0.71, height], [width * 0.66, height], [width, height * 0.905]]);

      ctx.strokeStyle = accent;
      ctx.lineWidth = unit * 0.0025;
      ctx.globalAlpha = 0.45 * intensity;
      ctx.beginPath();
      ctx.moveTo(width * 0.045, height * 0.24);
      ctx.lineTo(width * 0.28, height * 0.055);
      ctx.moveTo(width * 0.955, height * 0.76);
      ctx.lineTo(width * 0.72, height * 0.945);
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.56 * intensity;
      sparkle(ctx, width * 0.86, height * 0.12, unit * 0.024);
      ctx.globalAlpha = 0.32 * intensity;
      sparkle(ctx, width * 0.14, height * 0.88, unit * 0.016);
      return;
    }

    // Paper intentionally uses the storefront's pale editorial surface even
    // when the caller's dark base is used by the other brand studies.
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = rgba(accent, 0.18 * intensity);
    ctx.beginPath();
    ctx.arc(width * 1.03, height * 0.1, height * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(accent, 0.1 * intensity);
    ctx.beginPath();
    ctx.arc(width * -0.12, height * 0.94, height * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = base || DARK_INK;
    ctx.globalAlpha = 0.72 * intensity;
    ctx.lineWidth = unit * 0.003;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.08);
    ctx.lineTo(width * 0.23, height * 0.08);
    ctx.moveTo(width * 0.08, height * 0.08);
    ctx.lineTo(width * 0.08, height * 0.17);
    ctx.moveTo(width * 0.77, height * 0.92);
    ctx.lineTo(width * 0.92, height * 0.92);
    ctx.moveTo(width * 0.92, height * 0.83);
    ctx.lineTo(width * 0.92, height * 0.92);
    ctx.stroke();

    ctx.fillStyle = base || DARK_INK;
    ctx.globalAlpha = 0.52 * intensity;
    sparkle(ctx, width * 0.16, height * 0.2, unit * 0.014);
    sparkle(ctx, width * 0.84, height * 0.8, unit * 0.01);
  } finally {
    ctx.restore();
  }
}
