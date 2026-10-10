import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, canEncodeVideo } from 'mediabunny';
import { Studio } from './studio';
import { durationOf } from './model';
import type { RenderInput } from './model';
import { exportDimensions } from './export-dimensions';
import type { ExportFormat } from './export-dimensions';

export type { ExportFormat } from './export-dimensions';
export type ExportOptions = { fps: 24 | 30; bitrate: number; format?: ExportFormat };

const defaultExportOptions: ExportOptions = { fps: 30, bitrate: 12_000_000, format: 'vertical' };

export async function checkExport(options: ExportOptions = defaultExportOptions) {
  if(!window.isSecureContext || !('VideoEncoder' in window)) return false;
  const { width, height } = exportDimensions(options.format);
  return await canEncodeVideo('avc',{width,height,bitrate:options.bitrate,frameRate:options.fps});
}
export async function exportMp4(input: RenderInput, options: ExportOptions, onProgress: (p:number)=>void, signal: AbortSignal): Promise<Blob> {
  if(!await checkExport(options)) throw new Error('H.264 export is unavailable in this browser. Open this local app in a current Chrome or Edge browser.');
  signal.throwIfAborted();
  const canvas=document.createElement('canvas'), studio=new Studio(canvas);
  const { width, height } = exportDimensions(options.format);
  let output: Output | undefined;
  try {
    studio.setSize(width,height);studio.setInput(input);
    const target=new BufferTarget();output=new Output({format:new Mp4OutputFormat({fastStart:'in-memory'}),target});
    const source=new CanvasSource(canvas,{codec:'avc',bitrate:options.bitrate,keyFrameInterval:2});
    output.addVideoTrack(source,{frameRate:options.fps});await output.start();
    const frames=Math.round(durationOf(input.settings)*options.fps);
    for(let i=0;i<frames;i++) {
      signal.throwIfAborted();studio.render(i/options.fps);
      await source.add(i/options.fps,1/options.fps);
      onProgress((i+1)/frames*0.97);
      // Let UI paint progress and cancellation even when the encoder is fast.
      if(i%4===0) await new Promise(resolve=>setTimeout(resolve,0));
    }
    signal.throwIfAborted();source.close();await output.finalize();
    if(!target.buffer) throw new Error('The encoder returned an empty file.');
    onProgress(1);return new Blob([target.buffer],{type:'video/mp4'});
  } catch(error) { if(output) await output.cancel().catch(()=>{}); throw error; }
  finally {studio.dispose();}
}

export async function exportPng(input: RenderInput, time: number, format: ExportFormat = 'vertical', transparent = false): Promise<Blob> {
  const { width, height } = exportDimensions(format);
  const canvas = document.createElement('canvas');
  const studio = new Studio(canvas);
  try {
    studio.transparentOutput = transparent;
    studio.setSize(width, height);
    studio.setInput(input);
    studio.render(time);
    let outputCanvas = canvas;
    if (transparent) {
      // Tight bounds let a card cutout fit photo slots without invisible padding.
      const pixels = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
      let left=width, top=height, right=-1, bottom=-1;
      for(let y=0;y<height;y++) for(let x=0;x<width;x++) if(pixels[(y*width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
      if(right<left) throw new Error('The card is not visible at this time. Move the timeline to a visible frame.');
      outputCanvas=document.createElement('canvas');outputCanvas.width=right-left+1;outputCanvas.height=bottom-top+1;
      outputCanvas.getContext('2d')!.drawImage(canvas,left,top,outputCanvas.width,outputCanvas.height,0,0,outputCanvas.width,outputCanvas.height);
    }
    const blob = await new Promise<Blob>((resolve, reject) => {
      outputCanvas.toBlob((value) => {
        if (value) resolve(value);
        else reject(new Error('The browser could not encode this PNG.'));
      }, 'image/png');
    });
    return blob;
  } finally {
    studio.dispose();
  }
}
