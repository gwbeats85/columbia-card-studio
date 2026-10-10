export type PostsTemplate = 'new-arrivals' | 'featured-card';
export type PostsFormat = 'portrait' | 'square' | 'vertical';

export type PostsImage = {
  dataUrl: string;
  name: string;
};

export type PostsProject = {
  version: 1;
  template: PostsTemplate;
  format: PostsFormat;
  headline: string;
  details: string;
  price: string;
  cta: string;
  badge: string;
  image: PostsImage | null;
  customBackground: PostsImage | null;
  imageScale: number;
  imageX: number;
  imageY: number;
};

export type PostsRenderAssets = {
  logo: HTMLImageElement | null;
  image: HTMLImageElement | null;
  templateBackground: HTMLImageElement | null;
  customBackground: HTMLImageElement | null;
};

export const POSTS_DIMENSIONS: Record<PostsFormat, { width: number; height: number }> = {
  portrait: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
};

export const DEFAULT_POSTS_SAMPLE = '/samples/ty-cobb-front.jpg';
export const POSTS_LOGO = '/brand/columbia-sports-cards-wordmark.png';

const MAX_DATA_URL_LENGTH = 46 * 1024 * 1024;
const imageDataPattern = /^data:image\/(?:png|jpeg|webp);base64,[a-z\d+/]+=*$/i;
const pngDataPattern = /^data:image\/png;base64,[a-z\d+/]+=*$/i;

export function templateBackgroundUrl(template: PostsTemplate) {
  return `/templates/${template}-background.png`;
}

export function defaultPostsProject(): PostsProject {
  return {
    version: 1,
    template: 'new-arrivals',
    format: 'portrait',
    headline: 'TY COBB',
    details: '1911 · ARCHIVAL SAMPLE',
    price: '',
    cta: 'VIEW THE CARD',
    badge: 'DEMO SAMPLE',
    image: null,
    customBackground: null,
    imageScale: 1,
    imageX: 0,
    imageY: 0,
  };
}

export function copyPostsProject(project: PostsProject): PostsProject {
  return {
    ...project,
    image: project.image ? { ...project.image } : null,
    customBackground: project.customBackground ? { ...project.customBackground } : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function boundedString(value: unknown, label: string, max: number) {
  if (typeof value !== 'string') throw new Error(`Project ${label} must be text.`);
  if (value.length > max) throw new Error(`Project ${label} is too long.`);
  return value;
}

function boundedNumber(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Project ${label} is outside the supported range.`);
  }
  return value;
}

function validateImage(value: unknown, label: string, pngOnly = false): PostsImage | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw new Error(`Project ${label} is invalid.`);
  const dataUrl = boundedString(value.dataUrl, `${label} data`, MAX_DATA_URL_LENGTH);
  const name = boundedString(value.name, `${label} name`, 160);
  const valid = pngOnly ? pngDataPattern.test(dataUrl) : imageDataPattern.test(dataUrl);
  if (!valid) throw new Error(`Project ${label} must be an embedded PNG, JPEG, or WebP data URL.`);
  return { dataUrl, name };
}

export function validatePostsProject(value: unknown): PostsProject {
  if (!isRecord(value) || value.version !== 1) throw new Error('Unsupported Posts project file.');
  const template = value.template;
  if (template !== 'new-arrivals' && template !== 'featured-card') throw new Error('Project template is unsupported.');
  const format = value.format;
  if (format !== 'portrait' && format !== 'square' && format !== 'vertical') throw new Error('Project format is unsupported.');
  return {
    version: 1,
    template,
    format,
    headline: boundedString(value.headline, 'headline', 90),
    details: boundedString(value.details, 'details', 140),
    price: boundedString(value.price, 'price', 40),
    cta: boundedString(value.cta, 'CTA', 40),
    badge: boundedString(value.badge, 'badge', 32),
    image: validateImage(value.image, 'image'),
    customBackground: validateImage(value.customBackground, 'custom background', true),
    imageScale: boundedNumber(value.imageScale, 'image scale', 0.65, 1.2),
    imageX: boundedNumber(value.imageX, 'image X', -1, 1),
    imageY: boundedNumber(value.imageY, 'image Y', -1, 1),
  };
}

export function serializePostsProject(project: PostsProject) {
  return JSON.stringify(project, null, 2);
}

export function importPostsProject(json: string): PostsProject {
  if (json.length > MAX_DATA_URL_LENGTH * 2) throw new Error('Project file is too large.');
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('Project file is not valid JSON.');
  }
  return validatePostsProject(value);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src.startsWith('data:') ? 'the embedded image' : 'the image asset'}.`));
    image.src = src;
  });
}

function fallbackBackground(ctx: CanvasRenderingContext2D, project: PostsProject, width: number, height: number) {
  const dark = project.template === 'new-arrivals';
  ctx.fillStyle = dark ? '#121212' : '#F1F4E6';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = dark ? 'rgba(158,185,74,0.14)' : 'rgba(158,185,74,0.18)';
  ctx.beginPath();
  ctx.arc(dark ? width * 0.96 : width * 1.05, height * 0.08, height * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = dark ? 'rgba(158,185,74,0.4)' : 'rgba(18,18,18,0.22)';
  ctx.lineWidth = Math.max(1, width * 0.002);
  ctx.beginPath();
  ctx.moveTo(width * 0.08, height * 0.26);
  ctx.lineTo(width * 0.33, height * 0.08);
  ctx.moveTo(width * 0.67, height * 0.92);
  ctx.lineTo(width * 0.92, height * 0.74);
  ctx.stroke();
}

export type TextLayout = { lines: string[]; fontSize: number; lineHeight: number; height: number };

function splitLongWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number) {
  const pieces: string[] = [];
  let piece = '';
  for (const character of word) {
    const candidate = piece + character;
    if (piece && ctx.measureText(candidate).width > maxWidth) {
      pieces.push(piece);
      piece = character;
    } else piece = candidate;
  }
  if (piece) pieces.push(piece);
  return pieces;
}

function linesAtWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(''); continue; }
    let line = '';
    for (const word of words) {
      const pieces = ctx.measureText(word).width <= maxWidth ? [word] : splitLongWord(ctx, word, maxWidth);
      for (const piece of pieces) {
        const candidate = line ? `${line} ${piece}` : piece;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = piece;
        } else line = candidate;
      }
    }
    if (line || !lines.length) lines.push(line);
  }
  return lines;
}

export function layoutText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  weight: number,
  lineHeightMultiplier = 1.08,
  maxHeight?: number,
): TextLayout {
  let size = maxSize;
  let lines: string[] = [];
  const floor = maxHeight === undefined ? minSize : 6;
  while (size >= floor) {
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
    lines = linesAtWidth(ctx, text, maxWidth);
    const lineHeight = size * lineHeightMultiplier;
    if (lines.every((entry) => ctx.measureText(entry).width <= maxWidth) && (maxHeight === undefined || lines.length * lineHeight <= maxHeight)) return { lines, fontSize: size, lineHeight, height: lines.length * lineHeight };
    size -= 1;
  }
  const finalSize = maxHeight === undefined ? minSize : floor;
  ctx.font = `${weight} ${finalSize}px Arial, sans-serif`;
  const minimumLines = linesAtWidth(ctx, text, maxWidth);
  return { lines: minimumLines, fontSize: finalSize, lineHeight: finalSize * lineHeightMultiplier, height: minimumLines.length * finalSize * lineHeightMultiplier };
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  color: string,
  weight: number,
  align: CanvasTextAlign = 'left',
  lineHeightMultiplier = 1.08,
  maxHeight?: number,
) {
  const layout = layoutText(ctx, text, maxWidth, maxSize, minSize, weight, lineHeightMultiplier, maxHeight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.font = `${weight} ${layout.fontSize}px Arial, sans-serif`;
  layout.lines.forEach((line, index) => ctx.fillText(line, x, y + index * layout.lineHeight));
  return { ...layout, height: layout.lines.length * layout.lineHeight };
}

function fitLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxSize: number, minSize: number, weight: number) {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  let fontSize = Math.max(minSize, size);
  ctx.font = `${weight} ${fontSize}px Arial, sans-serif`;
  const measured = ctx.measureText(text).width;
  if (measured > maxWidth) fontSize = Math.max(6, fontSize * maxWidth / measured);
  ctx.font = `${weight} ${fontSize}px Arial, sans-serif`;
  return { fontSize, width: ctx.measureText(text).width };
}

function drawContainImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, scale: number, offsetX: number, offsetY: number, radius: number) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (!imageWidth || !imageHeight) return;
  const imageScale = Math.min(width / imageWidth, height / imageHeight) * scale;
  const drawWidth = imageWidth * imageScale;
  const drawHeight = imageHeight * imageScale;
  const drawX = x + (width - drawWidth) / 2 + offsetX * width * 0.12;
  const drawY = y + (height - drawHeight) / 2 + offsetY * height * 0.12;
  ctx.save();
  ctx.beginPath();
  if (radius > 0) ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

export function renderPost(ctx: CanvasRenderingContext2D, project: PostsProject, assets: PostsRenderAssets) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  if (!width || !height) return;
  ctx.save();
  try {
    ctx.clearRect(0, 0, width, height);
    const background = assets.customBackground ?? assets.templateBackground;
    if (background) ctx.drawImage(background, 0, 0, width, height);
    else fallbackBackground(ctx, project, width, height);

    const scaleX = width / 1080;
    const logoWidth = 180 * scaleX;
    const logoHeight = 95 * scaleX;
    const logoX = 64 * scaleX;
    const logoY = 64 * scaleX;
    if (assets.logo) ctx.drawImage(assets.logo, logoX, logoY, logoWidth, logoHeight);

    const dark = project.template === 'new-arrivals';
    const ink = dark ? '#FFFFFF' : '#121212';
    const accent = '#9EB94A';
    const side = width * 0.1;

    // These are the portrait master coordinates: logo (64,64,180,95),
    // family heading around y=210, photo from 35–74%, and footer in the last fifth.
    const headerY = Math.max(logoY + logoHeight + 40 * scaleX, height * 0.155);
    const badgeText = project.badge.toUpperCase();
    const badgeFit = fitLine(ctx, badgeText, width * 0.68, Math.max(10, 13 * scaleX), Math.max(8, 8 * scaleX), 800);
    const badgeWidth = Math.min(width * 0.78, Math.max(width * 0.18, badgeFit.width + 30 * scaleX));
    const badgeHeight = Math.max(28 * scaleX, badgeFit.fontSize + 16 * scaleX);
    if (project.badge) {
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.roundRect(side, headerY, badgeWidth, badgeHeight, badgeHeight / 2); ctx.fill();
      ctx.fillStyle = '#121212';
      ctx.font = `800 ${badgeFit.fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, side + badgeWidth / 2, headerY + badgeHeight / 2);
    }

    const family = dark ? 'NEW\nARRIVALS' : 'IN THE\nSPOTLIGHT';
    const familyY = headerY + (project.badge ? badgeHeight + 18 * scaleX : 0);
    const familyBlock = drawTextBlock(ctx, family, side, familyY, width * 0.8, Math.max(31, 58 * scaleX), Math.max(17, 18 * scaleX), ink, 800, 'left', 0.95);
    const photoY = Math.max(height * 0.35, familyY + familyBlock.height + 18 * scaleX);
    const photoWidth = width * 0.8;
    const photoHeight = Math.min(height * 0.38, Math.max(height * 0.26, height * 0.74 - photoY));
    const photoRadius = 0;

    ctx.fillStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(18,18,18,0.07)';
    ctx.fillRect(side, photoY, photoWidth, photoHeight);
    if (assets.image) drawContainImage(ctx, assets.image, side, photoY, photoWidth, photoHeight, project.imageScale, project.imageX, project.imageY, photoRadius);
    else {
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(18,18,18,0.08)';
      ctx.font = `700 ${Math.max(13, width * 0.018)}px Arial, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ADD CARD PHOTO', width / 2, photoY + photoHeight / 2);
    }
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.24)' : 'rgba(18,18,18,0.18)';
    ctx.lineWidth = Math.max(1, width * 0.002);
    ctx.strokeRect(side, photoY, photoWidth, photoHeight);

    const bottomY = Math.min(height * 0.91, height - 60 * scaleX);
    const footerY = Math.max(height * 0.79, photoY + photoHeight + height * 0.045);
    const footerGap = 10 * scaleX;
    const footerHeight = Math.max(60 * scaleX, bottomY - footerY - footerGap);
    const titleHeight = footerHeight * 0.53;
    const detailsHeight = footerHeight - titleHeight;
    drawTextBlock(ctx, project.headline || 'UNTITLED CARD', side, footerY, width - side * 2, Math.max(30, 56 * scaleX), Math.max(15, 17 * scaleX), ink, 800, 'left', 0.96, titleHeight);
    if (project.details) drawTextBlock(ctx, project.details, side, footerY + titleHeight + footerGap, width * 0.72, Math.max(14, 20 * scaleX), Math.max(10, 12 * scaleX), dark ? 'rgba(255,255,255,0.7)' : 'rgba(18,18,18,0.65)', 600, 'left', 1.08, detailsHeight);

    const ctaText = project.cta.toUpperCase();
    const priceReserved = project.price ? width * 0.28 : 0;
    const ctaMaxWidth = Math.max(width * 0.28, width - side * 2 - priceReserved - 20 * scaleX);
    const ctaFit = fitLine(ctx, ctaText, Math.max(1, ctaMaxWidth - 34 * scaleX), Math.max(11, 14 * scaleX), Math.max(8, 9 * scaleX), 800);
    if (project.cta) {
      const ctaWidth = Math.min(ctaMaxWidth, Math.max(width * 0.22, ctaFit.width + 34 * scaleX));
      const ctaHeight = Math.max(44 * scaleX, ctaFit.fontSize + 22 * scaleX);
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.roundRect(side, bottomY, ctaWidth, ctaHeight, ctaHeight / 2); ctx.fill();
      ctx.fillStyle = '#121212';
      ctx.font = `800 ${ctaFit.fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ctaText, side + ctaWidth / 2, bottomY + ctaHeight / 2);
    }
    if (project.price) {
      const priceFit = fitLine(ctx, project.price, priceReserved, Math.max(20, 31 * scaleX), Math.max(13, 15 * scaleX), 800);
      ctx.fillStyle = ink;
      ctx.font = `800 ${priceFit.fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(project.price, width - side, bottomY + Math.max(44 * scaleX, ctaFit.fontSize + 22 * scaleX) / 2);
    }
  } finally {
    ctx.restore();
  }
}

export class PostsProjectStore {
  private readonly databaseName: string;
  private database: Promise<IDBDatabase> | null = null;

  constructor(databaseName = 'pull-studio-posts-v1') {
    this.databaseName = databaseName;
  }

  private open() {
    if (this.database) return this.database;
    this.database = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) { reject(new Error('IndexedDB is unavailable in this browser.')); return; }
      const request = window.indexedDB.open(this.databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('projects');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Could not open local project storage.'));
    });
    return this.database;
  }

  async save(project: PostsProject) {
    const database = await this.open();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('projects', 'readwrite');
      const request = transaction.objectStore('projects').put(copyPostsProject(project), 'current');
      let settled = false;
      const fail = () => { if (!settled) { settled = true; reject(transaction.error ?? request.error ?? new Error('Could not save the Posts project locally.')); } };
      transaction.oncomplete = () => { if (!settled) { settled = true; resolve(); } };
      transaction.onerror = fail;
      transaction.onabort = fail;
    });
  }

  async load() {
    const database = await this.open();
    return await new Promise<PostsProject | null>((resolve, reject) => {
      const request = database.transaction('projects', 'readonly').objectStore('projects').get('current');
      request.onsuccess = () => resolve(request.result ? validatePostsProject(request.result) : null);
      request.onerror = () => reject(request.error ?? new Error('Could not load the Posts project locally.'));
    });
  }
}
