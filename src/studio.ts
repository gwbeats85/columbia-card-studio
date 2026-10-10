import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { backgroundInk, drawBrandBackground } from './backgrounds';
import { cardAspect, cornerFraction, fitRect, sampleTimeline } from './model';
import type { Asset, Crop, RenderInput } from './model';

const looks = {
  obsidian: { center: '#242721', edge: '#070a09', accent: '#eee0c0', rim: '#c3d9d2' },
  warm: { center: '#382a21', edge: '#0f0c09', accent: '#ffd5a0', rim: '#d9b47a' },
  silver: { center: '#293239', edge: '#0b1015', accent: '#e6f0ff', rim: '#b5d5f5' },
};
function cardShape(width: number, height: number, radius: number) {
  const x = -width / 2, y = -height / 2;
  const s = new THREE.Shape();
  const r=Math.min(radius,width/2,height/2);
  if(r===0){s.moveTo(x,y);s.lineTo(x+width,y);s.lineTo(x+width,y+height);s.lineTo(x,y+height);}
  else {
    s.moveTo(x+r,y);s.lineTo(x+width-r,y);s.quadraticCurveTo(x+width,y,x+width,y+r);
    s.lineTo(x+width,y+height-r);s.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
    s.lineTo(x+r,y+height);s.quadraticCurveTo(x,y+height,x,y+height-r);
    s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  }
  s.closePath();return s;
}
export function makeArtwork(asset: Asset | null, crop: Crop, aspect: number) {
  const canvas = document.createElement('canvas');
  canvas.height = Math.min(2048, Math.round(2048 / Math.max(1, aspect))); canvas.width = Math.round(canvas.height * aspect);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = asset ? '#dfdacd' : '#c9c4b8'; ctx.fillRect(0,0,canvas.width,canvas.height);
  if (asset) {
    const rotated = crop.rotation % 180 !== 0;
    const sw = rotated ? asset.image.naturalHeight : asset.image.naturalWidth;
    const sh = rotated ? asset.image.naturalWidth : asset.image.naturalHeight;
    const rect = fitRect(sw, sh, canvas.width, canvas.height, crop);
    ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2); ctx.rotate(crop.rotation * Math.PI / 180);
    ctx.drawImage(asset.image, -(rotated ? rect.height : rect.width)/2, -(rotated ? rect.width : rect.height)/2, rotated ? rect.height : rect.width, rotated ? rect.width : rect.height);
  }
  return canvas;
}
export class Studio {
  readonly canvas: HTMLCanvasElement;
  private inspecting = false;
  transparentOutput = false;
  get workspaceView() { return this.inspecting; }
  set workspaceView(value: boolean) { this.inspecting=value; this.controls.enabled=value; }
  readonly renderer: THREE.WebGLRenderer;
  private ctx: CanvasRenderingContext2D;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(31, 9/16, 0.1, 100);
  private inspectionCamera = new THREE.PerspectiveCamera(31, 9/16, 0.1, 100);
  private controls: OrbitControls;
  private lastTime = 7;
  private card = new THREE.Group();
  private reflection = new THREE.Group();
  private key = new THREE.SpotLight('#ffffff', 110, 28, Math.PI / 5, 0.9, 2);
  private rim = new THREE.SpotLight('#e5e0ce', 120, 30, Math.PI / 4, 1, 1.4);
  private fill = new THREE.HemisphereLight('#ffffff', '#3b3327', 1.4);
  private sweep = new THREE.RectAreaLight('#ffffff', 2.5, 0.35, 5);
  private env: THREE.WebGLRenderTarget;
  private input: RenderInput | null = null;
  private textures: THREE.Texture[] = [];
  private width = 540;
  private height = 960;
  private disposed = false;
  private foil: THREE.ShaderMaterial | null = null;
  constructor(canvas: HTMLCanvasElement) {
    RectAreaLightUniformsLib.init();
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas is unavailable in this browser.'); this.ctx = ctx;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping; this.renderer.toneMappingExposure = 0.78;
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    const pmrem = new THREE.PMREMGenerator(this.renderer), room = new RoomEnvironment();
    this.env = pmrem.fromScene(room, 0.04); this.scene.environment = this.env.texture; room.dispose(); pmrem.dispose();
    this.scene.add(this.card, this.reflection, this.key, this.rim, this.fill, this.sweep);
    this.key.position.set(-3.8, 5.5, 6); this.key.target.position.set(0,0,0); this.scene.add(this.key.target);
    this.key.castShadow = true; this.key.shadow.mapSize.set(2048,2048); this.key.shadow.bias = -0.00015; this.key.shadow.normalBias = 0.025;
    this.rim.position.set(3.5, 2.5, -2); this.scene.add(this.rim.target);
    this.sweep.position.set(-3,0,5); this.sweep.lookAt(0,0,0);
    this.inspectionCamera.position.set(0,0,9);
    this.controls=new OrbitControls(this.inspectionCamera,canvas);
    this.controls.enabled=false; this.controls.enablePan=false; this.controls.enableDamping=false;
    this.controls.minDistance=4; this.controls.maxDistance=28; this.controls.rotateSpeed=0.7;
    this.controls.addEventListener('change',()=>{if(this.workspaceView)this.render(this.lastTime);});
    this.setSize(540,960);
  }
  setSize(width: number, height: number) {
    this.width=width; this.height=height; this.canvas.width=width; this.canvas.height=height;
    this.renderer.setSize(width,height,false); this.camera.aspect=width/height; this.camera.updateProjectionMatrix();
    this.inspectionCamera.aspect=width/height; this.inspectionCamera.updateProjectionMatrix();
  }
  inspectView(side: 'front'|'back'|'reset') {
    const aspect=this.input?cardAspect(this.input):2.5/3.5;
    const distance=9*Math.max(1,aspect/this.inspectionCamera.aspect);
    this.inspectionCamera.position.set(0,0,side==='back'?-distance:distance);
    this.inspectionCamera.up.set(0,1,0); this.controls.target.set(0,0,0); this.controls.update();
    this.render(this.lastTime);
  }
  zoomInspection(factor: number) {
    this.inspectionCamera.position.multiplyScalar(factor);this.controls.update();
  }
  orbitInspection(horizontal: number, vertical: number) {
    this.controls.rotateLeft(horizontal);this.controls.rotateUp(vertical);
  }
  private clearCard() {
    for (const group of [this.card,this.reflection]) {
      group.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose(); } });
      group.clear();
    }
    this.textures.forEach(t=>t.dispose()); this.textures=[]; this.foil=null;
  }
  setInput(input: RenderInput) {
    // Only rebuild geometry/textures for actual art/crop/finish changes.
    const previous=this.input;
    const rebuild=!previous || previous.front!==input.front || previous.back!==input.back || JSON.stringify([previous.frontCrop,previous.backCrop,previous.settings.ratio,previous.settings.finish,previous.settings.profile,previous.settings.cornerRadius])!==JSON.stringify([input.frontCrop,input.backCrop,input.settings.ratio,input.settings.finish,input.settings.profile,input.settings.cornerRadius]);
    this.input=input;
    if (!rebuild) return;
    this.clearCard();
    const aspect=cardAspect(input), height=3.5, width=height*aspect, depth=input.settings.profile==='slab'?0.14:0.026;
    // Every face and surface effect follows the selected raw-card or holder outline.
    const shape=cardShape(width,height,height*cornerFraction(input.settings));
    const bodyGeo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1});
    bodyGeo.translate(0,0,-depth/2);
    const body=new THREE.Mesh(bodyGeo,new THREE.MeshStandardMaterial({color:input.settings.profile==='slab'?'#9da6a2':'#b9b3a4',roughness:input.settings.profile==='slab'?0.25:0.81,metalness:0.03})); body.castShadow=true; body.receiveShadow=true; this.card.add(body);
    for (const side of ['front','back'] as const) {
      const texture=new THREE.CanvasTexture(makeArtwork(input[side],input[`${side}Crop`],aspect));
      texture.colorSpace=THREE.SRGBColorSpace; texture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()); this.textures.push(texture);
      const geo=new THREE.ShapeGeometry(shape,24), position=geo.attributes.position;
      for(let i=0;i<position.count;i++) geo.attributes.uv.setXY(i,position.getX(i)/width+0.5,position.getY(i)/height+0.5);
      const material=new THREE.MeshPhysicalMaterial({map:texture,roughness:input.settings.finish==='paper'?0.9:0.48,metalness:0,specularIntensity:input.settings.finish==='paper'?1:0.3,clearcoat:input.settings.finish==='paper'?0:0.25,clearcoatRoughness:0.4,envMapIntensity:0.2});
      const face=new THREE.Mesh(geo,material); face.position.z=side==='front'?depth/2+0.0005:-depth/2-0.0005;
      if(side==='back') face.rotation.y=Math.PI;
      this.card.add(face);
    }
    if(input.settings.finish==='foil') {
      this.foil=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv; uniform float uTime; void main(){float line=exp(-pow((vUv.x+vUv.y*0.3-(uTime*0.13-0.2))*6.0,2.0));vec3 c=0.5+0.5*cos(6.2831*(vUv.x*0.8+vUv.y*0.3+vec3(0.0,0.33,0.67)+uTime*0.055));gl_FragColor=vec4(c,line*0.13);}' });
      const foilGeo=new THREE.ShapeGeometry(shape,24); const p=foilGeo.attributes.position;
      for(let i=0;i<p.count;i++) foilGeo.attributes.uv.setXY(i,p.getX(i)/width+0.5,p.getY(i)/height+0.5);
      const foilMesh=new THREE.Mesh(foilGeo,this.foil); foilMesh.position.z=depth/2+0.0006; this.card.add(foilMesh);
    }
    // A restrained mirrored silhouette on the dark studio floor.
    for(const obj of this.card.children) if(obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshPhysicalMaterial) {
      const material=new THREE.MeshBasicMaterial({map:obj.material.map,transparent:true,opacity:0.035,depthWrite:false,color:'#b5baa8'});
      const reflection=new THREE.Mesh(obj.geometry.clone(),material); reflection.position.copy(obj.position); reflection.rotation.copy(obj.rotation); this.reflection.add(reflection);
    }
  }
  render(seconds: number) {
    if(!this.input || this.disposed) return;
    if(this.renderer.getContext().isContextLost()) throw new Error('The graphics context was lost. Reload Pull Studio and try again.');
    this.lastTime=seconds;
    const {settings,logo,backgroundImage}=this.input, state=sampleTimeline(this.workspaceView?7/settings.speed:seconds,settings), palette=looks[settings.look];
    // Control ambient surface exposure as well as the key: the environment
    // must not reveal the printed face before the authored emergence.
    for(const mesh of this.card.children) if(mesh instanceof THREE.Mesh && mesh.material instanceof THREE.MeshPhysicalMaterial) mesh.material.color.setScalar(Math.pow(state.visibility,1.45));
    for(const mesh of this.reflection.children) if(mesh instanceof THREE.Mesh) (mesh.material as THREE.MeshBasicMaterial).opacity=0.035*state.visibility;
    if(this.workspaceView){this.card.rotation.set(0,0,0);this.card.position.y=0;}
    else {this.card.rotation.set(state.pitch,state.yaw,state.roll);this.card.position.y=state.y;}
    this.reflection.visible=!this.workspaceView && !this.transparentOutput;
    this.reflection.rotation.copy(this.card.rotation); this.reflection.position.y=-4.12-state.y; this.reflection.scale.y=-1;
    this.camera.position.set(0,0.35,state.cameraZ * Math.max(1,cardAspect(this.input)/0.79)); this.camera.lookAt(0,-0.05,0);
    this.key.intensity=32*state.key*settings.light; this.fill.intensity=0.95*state.visibility*settings.light;
    this.rim.color.set(palette.rim); this.rim.intensity=(75+35*state.visibility)*settings.light;
    this.sweep.color.set(palette.accent); this.sweep.intensity=0.65*state.visibility*settings.light; this.sweep.position.x=state.sweepX; this.sweep.lookAt(0,0,0);
    if(this.foil) this.foil.uniforms.uTime.value=state.time;
    // Inspection lighting follows the viewer so either photographed face remains readable.
    // Film lighting is restored explicitly on every sampled frame.
    if(this.workspaceView){
      this.inspectionCamera.updateMatrixWorld();
      this.key.position.set(-3.8,5.5,6).applyQuaternion(this.inspectionCamera.quaternion);
      this.rim.position.set(3.5,2.5,-2).applyQuaternion(this.inspectionCamera.quaternion);
      this.sweep.position.set(state.sweepX,0,5).applyQuaternion(this.inspectionCamera.quaternion);
    } else {this.key.position.set(-3.8,5.5,6);this.rim.position.set(3.5,2.5,-2);this.sweep.position.set(state.sweepX,0,5);}
    this.sweep.lookAt(0,0,0);
    this.renderer.render(this.scene,this.workspaceView?this.inspectionCamera:this.camera);
    const ctx=this.ctx,w=this.width,h=this.height;
    ctx.clearRect(0,0,w,h);
    if(this.workspaceView || this.transparentOutput){ctx.drawImage(this.renderer.domElement,0,0,w,h);return;}
    const gradient=ctx.createRadialGradient(w*0.5,h*0.42,0,w*0.5,h*0.42,h*0.72);
    gradient.addColorStop(0,palette.center); gradient.addColorStop(1,palette.edge);
    ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    drawBrandBackground(ctx,w,h,settings.background,settings.brandAccent,settings.brandBase,settings.backgroundStrength);
    if(settings.background==='image'&&backgroundImage){
      const image=backgroundImage.image,scale=Math.max(w/image.naturalWidth,h/image.naturalHeight);
      ctx.drawImage(image,(w-image.naturalWidth*scale)/2,(h-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);
      ctx.fillStyle=`rgba(0,0,0,${settings.backgroundStrength*0.75})`;ctx.fillRect(0,0,w,h);
    }
    // A soft studio pool beneath the card; no random particles or wall-clock noise.
    ctx.save();ctx.translate(w*0.5,h*0.73);ctx.scale(1,0.18);
    const pool=ctx.createRadialGradient(0,0,0,0,0,w*0.47);pool.addColorStop(0,'rgba(172,166,134,0.08)');pool.addColorStop(1,'rgba(172,166,134,0)');ctx.fillStyle=pool;ctx.fillRect(-w,-w,w*2,w*2);ctx.restore();
    // Soft contact shadow is an analytical studio effect, not baked into artwork.
    ctx.save();ctx.translate(w/2,h*0.766);ctx.scale(1,0.13);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,h*0.18);shadow.addColorStop(0,'rgba(0,0,0,0.36)');shadow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=shadow;ctx.fillRect(-h,-h,h*2,h*2);ctx.restore();
    ctx.drawImage(this.renderer.domElement,0,0,w,h);
    // Typography is composited into the same canvas in preview and export.
    ctx.save();ctx.globalAlpha=state.signature;ctx.textAlign='center';ctx.fillStyle=backgroundInk(settings.background);
    if(this.workspaceView) { ctx.restore(); return; }
    const unit=h/1920;
    const fitText=(text:string,y:number,size:number,font:string) => {ctx.font=`${size*unit}px ${font}`;const width=ctx.measureText(text).width; if(width>w*0.83)ctx.font=`${size*unit*w*0.83/width}px ${font}`;ctx.fillText(text,w/2,y*h);};
    if(logo&&settings.showBrand) { const scale=Math.min(w*0.19/logo.image.naturalWidth,h*0.047/logo.image.naturalHeight); ctx.drawImage(logo.image,(w-logo.image.naturalWidth*scale)/2,h*0.111,logo.image.naturalWidth*scale,logo.image.naturalHeight*scale); }
    else if(settings.shop&&settings.showBrand) {ctx.globalAlpha=state.signature*0.68;fitText(settings.shop.toUpperCase(),0.139,21,'Arial, sans-serif');}
    ctx.globalAlpha=state.signature;fitText(settings.title,0.811,52,settings.background==='studio'?'Georgia, serif':'Arial, sans-serif');
    ctx.globalAlpha=state.signature*0.58;fitText(settings.subtitle,0.839,19,'Arial, sans-serif');
    if(settings.title||settings.subtitle){ctx.fillStyle=settings.background==='studio'?palette.accent:settings.brandAccent;ctx.globalAlpha=state.signature*0.65;ctx.fillRect(w/2-18*unit,h*0.871,36*unit,unit);}
    ctx.restore();
  }
  dispose() {
    this.disposed=true; this.controls.dispose(); this.clearCard(); this.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();if(object.material instanceof THREE.Material)object.material.dispose();}});
    this.env.dispose();this.key.dispose();this.rim.dispose();this.renderer.dispose();this.renderer.forceContextLoss();
  }
}
