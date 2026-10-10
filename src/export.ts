import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, canEncodeVideo } from 'mediabunny';
import { Studio } from './studio';
import { durationOf } from './model';
import type { RenderInput } from './model';
export type ExportOptions = { fps: 24 | 30; bitrate: number };
export async function checkExport(options: ExportOptions = {fps:30,bitrate:12_000_000}) {
  if(!window.isSecureContext || !('VideoEncoder' in window)) return false;
  return await canEncodeVideo('avc',{width:1080,height:1920,bitrate:options.bitrate,frameRate:options.fps});
}
export async function exportMp4(input: RenderInput, options: ExportOptions, onProgress: (p:number)=>void, signal: AbortSignal): Promise<Blob> {
  if(!await checkExport(options)) throw new Error('H.264 export is unavailable in this browser. Open this local app in a current Chrome or Edge browser.');
  signal.throwIfAborted();
  const canvas=document.createElement('canvas'), studio=new Studio(canvas);
  let output: Output | undefined;
  try {
    studio.setSize(1080,1920);studio.setInput(input);
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
