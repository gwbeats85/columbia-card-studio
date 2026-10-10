export type ExportFormat = 'portrait' | 'square' | 'vertical';

export type ExportDimensions = {
  width: number;
  height: number;
};

const dimensions: Record<ExportFormat, ExportDimensions> = {
  portrait: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
};

export function exportDimensions(format: ExportFormat = 'vertical'): ExportDimensions {
  return dimensions[format];
}
