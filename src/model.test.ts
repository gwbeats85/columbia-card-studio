import { describe, expect, it } from 'vitest';
import {
  cardAspect,
  cornerFraction,
  restoreScene,
  defaultSettings,
  durationOf,
  fitRect,
  freshCrop,
  sampleTimeline,
} from './model';
import type { Asset, RenderInput } from './model';

function imageAsset(width: number, height: number, name = 'test.jpg'): Asset {
  const image = { naturalWidth: width, naturalHeight: height } as unknown as HTMLImageElement;
  return { image, url: `https://example.test/${name}`, name };
}

function inputWithFront(width: number, height: number): RenderInput {
  return {
    front: imageAsset(width, height),
    back: null,
    logo: null,
    frontCrop: freshCrop(),
    backCrop: freshCrop(),
    settings: { ...defaultSettings },
  };
}

describe('crop geometry', () => {
  it('contains a wide source without stretching and centers the unused height', () => {
    const rect = fitRect(200, 100, 100, 100, freshCrop());

    expect(rect).toEqual({ width: 100, height: 50, x: 0, y: 25 });
  });

  it('covers and centers a wide source, with pan reaching both horizontal endpoints', () => {
    const center = fitRect(200, 100, 100, 100, { ...freshCrop(), fit: 'cover' });
    const left = fitRect(200, 100, 100, 100, { ...freshCrop(), fit: 'cover', x: -1 });
    const right = fitRect(200, 100, 100, 100, { ...freshCrop(), fit: 'cover', x: 1 });

    expect(center).toEqual({ width: 200, height: 100, x: -50, y: 0 });
    expect(left.x).toBe(-100);
    expect(right.x).toBe(0);
  });

  it('reaches vertical pan endpoints when cover leaves excess height', () => {
    const top = fitRect(100, 200, 100, 100, { ...freshCrop(), fit: 'cover', y: -1 });
    const bottom = fitRect(100, 200, 100, 100, { ...freshCrop(), fit: 'cover', y: 1 });

    expect(top).toEqual({ width: 100, height: 200, x: 0, y: -100 });
    expect(bottom.y).toBe(0);
  });

  it('uses the rotated source dimensions for source-ratio cards', () => {
    const input = inputWithFront(1000, 2000);

    expect(cardAspect(input)).toBe(0.5);
    input.frontCrop.rotation = 90;
    expect(cardAspect(input)).toBe(2);
    input.settings.ratio = 'standard';
    expect(cardAspect(input)).toBeCloseTo(2.5 / 3.5);
  });
});

describe('timeline model', () => {
  it('is deterministic when seeking out of order', () => {
    const settings = { ...defaultSettings, flip: true, speed: 1.35 };
    const forward = sampleTimeline(4.25, settings);
    sampleTimeline(0.75, settings);
    sampleTimeline(7.9, settings);
    const revisited = sampleTimeline(4.25, settings);

    expect(revisited).toEqual(forward);
  });

  it('assigns the exact phase boundaries to the phase that starts there', () => {
    const settings = { ...defaultSettings };

    expect(sampleTimeline(0, settings).phase).toBe('Emergence');
    expect(sampleTimeline(1.5, settings).phase).toBe('Reveal');
    expect(sampleTimeline(3.5, settings).phase).toBe('Hero');
    expect(sampleTimeline(6, settings).phase).toBe('Signature');
  });

  it('scales timeline time and duration together', () => {
    const fast = { ...defaultSettings, speed: 2 };
    const slow = { ...defaultSettings, speed: 0.5 };

    expect(durationOf(fast)).toBe(4);
    expect(sampleTimeline(2, fast).time).toBe(4);
    expect(durationOf(slow)).toBe(16);
    expect(sampleTimeline(8, slow).time).toBe(4);
  });

  it('settles a flipped card front-facing after one complete turn', () => {
    const settings = { ...defaultSettings, flip: true, tilt: -7 };
    const final = sampleTimeline(8, settings);
    const targetYaw = settings.tilt * Math.PI / 180;
    const wrappedDifference = Math.atan2(
      Math.sin(final.yaw - targetYaw),
      Math.cos(final.yaw - targetYaw),
    );

    expect(wrappedDifference).toBeCloseTo(0, 10);
  });

  it('clamps both negative and overshoot times to the timeline bounds', () => {
    const settings = { ...defaultSettings, speed: 1.5 };

    expect(sampleTimeline(-10, settings).time).toBe(0);
    expect(sampleTimeline(100, settings).time).toBe(8);
    expect(sampleTimeline(100, settings).phase).toBe('Signature');
  });
});


describe('card and brand profiles', () => {
  it('keeps sports corners square and allows rounded profiles', () => {
    expect(cornerFraction({...defaultSettings, profile:'sports', cornerRadius:6})).toBe(0);
    expect(cornerFraction({...defaultSettings, profile:'tcg'})).toBeCloseTo(0.028);
    expect(cornerFraction({...defaultSettings, profile:'slab'})).toBe(0.015);
    expect(cornerFraction({...defaultSettings, profile:'custom',cornerRadius:100})).toBe(0.06);
  });
  it('preserves the full slab proportions even with a standard-card ratio selected', () => {
    const input=inputWithFront(689,1200);
    input.settings={...input.settings,profile:'slab',ratio:'standard'};
    expect(cardAspect(input)).toBeCloseTo(689/1200);
  });
  it('loops slow turns and sways without a pose jump', () => {
    for(const motion of ['spin','sway'] as const){
      const settings={...defaultSettings,motion,speed:1.25};
      const first=sampleTimeline(0,settings),last=sampleTimeline(durationOf(settings),settings);
      expect(Math.sin(last.yaw-first.yaw)).toBeCloseTo(0,10);
      expect(Math.cos(last.yaw-first.yaw)).toBeCloseTo(1,10);
      expect(last.signature).toBe(1);
      expect(last.visibility).toBe(1);
      expect(durationOf(settings)).toBe((motion==='spin'?16:8)/1.25);
    }
  });
  it('restores old scenes and bounds malformed saved settings', () => {
    expect(restoreScene({title:'Old scene'}).profile).toBe('sports');
    const restored=restoreScene({profile:'unknown',brandAccent:'url(x)',brandBase:'#123456',speed:0,cornerRadius:50,light:NaN,showBrand:false});
    expect(restored.profile).toBe('sports');
    expect(restored.brandAccent).toBe(defaultSettings.brandAccent);
    expect(restored.brandBase).toBe('#123456');
    expect(restored.speed).toBe(0.75);
    expect(restored.cornerRadius).toBe(6);
    expect(restored.light).toBe(defaultSettings.light);
    expect(restored.showBrand).toBe(false);
  });
});
