import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, ReactNode } from 'react';
import { ArrowDownToLine, ArrowUpRight, Check, CheckCircle2, ChevronRight, Clapperboard, ImagePlus, LoaderCircle, Maximize, Minus, Plus, Pause, Play, RotateCcw, RotateCw, Settings2, ShieldCheck, Sparkles, Sun, Trash2, X } from 'lucide-react';
import { Studio, makeArtwork } from './studio';
import { cardAspect, defaultSettings, durationOf, freshCrop, loadAsset, releaseAsset, restoreScene, sampleTimeline, uploadAsset } from './model';
import type { Asset, Crop, RenderInput, Settings } from './model';
import { checkExport, exportMp4 } from './export';
import './styles.css';

function Range({label,value,min,max,step=1,display,onChange}: {label:string;value:number;min:number;max:number;step?:number;display?:string;onChange:(n:number)=>void}) {
  return <label className="range"><span>{label}<output>{display??value}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)}/></label>;
}
function Section({number,title,children}: {number:string;title:string;children:ReactNode}) {
  return <section className="panel-section"><div className="section-title"><span className="step">{number}</span><h2>{title}</h2></div>{children}</section>;
}
function AssetSlot({label,asset,onFile,onRemove,optional=false}: {label:string;asset:Asset|null;onFile:(file:File)=>void;onRemove:()=>void;optional?:boolean}) {
  const upload=useRef<HTMLInputElement>(null);
  return <div className={`asset-slot ${asset?'has-asset':''}`}>
    <input ref={upload} aria-label={`Upload ${label.toLowerCase()}`} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);e.target.value='';}}/>
    <button className="asset-pick" onClick={()=>upload.current?.click()}>
      <div className="asset-thumb">{asset?<img src={asset.url} alt={`${label} original artwork`}/>:<ImagePlus size={19}/>}</div>
      <span><strong>{label}<small>{optional?'Optional':'Required'}</small></strong><em>{asset?asset.name:'Choose a photograph'}</em><small className="asset-action">{asset?'Replace image':'JPEG, PNG or WebP'}</small></span>
      {asset?<CheckCircle2 className="asset-check" size={15}/>:<ChevronRight size={15}/>}
    </button>
    {asset&&<button aria-label={`Remove ${label.toLowerCase()}`} className="asset-remove icon-button" onClick={onRemove}><Trash2 size={13}/></button>}
  </div>;
}
export default function App() {
  const [panel,setPanel]=useState<'card'|'brand'|'scene'|'export'>('card');
  const [filmView,setFilmView]=useState(false);
  const [front,setFront]=useState<Asset|null>(null),[back,setBack]=useState<Asset|null>(null),[logo,setLogo]=useState<Asset|null>(null);
  const [backgroundImage,setBackgroundImage]=useState<Asset|null>(null),[localSamples,setLocalSamples]=useState(false);
  const [frontCrop,setFrontCrop]=useState<Crop>(freshCrop),[backCrop,setBackCrop]=useState<Crop>(freshCrop);
  const [settings,setSettings]=useState<Settings>({...defaultSettings,background:'spotlight',shop:'COLUMBIA SPORTS CARDS'});
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [face,setFace]=useState<'front'|'back'>('front'),[cropOpen,setCropOpen]=useState(false);
  const [time,setTime]=useState(7),[playing,setPlaying]=useState(false),[ready,setReady]=useState(false);
  const [fps,setFps]=useState<24|30>(30),[bitrate,setBitrate]=useState(12_000_000),[supported,setSupported]=useState<boolean|null>(null);
  const [progress,setProgress]=useState<number|null>(null),[result,setResult]=useState<{url:string;size:number;duration:number}|null>(null),[showVideo,setShowVideo]=useState(false);
  const stageRef=useRef<HTMLDivElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null),studio=useRef<Studio|null>(null),controller=useRef<AbortController|null>(null);
  const cropCanvas=useRef<HTMLCanvasElement>(null),logoUpload=useRef<HTMLInputElement>(null),backgroundUpload=useRef<HTMLInputElement>(null);
  const assetRefs=useRef({front,back,logo,backgroundImage});assetRefs.current={front,back,logo,backgroundImage};
  const resultRef=useRef(result);resultRef.current=result;
  const busy=progress!==null, duration=durationOf(settings);
  const input=useMemo<RenderInput|null>(()=>front?{front,back,logo,backgroundImage,frontCrop,backCrop,settings}:null,[front,back,logo,backgroundImage,frontCrop,backCrop,settings]);
  const viewState=useRef({input,time});viewState.current={input,time};
  const selectedCrop=face==='front'?frontCrop:backCrop, selectedAsset=face==='front'?front:back;
  function update<K extends keyof Settings>(key:K,value:Settings[K]){setSettings(s=>({...s,[key]:value}));}
  function updateCrop(patch:Partial<Crop>){(face==='front'?setFrontCrop:setBackCrop)(crop=>({...crop,...patch}));}
  useEffect(()=>{
    let cancelled=false;
    async function start() {
      try {
        const brandLogo=await loadAsset('/brand/columbia-sports-cards-wordmark.png','Columbia website logo');
        if(cancelled)return;setLogo(brandLogo);
        // Optional private local fixture; the portable app falls back to the archival sample.
        const response=await fetch('/local-card/session.json');
        const fixture=response.ok && response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
        if(fixture && !new URLSearchParams(location.search).has('archive')) {
          const [frontAsset,backAsset]=await Promise.all([loadAsset(fixture.front.url,fixture.front.name),loadAsset(fixture.back.url,fixture.back.name)]);
          if(cancelled)return;
          setFront(frontAsset);setBack(backAsset);setLocalSamples(true);
          setSettings(s=>({...s,title:String(fixture.settings.title).slice(0,45),subtitle:String(fixture.settings.subtitle).slice(0,70),shop:'COLUMBIA SPORTS CARDS',finish:'gloss',ratio:'standard',flip:true}));
        } else {
          const asset=await loadAsset('/samples/ty-cobb-front.jpg','Ty Cobb · 1911 sample',true);
          if(!cancelled)setFront(asset);
        }
      } catch(e) {if(!cancelled)setError(e instanceof Error?e.message:String(e));}
      finally {if(!cancelled)setLoading(false);}
    }
    void start();
    return()=>{cancelled=true;controller.current?.abort();Object.values(assetRefs.current).forEach(releaseAsset);if(resultRef.current)URL.revokeObjectURL(resultRef.current.url);};
  },[]);
  useEffect(()=>{
    try{studio.current=new Studio(canvasRef.current!);setReady(true);}catch(e){setError(`Unable to start the 3D studio. ${e instanceof Error?e.message:e}`);}
    return()=>{studio.current?.dispose();studio.current=null;};
  },[]);
  useEffect(()=>{
    if(!studio.current||!input)return;
    try{studio.current.setInput(input);studio.current.render(Math.min(time,duration));}catch(e){setPlaying(false);setError(e instanceof Error?e.message:String(e));}
  },[input,time,duration,ready,filmView]);
  useEffect(()=>{
    const element=stageRef.current;if(!element||!studio.current)return;
    const resize=()=>{const h=Math.round(element.clientHeight);const w=filmView?Math.round(h*9/16):Math.round(element.clientWidth);studio.current!.setSize(w,h);studio.current!.workspaceView=!filmView;const current=viewState.current;if(current.input){studio.current!.setInput(current.input);studio.current!.render(current.time);}};
    const observer=new ResizeObserver(resize);observer.observe(element);resize();return()=>observer.disconnect();
  },[ready,filmView]);
  useEffect(()=>{
    if(!playing||busy)return;
    let last=performance.now(),id=0;
    const tick=(now:number)=>{const delta=(now-last)/1000;last=now;setTime(t=>{const next=t+delta;if(next>=duration){if(settings.motion!=='reveal')return next%duration;setPlaying(false);return duration;}return next;});id=requestAnimationFrame(tick);};
    id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);
  },[playing,busy,duration,settings.motion]);
  useEffect(()=>{setTime(t=>Math.min(t,duration));},[duration]);
  useEffect(()=>{let current=true;setSupported(null);checkExport({fps,bitrate}).then(value=>{if(current)setSupported(value);}).catch(()=>{if(current)setSupported(false);});return()=>{current=false};},[fps,bitrate]);
  useEffect(()=>{
    if(!cropOpen||!cropCanvas.current||!input||!selectedAsset)return;
    const art=makeArtwork(selectedAsset,selectedCrop,cardAspect(input)),c=cropCanvas.current;
    c.width=art.width;c.height=art.height;c.getContext('2d')!.drawImage(art,0,0);
  },[cropOpen,input,selectedAsset,selectedCrop]);
  async function handleUpload(side:'front'|'back'|'logo'|'background',file:File){
    setLoading(true);setError('');setMessage('');
    try {
      const asset=await uploadAsset(file);
      if(side==='front'){
        releaseAsset(front);setFront(asset);setFrontCrop(freshCrop());
        if(back?.sample){releaseAsset(back);setBack(null);setBackCrop(freshCrop());}
        setSettings(s=>({...s,title:'',subtitle:'',shop:front?.sample?'':s.shop}));setFace('front');
      }else if(side==='back'){releaseAsset(back);setBack(asset);setBackCrop(freshCrop());setFace('back');}
      else if(side==='background'){releaseAsset(backgroundImage);setBackgroundImage(asset);update('background','image');setFilmView(true);}
      else {releaseAsset(logo);setLogo(asset);update('showBrand',true);}
      setTime(7/settings.speed);setPlaying(false);
    }catch(e){setError(e instanceof Error?e.message:String(e));}
    finally{setLoading(false);}
  }
  async function renderVideo(){
    if(!input||busy)return;
    setPlaying(false);setError('');setMessage('');setProgress(0);const abort=new AbortController();controller.current=abort;
    try{
      const blob=await exportMp4(input,{fps,bitrate},setProgress,abort.signal);
      if(result)URL.revokeObjectURL(result.url);
      setResult({url:URL.createObjectURL(blob),size:blob.size,duration});setMessage('Your film is ready. Preview it or download the MP4.');
    }catch(e){if(abort.signal.aborted)setMessage('Render cancelled. Your scene is unchanged.');else setError(e instanceof Error?e.message:String(e));}
    finally{setProgress(null);controller.current=null;}
  }
  function saveSettings(){try{localStorage.setItem('pull-studio-settings-v1',JSON.stringify(settings));setMessage('Scene settings saved in this browser. Images stay in this session.');}catch{setError('This browser cannot save settings. The current scene still works.');}}
  function restoreSettings(){
    try{const raw=localStorage.getItem('pull-studio-settings-v1');if(!raw){setMessage('No saved scene yet. Save a scene to reuse it for the next pull.');return;}
      const safe=restoreScene(JSON.parse(raw));
      if(!back&&safe.motion==='spin')safe.motion='sway';
      if(!backgroundImage&&safe.background==='image'){safe.background='spotlight';setMessage('Scene restored. Choose your background image again.');}
      else setMessage('Saved scene restored.');
      setSettings(safe);
    }catch{setError('The saved settings could not be restored.');}
  }
  async function usePracticeCard(kind:'sports'|'slab') {
    setLoading(true);setPlaying(false);setError('');
    try {
      const nextFront=await loadAsset(kind==='slab'?'/local-card/jordan-psa-front.png':'/local-card/angel-reese-front.png',kind==='slab'?'Michael Jordan · supplied PSA photo':'Angel Reese · your front photo');
      const nextBack=kind==='slab'?null:await loadAsset('/local-card/angel-reese-back.png','Angel Reese · your back photo');
      releaseAsset(front);releaseAsset(back);setFront(nextFront);setBack(nextBack);setFrontCrop(freshCrop());setBackCrop(freshCrop());setFace('front');setCropOpen(false);
      setSettings(s=>({...s,profile:kind,ratio:kind==='slab'?'source':'standard',finish:'gloss',motion:kind==='slab'?'sway':'reveal',flip:kind==='sports',title:kind==='slab'?'MICHAEL JORDAN':'ANGEL REESE',subtitle:kind==='slab'?'1990 HOOPS · #65 · PSA 9':'BOWMAN UNIVERSITY CHROME · NO. 49'}));
      setTime(0);studio.current?.inspectView('reset');
    } catch(e){setError(e instanceof Error?e.message:String(e));}
    finally{setLoading(false);}
  }
  function chooseMotion(motion:Settings['motion']) {setSettings(s=>({...s,motion}));setTime(0);setFilmView(true);setPlaying(false);}
  const phase=sampleTimeline(time,settings).phase;
  return <div className={`app-shell tab-${panel} ${filmView?'film-view':'canvas-view'}`} style={{'--brand-accent':settings.brandAccent} as CSSProperties}>
    <header className="app-header"><a className="brand" href="/" aria-label="Columbia Card Studio home"><img src="/brand/columbia-sports-cards-wordmark.png" alt="Columbia"/><strong>Card Studio<small>SPORTS · TCG · GRADED</small></strong></a><span className="beta">PROTOTYPE</span></header>
    <nav className="inspector-tabs" aria-label="Inspector"><button className={panel==='card'?'active':''} onClick={()=>setPanel('card')}>Card</button><button className={panel==='brand'?'active':''} onClick={()=>setPanel('brand')}>Brand</button><button className={panel==='scene'?'active':''} onClick={()=>setPanel('scene')}>Scene</button><button className={panel==='export'?'active':''} onClick={()=>setPanel('export')}>Export</button></nav>
    <div className="canvas-tools"><button title="Restore saved scene" aria-label="Restore scene" onClick={restoreSettings} disabled={busy}><RotateCcw size={17}/></button><button title="Save scene settings" aria-label="Save scene" onClick={saveSettings} disabled={busy}><Check size={17}/></button><button className={filmView?'active':''} aria-label={filmView?'Switch to 3D inspect':'Switch to film preview'} onClick={()=>{setPlaying(false);setFilmView(v=>!v)}}><Maximize size={16}/><span>{filmView?'Film preview':'3D inspect'}</span></button></div>
    {(error||message)&&<div className={`notice ${error?'error':''}`} role={error?'alert':'status'}><span>{error||message}</span><button className="icon-button" aria-label="Dismiss notification" onClick={()=>{setError('');setMessage('')}}><X size={16}/></button></div>}
    <main className="workspace">
      <aside className="assets-panel panel"><fieldset disabled={busy||loading}>
        <Section number="01" title="The card">
          <p className="section-intro">Import the front and back from your photo setup.</p>
          <label className="field">Card profile<select aria-label="Card profile" value={settings.profile} onChange={e=>update('profile',e.target.value as Settings['profile'])}><option value="sports">Sports · square corners</option><option value="tcg">TCG · rounded corners</option><option value="slab">Graded slab · full holder</option><option value="custom">Custom corners</option></select></label>
          {(settings.profile==='tcg'||settings.profile==='custom')&&<><p className="fine-print">For Pokémon, One Piece, Lorcana and other TCGs. Match the curve to your photo.</p><Range label="Corner radius" min={0} max={6} step={0.1} value={settings.profile==='tcg'?2.8:settings.cornerRadius} display={`${settings.profile==='tcg'?2.8:settings.cornerRadius}%`} onChange={cornerRadius=>setSettings(s=>({...s,profile:'custom',cornerRadius}))}/></>}
          {settings.profile==='slab'&&<p className="fine-print">Keep the whole holder and label in the photo. Source proportions are preserved; holder depth is approximate.</p>}
          {localSamples&&<div className="practice-cards"><span>TRY YOUR PHOTOS</span><button onClick={()=>void usePracticeCard('sports')}>Reese · raw</button><button onClick={()=>void usePracticeCard('slab')}>Jordan · graded</button></div>}
          <AssetSlot label="Front image" asset={front} onFile={file=>handleUpload('front',file)} onRemove={()=>{releaseAsset(front);setFront(null);setPlaying(false);}}/>
          <AssetSlot label="Back image" asset={back} optional onFile={file=>handleUpload('back',file)} onRemove={()=>{releaseAsset(back);setBack(null);setSettings(s=>({...s,flip:false,motion:s.motion==='spin'?'sway':s.motion}));}}/>
          <button className={`wide-button ${cropOpen?'selected':''}`} disabled={!front} onClick={()=>setCropOpen(o=>!o)}><Maximize size={14}/>Crop & alignment<ChevronRight className={cropOpen?'rotated':''} size={14}/></button>
          {cropOpen&&front&&<div className="crop-editor"><div className="segmented"><button className={face==='front'?'active':''} onClick={()=>setFace('front')}>Front</button><button disabled={!back} className={face==='back'?'active':''} onClick={()=>setFace('back')}>Back</button></div><canvas ref={cropCanvas} className="crop-preview" aria-label="Aligned artwork preview"/>
            <label className="field">Card proportions<select value={settings.ratio} onChange={e=>update('ratio',e.target.value as Settings['ratio'])}><option value="source">Match front image</option><option value="standard">Standard · 2.5 × 3.5</option></select></label>
            <div className="segmented"><button className={selectedCrop.fit==='contain'?'active':''} onClick={()=>updateCrop({fit:'contain'})}>Fit entire image</button><button className={selectedCrop.fit==='cover'?'active':''} onClick={()=>updateCrop({fit:'cover'})}>Fill card</button></div>
            <Range label="Crop zoom" min={1} max={3} step={0.01} value={selectedCrop.zoom} display={`${selectedCrop.zoom.toFixed(2)}×`} onChange={zoom=>updateCrop({zoom})}/>
            <Range label="Horizontal alignment" min={-1} max={1} step={0.01} value={selectedCrop.x} display={`${Math.round(selectedCrop.x*100)}%`} onChange={x=>updateCrop({x})}/>
            <Range label="Vertical alignment" min={-1} max={1} step={0.01} value={selectedCrop.y} display={`${Math.round(selectedCrop.y*100)}%`} onChange={y=>updateCrop({y})}/>
            <div className="row"><button className="quiet-button" onClick={()=>updateCrop({rotation:(selectedCrop.rotation+90)%360})}><RotateCw size={13}/>Rotate 90°</button><button className="quiet-button" onClick={()=>updateCrop(freshCrop())}>Reset crop</button></div><p className="fine-print">Fit preserves the full image. Fill and zoom crop the photograph; they never stretch it.</p></div>}
          {front?.sample&&<div className="sample-note"><span>SAMPLE FROM THE ARCHIVE</span><p>Ty Cobb, 1911. A real card scan from the Library of Congress.</p><a href="https://www.loc.gov/item/2007685675/" target="_blank" rel="noreferrer">View source <ArrowUpRight size={12}/></a><button className="text-button" onClick={async()=>{try{setLoading(true);setBack(await loadAsset('/samples/ty-cobb-back.jpg','Ty Cobb · sample reverse',true));}catch(e){setError(String(e));}finally{setLoading(false)}}} disabled={!!back}>Load sample reverse</button></div>}
        </Section>
        <Section number="02" title="Card details"><p className="section-intro">The caption beneath your card in the film.</p>
          <label className="field">Player / title<input aria-label="Player or title" value={settings.title} maxLength={45} placeholder="e.g. SHOHEI OHTANI" onChange={e=>update('title',e.target.value)}/></label>
          <label className="field">Set / card details<input aria-label="Set or card details" value={settings.subtitle} maxLength={70} placeholder="Set · year · card number" onChange={e=>update('subtitle',e.target.value)}/></label>
          <label className="field">Shop name<input aria-label="Shop name" value={settings.shop} maxLength={45} placeholder="Your shop, your signature" onChange={e=>update('shop',e.target.value)}/></label>
          <input ref={logoUpload} hidden type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload shop logo" onChange={(e:ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(f)handleUpload('logo',f);e.target.value='';}}/>
          <div className="row"><button className="wide-button" onClick={()=>logoUpload.current?.click()}><ImagePlus size={14}/>{logo?'Replace logo':'Add shop logo'}<small>Optional</small></button>{logo&&<button className="icon-button" aria-label="Remove logo" onClick={()=>{releaseAsset(logo);setLogo(null)}}><X size={15}/></button>}</div>
          {logo&&<p className="fine-print">{logo.name} · replaces the shop name in the film.</p>}
        </Section>
      </fieldset><div className="local-note"><ShieldCheck size={15}/><span>Originals stay untouched.<br/>No uploads. No generated artwork.</span></div></aside>
      <section className="preview-panel"><div className="stage-toolbar"><span><span className="status-dot"/>{loading?'LOADING ARTWORK':busy?'RENDERING YOUR FILM':ready?'LIVE PREVIEW':'STARTING STUDIO'}</span><span>9:16 <i/>1080 × 1920</span></div>
        <div className="stage" ref={stageRef}><div className="stage-cross tl"/><div className="stage-cross br"/><span className="stage-label">PULL STUDIO / HERO REVEAL</span>
          <div className="portrait" style={filmView?undefined:{width:'100%',aspectRatio:'auto'}}><canvas ref={canvasRef} aria-label={filmView?'Cinematic card preview':'Interactive 3D card'} tabIndex={filmView?-1:0} aria-describedby={filmView?undefined:'inspection-help'} onKeyDown={e=>{
            if(filmView)return;
            const angles:Record<string,[number,number]>={ArrowLeft:[0.15,0],ArrowRight:[-0.15,0],ArrowUp:[0,0.15],ArrowDown:[0,-0.15]};
            if(angles[e.key]){e.preventDefault();studio.current?.orbitInspection(...angles[e.key]);}
            if(e.key==='Home'){e.preventDefault();studio.current?.inspectView('reset');}
          }}/>{(!front||loading||!ready)&&<div className="stage-empty">{loading?<LoaderCircle className="spin"/>:<ImagePlus size={30}/>}<strong>{loading?'Preparing your card':!front?'Start with a card':'Starting the studio'}</strong><span>{!front&&!loading?'Add a front image to enter the studio.':'Your original artwork stays intact.'}</span></div>}</div>
          {front?.sample&&<span className="sample-badge">ARCHIVAL SAMPLE</span>}<span className="stage-caption">{phase.toUpperCase()}<span>{String(Math.floor(time*fps)).padStart(3,'0')} / {Math.round(duration*fps)}</span></span>
        </div>
        {filmView?<div className="playback"><button className="play-button" aria-label={playing?'Pause preview':'Play preview'} disabled={!front||!ready||busy} onClick={()=>{if(time>=duration)setTime(0);setPlaying(v=>!v)}}>{playing?<Pause size={16} fill="currentColor"/>:<Play size={16} fill="currentColor"/>}</button><button className="icon-button" aria-label="Restart preview" disabled={busy||!front} onClick={()=>{setTime(0);setPlaying(true)}}><RotateCcw size={16}/></button><span className="timecode">{time.toFixed(2)}<small> / {duration.toFixed(2)}</small></span><input aria-label="Timeline" type="range" min={0} max={duration} step={1/fps} value={time} disabled={busy||!front} onChange={e=>{setPlaying(false);setTime(+e.target.value)}}/><span className="fps-tag">{fps} FPS</span></div>:<div className="inspection-dock">
          <span id="inspection-help">Drag to rotate · Scroll to zoom<small>Arrow keys rotate · Home resets</small></span>
          <div className="inspection-actions"><button disabled={!front||!ready} onClick={()=>studio.current?.inspectView('front')}>Front</button><button disabled={!back||!ready} onClick={()=>studio.current?.inspectView('back')}>Back</button><i/>
          <button className="icon-button" aria-label="Zoom out" onClick={()=>studio.current?.zoomInspection(1.15)}><Minus size={15}/></button><button className="icon-button" aria-label="Zoom in" onClick={()=>studio.current?.zoomInspection(1/1.15)}><Plus size={15}/></button><button className="icon-button" aria-label="Reset 3D view" onClick={()=>studio.current?.inspectView('reset')}><RotateCcw size={15}/></button></div>
        </div>}
        <div className="storyboard">{[['Emergence',0,1.5],['Reveal',1.5,3.5],['Hero',3.5,6],['Signature',6,8]].map(([name,start,end],index)=><button key={name} disabled={busy||!front} className={phase===name?'active':''} onClick={()=>{setPlaying(false);setTime(((+start + +end)/2)/settings.speed)}}><span>0{index+1}<i/></span><strong>{name}</strong><small>{(+start/settings.speed).toFixed(1)}—{(+end/settings.speed).toFixed(1)}s</small></button>)}</div>
        <div className="preview-footer"><span><Clapperboard size={14}/>Your artwork stays on this device.</span><span>1080 × 1920 · MP4</span></div>
      </section>
      <aside className="brand-panel panel"><fieldset disabled={busy||loading}>
        <Section number="03" title="Columbia backgrounds"><p className="section-intro">Choose a look, then make it yours. Shown in Film preview.</p>
          <div className="background-options">{([['spotlight','Spotlight'],['diagonal','Diagonal'],['paper','Paper'],['studio','Original studio']] as const).map(([value,label])=><button key={value} aria-label={`${label} background`} aria-pressed={settings.background===value} className={settings.background===value?'active':''} onClick={()=>{update('background',value);setFilmView(true);setPlaying(false);}}><span className={`background-swatch ${value}`}/><strong>{label}</strong></button>)}</div>
          <div className="brand-colors"><label>Accent<input aria-label="Brand accent color" type="color" value={settings.brandAccent} onChange={e=>update('brandAccent',e.target.value)}/><small>{settings.brandAccent.toUpperCase()}</small></label><label>Dark base<input aria-label="Brand base color" type="color" value={settings.brandBase} onChange={e=>update('brandBase',e.target.value)}/><small>{settings.brandBase.toUpperCase()}</small></label></div>
          <Range label={settings.background==='image'?'Background shade':'Background detail'} min={0} max={1} step={0.01} value={settings.backgroundStrength} display={`${Math.round(settings.backgroundStrength*100)}%`} onChange={v=>update('backgroundStrength',v)}/>
          <button className="quiet-button" onClick={()=>setSettings(s=>({...s,brandAccent:'#9EB94A',brandBase:'#121212',backgroundStrength:0.65}))}>Reset Columbia colors</button>
          <input ref={backgroundUpload} hidden type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload background image" onChange={e=>{const file=e.target.files?.[0];if(file)void handleUpload('background',file);e.target.value='';}}/>
          <button className="wide-button" onClick={()=>backgroundUpload.current?.click()}><ImagePlus size={14}/>{backgroundImage?'Replace background photo':'Use a background photo'}</button>
          {backgroundImage&&<div className="row"><button className="quiet-button" onClick={()=>{update('background','image');setFilmView(true)}}>Show uploaded background</button><button className="icon-button" aria-label="Remove background image" onClick={()=>{releaseAsset(backgroundImage);setBackgroundImage(null);update('background','spotlight')}}><Trash2 size={14}/></button></div>}
        </Section>
        <Section number="04" title="Brand signature"><div className="brand-logo-preview"><img src={logo?.url ?? "/brand/columbia-sports-cards-wordmark.png"} alt="Selected brand logo"/></div>
          <label className="checkbox-label"><input type="checkbox" checked={settings.showBrand} onChange={e=>update('showBrand',e.target.checked)}/><span>Show logo in the film</span></label>
          <div className="row"><button className="quiet-button" onClick={()=>logoUpload.current?.click()}>Upload a logo</button><button className="quiet-button" onClick={async()=>{try{const asset=await loadAsset('/brand/columbia-sports-cards-wordmark.png','Columbia website logo');releaseAsset(logo);setLogo(asset);update('showBrand',true);}catch(e){setError(String(e));}}}>Use Columbia logo</button></div>
          <p className="fine-print">Website logo · original flat image. Your custom logo can be a transparent PNG.</p>
          <button className="wide-button" onClick={saveSettings}><Check size={14}/>Save this look</button>
        </Section>
      </fieldset></aside>
      <aside className="scene-panel panel"><fieldset disabled={busy||loading}>
        <Section number="03" title="Motion & lighting"><div className="preset-heading"><span className="preset-icon"><Sparkles size={19}/></span><div><strong>{settings.motion==='spin'?'Slow 360° turn':settings.motion==='sway'?'Gentle sway':'Hero reveal'}</strong><small>{settings.motion==='reveal'?'A cinematic reveal and signature.':'A seamless loop for your card.'}</small></div></div>
          <label className="field">Motion<select aria-label="Motion preset" value={settings.motion} onChange={e=>chooseMotion(e.target.value as Settings['motion'])}><option value="reveal">Hero reveal · 8 seconds</option><option value="spin" disabled={!back}>Slow 360° turn · 16 seconds</option><option value="sway">Gentle sway · 8 seconds</option></select></label>
          {!back&&<p className="fine-print">Gentle sway works with one photo. Add the real reverse for a full 360° film.</p>}
          <button className="wide-button" disabled={!front} onClick={()=>{setFilmView(true);setTime(0);setPlaying(true)}}><Play size={13}/>Play this scene</button>
          <div className="small-divider"/>
          <label className="field-label">STUDIO LIGHT</label><div className="look-options">{(['obsidian','warm','silver'] as const).map(look=><button key={look} aria-label={`${look} studio light`} className={settings.look===look?'active':''} onClick={()=>update('look',look)}><span className={`look-swatch ${look}`}>{settings.look===look&&<Check size={13}/>}</span><strong>{look==='warm'?'Warm':look==='silver'?'Silver':'Obsidian'}</strong></button>)}</div>
          <Range label="Light intensity" min={0.5} max={1.5} step={0.01} value={settings.light} display={`${Math.round(settings.light*100)}%`} onChange={v=>update('light',v)}/>
          <label className="field">Surface finish<select value={settings.finish} onChange={e=>update('finish',e.target.value as Settings['finish'])}><option value="paper">Matte paper</option><option value="gloss">Gloss coating</option><option value="foil">Subtle foil · simulated</option></select></label>{settings.finish==='foil'&&<p className="fine-print">Use only for a foil card. This is a surface simulation, not a reconstruction of its foil pattern.</p>}
          <div className="small-divider"/><div className="subheading"><Settings2 size={13}/>COMPOSITION</div>
          <Range label="Final card angle" min={-25} max={25} value={settings.tilt} display={`${settings.tilt}°`} onChange={v=>update('tilt',v)}/>
          <Range label="Camera framing" min={0.8} max={1.15} step={0.01} value={settings.framing} display={`${settings.framing.toFixed(2)}×`} onChange={v=>update('framing',v)}/>
          <Range label="Playback speed" min={0.75} max={1.25} step={0.05} value={settings.speed} display={`${settings.speed.toFixed(2)}×`} onChange={v=>update('speed',v)}/>
          {settings.motion==='reveal'&&<label className="checkbox-label"><input type="checkbox" checked={settings.flip} disabled={!back} onChange={e=>update('flip',e.target.checked)}/><span>Include a full card turn<small>{back?'Show both sides during the reveal.':'Add a reverse image to enable.'}</small></span></label>}
        </Section>
        <Section number="04" title="The final cut"><div className="output-spec"><span>VERTICAL MP4<strong>1080 <i>×</i> 1920</strong></span><div className="vertical-icon"/></div>
          <div className="export-fields"><label className="field">Frame rate<select aria-label="Frame rate" value={fps} onChange={e=>setFps(+e.target.value as 24|30)}><option value={30}>30 fps</option><option value={24}>24 fps</option></select></label><label className="field">Quality<select aria-label="Export quality" value={bitrate} onChange={e=>setBitrate(+e.target.value)}><option value={12000000}>High · 12 Mbps</option><option value={18000000}>Max · 18 Mbps</option></select></label></div>
          <div className="export-meta"><span>{duration.toFixed(1)} seconds · H.264</span><span>Silent film</span></div>
        </Section>
      </fieldset>
      <div className="export-action">{busy?<><div className="render-progress" role="status"><LoaderCircle size={15} className="spin"/><span>{progress!>=0.97?'Finalizing MP4':'Rendering your film'}</span><strong>{Math.round(progress!*100)}%</strong></div><progress value={progress!} max={1}/><button className="wide-button" onClick={()=>controller.current?.abort()}>Cancel render</button></>:<button className="export-button" disabled={!input||!ready||loading||supported!==true} onClick={renderVideo}><ArrowDownToLine size={17}/>Export film<ArrowUpRight size={16}/></button>}
        <p className={`export-status ${supported===false?'unsupported':''}`}>{supported===null?'Checking browser encoder…':supported?'H.264 encoder ready · rendered on your device':'MP4 export unavailable. Open in current Chrome or Edge.'}</p>
        {result&&<div className="result"><div><CheckCircle2 size={15}/><strong>Last export ready</strong><small>{(result.size/1_000_000).toFixed(1)} MB</small></div><div className="row"><button className="quiet-button" onClick={()=>setShowVideo(true)}><Play size={12}/>Watch film</button><a className="download-link" href={result.url} download="columbia-card-studio.mp4">Download MP4<ArrowDownToLine size={13}/></a></div></div>}
      </div></aside>
    </main>
    <div className="inspector-bottom"><span className="status-dot"/><span>{busy?`Rendering · ${Math.round(progress!*100)}%`:loading?'Loading image…':'Local studio'}</span><button onClick={()=>setPanel(panel==='export'?'card':'export')}>{panel==='export'?'Back to card':'Export film'}<ArrowUpRight size={13}/></button></div>
    <footer className="app-footer"><span>PULL STUDIO <span> / </span> MADE FOR THE MOMENT.</span><span><Sun size={12}/>Studio prototype<span>·</span> Desktop Chrome recommended</span></footer>
    {showVideo&&result&&<div className="modal-backdrop" onClick={()=>setShowVideo(false)}><div className="video-modal" role="dialog" aria-modal="true" aria-label="Exported film" onClick={e=>e.stopPropagation()}><div><strong>Your final cut</strong><button autoFocus className="icon-button" aria-label="Close exported film" onClick={()=>setShowVideo(false)}><X size={20}/></button></div><video controls playsInline autoPlay src={result.url}/><p>1080 × 1920 · {result.duration.toFixed(2)} seconds · MP4</p></div></div>}
  </div>;
}
