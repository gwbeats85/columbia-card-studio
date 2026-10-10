import { describe, expect, it } from 'vitest';
import { exportDimensions } from './export-dimensions';

describe('export dimensions', () => {
  it('keeps vertical output as the default', () => {
    expect(exportDimensions()).toEqual({ width: 1080, height: 1920 });
    expect(exportDimensions('vertical')).toEqual({ width: 1080, height: 1920 });
  });

  it('provides social portrait and square dimensions', () => {
    expect(exportDimensions('portrait')).toEqual({ width: 1080, height: 1350 });
    expect(exportDimensions('square')).toEqual({ width: 1080, height: 1080 });
  });
});
