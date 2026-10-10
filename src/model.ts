import type { BackgroundStyle } from './backgrounds';
export type Crop = { fit: 'contain' | 'cover'; zoom: number; x: number; y: number; rotation: number };
export type Asset = { image: HTMLImageElement; url: string; name: string; sample?: boolean };
export type Look = 'obsidian' | 'warm' | 'silver';
export type CardProfile = 'sports' | 'tcg' | 'slab' | 'custom';
export type Motion = 'reveal' | 'spin' | 'sway';
export type Settings = {
  profile: CardProfile; cornerRadius: number; motion: Motion;
  background: BackgroundStyle; brandAccent: string; brandBase: string; backgroundStrength: number; showBrand: boolean;
  look: Look; light: number; tilt: number; framing: number; speed: number;
  finish: 'paper' | 'gloss' | 'foil'; flip: boolean; ratio: 'source' | 'standard';
  title: string; subtitle: string; shop: string;
};
export type RenderInput = { front: Asset; back: Asset | null; logo: Asset | null; backgroundImage?: Asset | null; frontCrop: Crop; backCrop: Crop; settings: Settings };
export const freshCrop = (): Crop => ({ fit: 'contain', zoom: 1, x: 0, y: 0, rotation: 0 });
export const defaultSettings: Settings = { profile:'sports',cornerRadius:2.8,motion:'reveal',background:'studio',brandAccent:'#9EB94A',brandBase:'#121212',backgroundStrength:0.65,showBrand:true,look: 'obsidian', light: 1, tilt: -7, framing: 1, speed: 1, finish: 'paper', flip: false, ratio: 'source', title: 'TY COBB', subtitle: '1911 · TURKEY RED CABINETS', shop: 'THE ARCHIVE' };
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x); };
export const segment = (t: number, start: number, end: number) => ease((t - start) / (end - start));
export const durationOf = (settings: Settings) => (settings.motion==='spin'?16:8) / settings.speed;
export const cardAspect = (input: RenderInput) => input.settings.profile!=='slab' && input.settings.ratio === 'standard' ? 2.5 / 3.5 : ((input.frontCrop.rotation % 180) ? input.front.image.naturalHeight / input.front.image.naturalWidth : input.front.image.naturalWidth / input.front.image.naturalHeight);
export function sampleTimeline(seconds: number, settings: Settings) {
  const t = clamp(seconds * settings.speed, 0, settings.motion==='spin'?16:8);
  if(settings.motion==='spin'||settings.motion==='sway') {
    const cycle=t/(settings.motion==='spin'?16:8)*Math.PI*2;
    return {time:t,phase:settings.motion==='spin'?'Slow turn':'Gentle sway',yaw:settings.tilt*Math.PI/180+(settings.motion==='spin'?cycle:Math.sin(cycle)*0.24),pitch:0,roll:0,y:0,cameraZ:13.45/settings.framing,visibility:1,key:1,sweepX:4,signature:1};
  }
  const reveal = segment(t, 1.1, 3.6);
  const hold = segment(t, 3.6, 6);
  const turn = settings.flip ? segment(t, 0.6, 3.8) * Math.PI * 2 : 0;
  return {
    time: t, phase: t < 1.5 ? 'Emergence' : t < 3.5 ? 'Reveal' : t < 6 ? 'Hero' : 'Signature',
    yaw: (-0.96 * (1 - reveal) + (settings.tilt * Math.PI / 180) * reveal + 0.055 * Math.sin(hold * Math.PI)) + turn,
    pitch: 0.065 * (1 - reveal) - 0.012 * hold,
    roll: -0.035 * (1 - reveal) + 0.014 * reveal,
    y: -0.13 * (1 - reveal),
    cameraZ: (15.2 - 1.5 * reveal - 0.25 * hold) / settings.framing,
    visibility: 0.06 + 0.94 * segment(t, 0.15, 2.25),
    key: 0.05 + 0.95 * segment(t, 0.65, 2.4),
    sweepX: -4 + 8 * segment(t, 2.9, 6),
    signature: segment(t, 6, 6.8),
  };
}
// The source is uniformly scaled, never stretched. x/y are fractions of the
// available pan range. Contain at zoom 1 always preserves the entire photograph.
export function fitRect(sw: number, sh: number, tw: number, th: number, crop: Crop) {
  const scale = (crop.fit === 'contain' ? Math.min(tw / sw, th / sh) : Math.max(tw / sw, th / sh)) * crop.zoom;
  const width = sw * scale, height = sh * scale;
  return { width, height, x: (tw - width) / 2 + crop.x * Math.abs(tw - width) / 2, y: (th - height) / 2 + crop.y * Math.abs(th - height) / 2 };
}
export async function loadAsset(url: string, name: string, sample = false): Promise<Asset> {
  const image = new Image(); image.src = url;
  await image.decode().catch(() => { throw new Error('This image could not be decoded. Try a JPEG, PNG or WebP.'); });
  if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('Please use an image under 40 megapixels.');
  return { image, url, name, sample };
}
export async function uploadAsset(file: File): Promise<Asset> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP image. HEIC is not supported yet.');
  if (file.size > 32 * 1024 * 1024) throw new Error('Please use an image smaller than 32 MB.');
  const url = URL.createObjectURL(file);
  try { return await loadAsset(url, file.name); } catch (error) { URL.revokeObjectURL(url); throw error; }
}
export const releaseAsset = (asset: Asset | null) => { if (asset?.url.startsWith('blob:')) URL.revokeObjectURL(asset.url); };

// Radius is expressed as a percentage of the displayed card/holder height.
export function cornerFraction(settings: Settings): number {
  if(settings.profile==='sports')return 0;
  if(settings.profile==='slab')return 0.015;
  return (settings.profile==='tcg'?2.8:clamp(settings.cornerRadius,0,6))/100;
}
export function restoreScene(value: unknown): Settings {
  const safe={...defaultSettings};
  if(!value || typeof value!=='object')return safe;
  const v=value as Record<string,unknown>;
  for(const key of ['title','subtitle','shop'] as const)if(typeof v[key]==='string')safe[key]=v[key].slice(0,key==='subtitle'?70:45);
  for(const [key,min,max] of [['light',0.5,1.5],['tilt',-25,25],['framing',0.8,1.15],['speed',0.75,1.25],['cornerRadius',0,6],['backgroundStrength',0,1]] as const)if(typeof v[key]==='number'&&Number.isFinite(v[key]))safe[key]=clamp(v[key],min,max);
  if(['obsidian','warm','silver'].includes(String(v.look)))safe.look=v.look as Look;
  if(['paper','gloss','foil'].includes(String(v.finish)))safe.finish=v.finish as Settings['finish'];
  if(['source','standard'].includes(String(v.ratio)))safe.ratio=v.ratio as Settings['ratio'];
  if(['sports','tcg','slab','custom'].includes(String(v.profile)))safe.profile=v.profile as CardProfile;
  if(['reveal','spin','sway'].includes(String(v.motion)))safe.motion=v.motion as Motion;
  if(['studio','spotlight','diagonal','paper','image'].includes(String(v.background)))safe.background=v.background as BackgroundStyle;
  for(const key of ['brandAccent','brandBase'] as const)if(typeof v[key]==='string'&&/^#[0-9a-f]{6}$/i.test(v[key]))safe[key]=v[key];
  safe.flip=v.flip===true;
  if(typeof v.showBrand==='boolean')safe.showBrand=v.showBrand;
  return safe;
}
