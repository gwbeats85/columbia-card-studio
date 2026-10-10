import { describe, expect, it } from 'vitest';
import {
  defaultPostsProject,
  importPostsProject,
  layoutText,
  serializePostsProject,
  validatePostsProject,
} from './post-model';

function measuringContext() {
  const context = {
    font: '700 16px Arial',
    measureText(value: string) {
      const size = Number(context.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 16);
      return { width: value.length * size * 0.55 };
    },
  } as unknown as CanvasRenderingContext2D;
  return context;
}

describe('Posts project validation', () => {
  it('round trips embedded card and PNG background data', () => {
    const project = defaultPostsProject();
    project.image = { dataUrl: 'data:image/jpeg;base64,AAAA', name: 'card.jpg' };
    project.customBackground = { dataUrl: 'data:image/png;base64,AAAA', name: 'background.png' };
    project.format = 'square';

    expect(importPostsProject(serializePostsProject(project))).toEqual(project);
  });

  it('rejects remote project assets and non-PNG custom backgrounds', () => {
    const project = defaultPostsProject();
    expect(() => validatePostsProject({ ...project, image: { dataUrl: 'https://example.test/card.jpg', name: 'card.jpg' } })).toThrow(/embedded/);
    expect(() => validatePostsProject({ ...project, customBackground: { dataUrl: 'data:image/jpeg;base64,AAAA', name: 'background.jpg' } })).toThrow(/embedded/);
  });
});

describe('Posts text layout', () => {
  it('splits unbroken strings without exceeding the measured width', () => {
    const context = measuringContext();
    const layout = layoutText(context, 'SUPERCOLLECTIBLECARDWITHOUTSPACES', 100, 32, 10, 800);

    expect(layout.lines.length).toBeGreaterThan(1);
    context.font = `800 ${layout.fontSize}px Arial`;
    expect(layout.lines.every((line) => context.measureText(line).width <= 100)).toBe(true);
  });

  it('keeps explicit family heading lines separate', () => {
    const layout = layoutText(measuringContext(), 'NEW\nARRIVALS', 800, 58, 18, 800);

    expect(layout.lines).toEqual(['NEW', 'ARRIVALS']);
    expect(layout.height).toBeGreaterThan(layout.lineHeight);
  });

  it('reduces type to fit an explicit footer height without dropping lines', () => {
    const context = measuringContext();
    const layout = layoutText(context, 'A VERY LONG CARD HEADLINE THAT MUST REMAIN VISIBLE', 420, 56, 17, 800, 0.96, 62);

    expect(layout.height).toBeLessThanOrEqual(62);
    expect(layout.lines.join(' ')).toContain('VISIBLE');
  });
});
