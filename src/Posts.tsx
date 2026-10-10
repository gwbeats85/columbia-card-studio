import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import {
  Check,
  Download,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import {
  DEFAULT_POSTS_SAMPLE,
  POSTS_DIMENSIONS,
  POSTS_LOGO,
  PostsProjectStore,
  copyPostsProject,
  defaultPostsProject,
  importPostsProject,
  loadImage,
  renderPost,
  serializePostsProject,
  templateBackgroundUrl,
} from './post-model';
import type { PostsFormat, PostsImage, PostsProject, PostsRenderAssets, PostsTemplate } from './post-model';
import './posts.css';

export type PostsIncoming = { url: string; name: string; id: number };
export type PostsProps = { incoming?: PostsIncoming; onOpenCards?: () => void };

const IMAGE_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[a-z\d+/]+=*$/i;

function dataUrlFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('The selected file could not be read.'));
    reader.onerror = () => reject(reader.error ?? new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}

function fileAsset(file: File, pngOnly = false): Promise<{ asset: PostsImage; image: HTMLImageElement }> {
  if (file.size > 32 * 1024 * 1024) return Promise.reject(new Error('Choose an image smaller than 32 MB.'));
  if (pngOnly && file.type !== 'image/png') return Promise.reject(new Error('Custom backgrounds must be PNG files.'));
  if (!pngOnly && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return Promise.reject(new Error('Choose a JPEG, PNG, or WebP image.'));
  return dataUrlFromFile(file).then(async (dataUrl) => {
    if (!IMAGE_DATA_URL.test(dataUrl)) throw new Error('This image format is not supported.');
    const image = await loadImage(dataUrl);
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('Choose an image under 40 megapixels.');
    return { asset: { dataUrl, name: file.name.slice(0, 160) }, image };
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function updateProject<K extends keyof PostsProject>(setProject: React.Dispatch<React.SetStateAction<PostsProject>>, key: K, value: PostsProject[K]) {
  setProject((current) => ({ ...current, [key]: value }));
}

function TemplateThumbnail({ template, selected, onClick }: { template: PostsTemplate; selected: boolean; onClick: () => void }) {
  return <button aria-label={template === 'new-arrivals' ? 'New arrivals' : 'Featured card'} aria-pressed={selected} className={`posts-template ${selected ? 'selected' : ''} ${template}`} onClick={onClick} type="button">
    <span className="posts-template-art" style={{ backgroundImage: `url(${templateBackgroundUrl(template)})` }} />
    <span className="posts-template-copy"><strong>{template === 'new-arrivals' ? 'New arrivals' : 'Featured card'}</strong><small>{template === 'new-arrivals' ? 'Dark / lime editorial' : 'Light / gallery editorial'}</small></span>
    {selected && <Check size={15} aria-hidden="true" />}
  </button>;
}

function Field({ label, value, onChange, maxLength, placeholder }: { label: string; value: string; onChange: (value: string) => void; maxLength: number; placeholder: string }) {
  return <label className="posts-field"><span>{label}<small>{value.length}/{maxLength}</small></span><input value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

export default function Posts({ incoming, onOpenCards }: PostsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageUpload = useRef<HTMLInputElement>(null);
  const backgroundUpload = useRef<HTMLInputElement>(null);
  const projectUpload = useRef<HTMLInputElement>(null);
  const store = useMemo(() => new PostsProjectStore(), []);
  const [project, setProject] = useState<PostsProject>(() => defaultPostsProject());
  const [assets, setAssets] = useState<PostsRenderAssets>({ logo: null, image: null, templateBackground: null, customBackground: null });
  const [notice, setNotice] = useState<{ kind: 'error' | 'status'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSnapshot,setSavedSnapshot] = useState<string|null>(null);
  const incomingApplied = useRef<number | null>(null);

  const dimensions = POSTS_DIMENSIONS[project.format];
  const cssVars = { '--posts-accent': '#9EB94A' } as CSSProperties;

  async function applyProject(next: PostsProject, useDemoFallback = true) {
    const [logo, background] = await Promise.all([
      assets.logo ? Promise.resolve(assets.logo) : loadImage(POSTS_LOGO),
      next.customBackground ? loadImage(next.customBackground.dataUrl) : loadImage(templateBackgroundUrl(next.template)).catch(() => null),
    ]);
    const image = next.image ? await loadImage(next.image.dataUrl) : useDemoFallback ? await loadImage(DEFAULT_POSTS_SAMPLE) : null;
    setProject(copyPostsProject(next));
    setAssets({ logo, image, templateBackground: next.customBackground ? null : background, customBackground: next.customBackground ? background : null });
  }

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        let saved: PostsProject | null = null;
        try {
          saved = await store.load();
        } catch (error) {
          if (!cancelled) setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Local Posts storage could not be read.' });
        }
        const next = saved ?? defaultPostsProject();
        const [logo, image, background] = await Promise.all([
          loadImage(POSTS_LOGO),
          next.image ? loadImage(next.image.dataUrl) : loadImage(DEFAULT_POSTS_SAMPLE),
          next.customBackground ? loadImage(next.customBackground.dataUrl) : loadImage(templateBackgroundUrl(next.template)).catch(() => null),
        ]);
        if (cancelled) return;
        setProject(next);
        if(saved)setSavedSnapshot(serializePostsProject(saved));
        setAssets({ logo, image, templateBackground: next.customBackground ? null : background, customBackground: next.customBackground ? background : null });
        if (saved) setNotice({ kind: 'status', text: 'Restored your last local Posts project.' });
      } catch (error) {
        if (!cancelled) setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Posts could not be loaded.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void boot();
    return () => { cancelled = true; };
  }, [store]);

  useEffect(() => {
    if (loading || project.customBackground) return;
    let cancelled = false;
    loadImage(templateBackgroundUrl(project.template)).then((templateBackground) => {
      if (!cancelled) setAssets((current) => ({ ...current, templateBackground }));
    }).catch(() => {
      if (!cancelled) setAssets((current) => ({ ...current, templateBackground: null }));
    });
    return () => { cancelled = true; };
  }, [loading, project.template, project.customBackground]);

  useEffect(() => {
    if (loading || !incoming?.url || incoming.id < 0 || incomingApplied.current === incoming.id) return;
    incomingApplied.current = incoming.id;
    if (!IMAGE_DATA_URL.test(incoming.url)) {
      setNotice({ kind: 'error', text: 'The 3D card handoff must contain an embedded PNG, JPEG, or WebP image.' });
      return;
    }
    let cancelled = false;
    loadImage(incoming.url).then((image) => {
      if (cancelled) return;
      const imageInfo = { dataUrl: incoming.url, name: incoming.name.slice(0, 160) };
      setProject((current) => ({ ...current, image: imageInfo, headline: incoming.name.slice(0,90), details: '', badge: '', price: '', imageScale: 1, imageX: 0, imageY: 0 }));
      setAssets((current) => ({ ...current, image }));
      setNotice({ kind: 'status', text: 'The card photo was brought into Posts.' });
    }).catch((error) => { if (!cancelled) setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The handed-off image could not be loaded.' }); });
    return () => { cancelled = true; };
  }, [loading, incoming?.id, incoming?.url, incoming?.name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');
    if (ctx) renderPost(ctx, project, assets);
  }, [project, assets, dimensions.width, dimensions.height]);

  async function handleImage(file: File) {
    try {
      const loaded = await fileAsset(file);
      setProject((current) => ({ ...current, image: loaded.asset, ...(current.image ? {} : {headline: '', details: '', badge: '', price: ''}), imageScale: 1, imageX: 0, imageY: 0 }));
      setAssets((current) => ({ ...current, image: loaded.image }));
      setNotice({ kind: 'status', text: 'Card photo added. The original aspect ratio is preserved.' });
    } catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The card photo could not be loaded.' }); }
  }

  async function handleBackground(file: File) {
    try {
      const loaded = await fileAsset(file, true);
      setProject((current) => ({ ...current, customBackground: loaded.asset }));
      setAssets((current) => ({ ...current, customBackground: loaded.image, templateBackground: null }));
      setNotice({ kind: 'status', text: 'Custom PNG background applied.' });
    } catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The custom background could not be loaded.' }); }
  }

  async function saveProject() {
    try { await store.save(project); setSavedSnapshot(serializePostsProject(project)); setNotice({ kind: 'status', text: 'Posts project saved locally on this device.' }); }
    catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The project could not be saved locally.' }); }
  }

  async function reloadProject() {
    try {
      const saved = await store.load();
      if (!saved) { setNotice({ kind: 'status', text: 'No saved Posts project yet.' }); return; }
      await applyProject(saved);
      setSavedSnapshot(serializePostsProject(saved));
      setNotice({ kind: 'status', text: 'Saved Posts project reloaded.' });
    } catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The saved project could not be reloaded.' }); }
  }

  async function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) { setNotice({ kind: 'error', text: 'The browser could not encode this PNG.' }); return; }
    downloadBlob(blob, `columbia-post-${project.template}-${project.format}.png`);
    setNotice({ kind: 'status', text: 'PNG downloaded.' });
  }

  function downloadProject() {
    downloadBlob(new Blob([serializePostsProject(project)], { type: 'application/json' }), `columbia-post-${project.template}.json`);
    setNotice({ kind: 'status', text: 'Portable project JSON downloaded.' });
  }

  async function importProject(file: File) {
    try {
      if (file.size > 96 * 1024 * 1024) throw new Error('Project file is too large.');
      const next = importPostsProject(await file.text());
      await applyProject(next);
      setNotice({ kind: 'status', text: 'Portable Posts project imported.' });
    } catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The project file could not be imported.' }); }
  }

  function resetBackground() {
    setProject((current) => ({ ...current, customBackground: null }));
    setAssets((current) => ({ ...current, customBackground: null }));
    setNotice({ kind: 'status', text: 'Returned to the selected Columbia template background.' });
  }

  const update = <K extends keyof PostsProject>(key: K, value: PostsProject[K]) => updateProject(setProject, key, value);

  return <section className="posts-workspace" style={cssVars}>
    <header className="posts-topbar">
      <div className="posts-brand"><strong>columbia</strong><span>Social Studio</span></div>
      <div className="posts-document"><span className="posts-document-name">{project.headline || 'Untitled post'}</span><span className="posts-save-state">{savedSnapshot===serializePostsProject(project)?'Saved locally':savedSnapshot?'Unsaved changes':'Not saved yet'}</span></div>
      <div className="posts-top-actions">
        <nav className="posts-workspace-nav" aria-label="Studio workspace"><button aria-pressed="true" type="button">Posts</button><button type="button" onClick={onOpenCards}>3D cards</button></nav>
        <details className="posts-project-menu"><summary>Project</summary><div className="posts-project-popover">
          <button type="button" onClick={() => void reloadProject()}><RotateCcw size={15}/>Reload saved</button>
          <button type="button" onClick={downloadProject}><Download size={15}/>Download project</button>
          <button type="button" onClick={() => projectUpload.current?.click()}><Upload size={15}/>Import project</button>
          <div className="posts-menu-divider"/>
          <a href={`/templates/${project.template}.af`} download>Download Affinity master</a>
          <a href={`/templates/${project.template}.svg`} download>Download master SVG</a>
          <p>Projects and photos stay on this device.</p>
        </div></details>
        <button type="button" aria-label="Save project" onClick={() => void saveProject()}>Save</button>
        <button className="posts-primary" type="button" disabled={loading} onClick={() => void downloadPng()}>Export PNG</button>
      </div>
      <input ref={projectUpload} aria-label="Import Posts project JSON" type="file" accept="application/json,.json" hidden onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void importProject(file); }} />
    </header>
    {notice && <div className={`posts-notice ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}><span>{notice.text}</span><button type="button" aria-label="Dismiss" onClick={() => setNotice(null)}><X size={14} /></button></div>}
    <main className="posts-editor-grid">
      <div className="posts-canvas-column">
        <div className="posts-preview-wrap"><div className={`posts-canvas-frame ${project.format}`} style={{'--canvas-ratio':dimensions.width/dimensions.height} as CSSProperties}><canvas ref={canvasRef} aria-label="Posts canvas preview" /></div></div>
        <div className="posts-template-tray"><div className="posts-tray-title">Templates<small>{dimensions.width} × {dimensions.height}</small></div><div className="posts-template-list"><TemplateThumbnail template="new-arrivals" selected={project.template === 'new-arrivals'} onClick={() => update('template', 'new-arrivals')} /><TemplateThumbnail template="featured-card" selected={project.template === 'featured-card'} onClick={() => update('template', 'featured-card')} /></div><span className="posts-tray-hint">Choose a starting point</span></div>
      </div>
        <aside className="posts-inspector">
          <details className="posts-inspector-section" open><summary>Content</summary><div className="posts-section-body">
            <Field label="Headline" value={project.headline} maxLength={90} placeholder="CARD TITLE" onChange={(value) => update('headline', value)} />
            <Field label="Details" value={project.details} maxLength={140} placeholder="SET · YEAR · CARD NO." onChange={(value) => update('details', value)} />
            <Field label="Price" value={project.price} maxLength={40} placeholder="Optional" onChange={(value) => update('price', value)} />
            <Field label="CTA" value={project.cta} maxLength={40} placeholder="VIEW THE CARD" onChange={(value) => update('cta', value)} />
            <Field label="Badge" value={project.badge} maxLength={32} placeholder="Optional" onChange={(value) => update('badge', value)} />
          </div></details>
          <details className="posts-inspector-section" open><summary>Card</summary><div className="posts-section-body">
            <input ref={imageUpload} aria-label="Import card photo" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void handleImage(file); }} />
            <button type="button" className="posts-upload-button" aria-label={project.image ? 'Replace card photo' : 'Add card photo'} onClick={() => imageUpload.current?.click()}><ImagePlus size={16} /><span><strong>{project.image ? 'Replace card photo' : 'Add card photo'}</strong><small>JPEG, PNG, or WebP · contain fit</small></span></button>
            <label className="posts-range"><span>Scale<output>{project.imageScale.toFixed(2)}×</output></span><input type="range" min="0.65" max="1.2" step="0.01" value={project.imageScale} onChange={(event) => update('imageScale', Number(event.target.value))} /></label>
            {project.imageScale > 1 && <p className="posts-warning">Above 1× trims the outer edges of the photo.</p>}
            <label className="posts-range"><span>Horizontal position<output>{Math.round(project.imageX * 100)}%</output></span><input type="range" min="-1" max="1" step="0.01" value={project.imageX} onChange={(event) => update('imageX', Number(event.target.value))} /></label>
            <label className="posts-range"><span>Vertical position<output>{Math.round(project.imageY * 100)}%</output></span><input type="range" min="-1" max="1" step="0.01" value={project.imageY} onChange={(event) => update('imageY', Number(event.target.value))} /></label>
            <button className="posts-text-button" type="button" onClick={() => { update('imageScale', 1); update('imageX', 0); update('imageY', 0); }}><RotateCcw size={13} />Reset photo placement</button>
          </div></details>
          <details className="posts-inspector-section"><summary>Background</summary><div className="posts-section-body">
            <input ref={backgroundUpload} aria-label="Import custom PNG background" type="file" accept="image/png" hidden onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void handleBackground(file); }} />
            <div className="posts-background-actions"><button type="button" onClick={() => backgroundUpload.current?.click()}><ImagePlus size={14} />Custom PNG</button>{project.customBackground && <button type="button" onClick={resetBackground}><RotateCcw size={14} />Reset</button>}</div>
            <p className="posts-helper">In Affinity, hide the Copy, Photo, and Brand groups and export a PNG. Import it here; keep the same canvas ratio for the best match.</p>
          </div></details>
          <details className="posts-inspector-section" open><summary>Format</summary><div className="posts-section-body">
            <div className="posts-segmented">{(['portrait', 'square', 'vertical'] as PostsFormat[]).map((format) => <button type="button" aria-pressed={project.format===format} className={project.format === format ? 'active' : ''} key={format} onClick={() => update('format', format)}>{format === 'portrait' ? '4:5' : format === 'square' ? '1:1' : '9:16'}</button>)}</div>
            <p className="posts-helper">{dimensions.width} × {dimensions.height} · PNG</p>
          </div></details>
        </aside>
    </main>
    {loading && <div className="posts-loading"><LoaderCircle size={18} className="posts-spin" />Loading local studio</div>}
  </section>;
}
