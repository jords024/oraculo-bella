import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { customFetch } from '../../utils/customFetch';
import { CANVAS_HEIGHT, CANVAS_WIDTH, cloneDocument, createEditableSlideDocument, createSlideDocument } from './slideDocument';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const makeId = type => `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const filenameOf = slide => typeof slide === 'string' ? slide : slide?.filename;
const withoutToken = source => String(source || '').replace(/([?&])token=[^&]+/i, '$1').replace(/[?&]$/, '');
const withToken = source => {
  if (!source || !source.startsWith('/api/') || /[?&]token=/.test(source)) return source;
  const token = encodeURIComponent(localStorage.getItem('fo_token') || '');
  return `${source}${source.includes('?') ? '&' : '?'}token=${token}`;
};
const visualFilter = element => `blur(${Number(element.blur) || 0}px) brightness(${Number(element.brightness) || 100}%) contrast(${Number(element.contrast) || 100}%) saturate(${Number(element.saturation) || 100}%)`;

function IconButton({ label, children, disabled, onClick }) {
  return <button type="button" className="studio-icon-button" aria-label={label} title={label} disabled={disabled} onClick={onClick}>{children}</button>;
}

function ElementView({ element, layerIndex, selected, scale, onSelect, onChange, onBegin }) {
  const pointerStart = (event, mode) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(element.id);
    if (element.locked) return;
    onBegin();
    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    };
    const move = moveEvent => {
      const dx = (moveEvent.clientX - start.pointerX) / scale;
      const dy = (moveEvent.clientY - start.pointerY) / scale;
      const patch = mode === 'move'
        ? {
          x: clamp(Math.round(start.x + dx), 0, Math.max(0, CANVAS_WIDTH - start.width)),
          y: clamp(Math.round(start.y + dy), 0, Math.max(0, CANVAS_HEIGHT - start.height))
        }
        : {
          width: clamp(Math.round(start.width + dx), 40, Math.max(40, CANVAS_WIDTH - start.x)),
          height: clamp(Math.round(start.height + dy), 24, Math.max(24, CANVAS_HEIGHT - start.y))
        };
      onChange(element.id, patch, false);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  if (!element.visible) return null;
  return (
    <div className={`studio-element ${selected ? 'selected' : ''} ${element.locked ? 'locked' : ''}`} data-name={element.name}
      style={{ position: 'absolute', left: element.x, top: element.y, width: element.width, height: element.height, opacity: element.opacity ?? 1, transform: `rotate(${element.rotation || 0}deg)`, transformOrigin: 'center', cursor: element.locked ? 'default' : 'move', zIndex: layerIndex + 1 }}
      onPointerDown={event => pointerStart(event, 'move')} onClick={event => { event.stopPropagation(); onSelect(element.id); }}>
      {element.type === 'image' && <img src={withToken(element.src)} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: element.fit || 'cover', pointerEvents: 'none', filter: visualFilter(element) }} />}
      {element.type === 'shape' && <div style={{ width: '100%', height: '100%', background: element.fill, border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : 'none', borderRadius: element.radius || 0, filter: visualFilter(element) }} />}
      {element.type === 'text' && <div className="studio-text-element" contentEditable={!element.locked} suppressContentEditableWarning spellCheck
        onPointerDown={event => document.activeElement === event.currentTarget ? event.stopPropagation() : pointerStart(event, 'move')}
        onDoubleClick={event => { event.stopPropagation(); event.currentTarget.focus(); }}
        onBlur={event => onChange(element.id, { content: event.currentTarget.innerText })}
        style={{ fontFamily: element.fontFamily, fontSize: element.fontSize, fontWeight: element.fontWeight, fontStyle: element.fontStyle, lineHeight: element.lineHeight, letterSpacing: element.letterSpacing, color: element.color, textAlign: element.align, width: '100%', height: '100%', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{element.content}</div>}
      {selected && !element.locked && <button type="button" aria-label="Redimensionar elemento" className="studio-resize-handle" onPointerDown={event => pointerStart(event, 'resize')} />}
    </div>
  );
}

const loadCanvasImage = source => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Não foi possível carregar uma imagem da composição.'));
  image.src = withToken(source);
});

const wrapCanvasText = (context, text, maxWidth) => {
  const lines = [];
  String(text || '').split('\n').forEach(paragraph => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(''); return; }
    let line = words.shift();
    words.forEach(word => {
      const candidate = `${line} ${word}`;
      if (context.measureText(candidate).width <= maxWidth) line = candidate;
      else { lines.push(line); line = word; }
    });
    lines.push(line);
  });
  return lines;
};

async function renderDocument(documentState) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext('2d');
  context.fillStyle = documentState.background || '#2d241f';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (const element of documentState.elements) {
    if (!element.visible) continue;
    context.save();
    context.globalAlpha = element.opacity ?? 1;
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    context.translate(centerX, centerY);
    context.rotate(((element.rotation || 0) * Math.PI) / 180);
    context.translate(-centerX, -centerY);
    context.filter = visualFilter(element);
    if (element.type === 'shape') {
      context.fillStyle = element.fill || '#fff';
      context.beginPath();
      context.roundRect(element.x, element.y, element.width, element.height, Math.min(Number(element.radius) || 0, element.width / 2, element.height / 2));
      context.fill();
      if (element.stroke && element.strokeWidth) { context.strokeStyle = element.stroke; context.lineWidth = element.strokeWidth; context.strokeRect(element.x, element.y, element.width, element.height); }
    } else if (element.type === 'image' && element.src) {
      const image = await loadCanvasImage(element.src);
      if ((element.fit || 'cover') === 'contain') {
        const ratio = Math.min(element.width / image.width, element.height / image.height);
        const width = image.width * ratio;
        const height = image.height * ratio;
        context.drawImage(image, element.x + (element.width - width) / 2, element.y + (element.height - height) / 2, width, height);
      } else {
        const ratio = Math.max(element.width / image.width, element.height / image.height);
        const sourceWidth = element.width / ratio;
        const sourceHeight = element.height / ratio;
        context.drawImage(image, (image.width - sourceWidth) / 2, (image.height - sourceHeight) / 2, sourceWidth, sourceHeight, element.x, element.y, element.width, element.height);
      }
    } else if (element.type === 'text') {
      const size = Number(element.fontSize) || 40;
      context.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 400} ${size}px ${element.fontFamily || 'Arial'}`;
      context.fillStyle = element.color || '#fff';
      context.textBaseline = 'top';
      context.textAlign = element.align || 'left';
      const x = element.align === 'center' ? element.x + element.width / 2 : element.align === 'right' ? element.x + element.width : element.x;
      const lineHeight = size * (Number(element.lineHeight) || 1.2);
      wrapCanvasText(context, element.content, element.width).forEach((line, index) => { if (index * lineHeight < element.height) context.fillText(line, x, element.y + index * lineHeight); });
    }
    context.restore();
  }
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.94));
}

export default function SlideStudio({ carouselId, slides = [], initialFilename, cacheBuster, onActivatePage, onClose, onSaved, onRegenerate, showToast }) {
  const filenames = useMemo(() => slides.map(filenameOf).filter(Boolean), [slides]);
  const slideKey = filenames.join('|');
  const [pages, setPages] = useState([]);
  const [documents, setDocuments] = useState({});
  const [activeFilename, setActiveFilename] = useState(initialFilename || filenames[0] || '');
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [dirty, setDirty] = useState(() => new Set());
  const [panel, setPanel] = useState('design');
  const [zoom, setZoom] = useState(38);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const documentsRef = useRef(documents);
  const showToastRef = useRef(showToast);
  const pageRefs = useRef({});
  const uploadRef = useRef(null);

  useEffect(() => { documentsRef.current = documents; }, [documents]);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const token = encodeURIComponent(localStorage.getItem('fo_token') || '');
      const pageFilenames = slideKey.split('|').filter(Boolean);
      try {
        const loaded = await Promise.all(pageFilenames.map(async pageFilename => {
          const response = await customFetch(`/api/carousels/${carouselId}/slide/${pageFilename}/meta`);
          const meta = response.ok ? await response.json() : {};
          const suffix = `token=${token}&t=${cacheBuster || Date.now()}`;
          const imageUrl = `/api/carousels/${carouselId}/image/${pageFilename}?${suffix}`;
          const rawImageUrl = `/api/carousels/${carouselId}/image/${pageFilename.replace(/^slide-/, 'raw-')}?${suffix}`;
          return { filename: pageFilename, meta, imageUrl, rawImageUrl };
        }));
        if (cancelled) return;
        setPages(loaded);
        setDocuments(Object.fromEntries(loaded.map(page => [page.filename, createSlideDocument(page.meta, page.rawImageUrl, page.imageUrl)])));
        setActiveFilename(current => pageFilenames.includes(current) ? current : (initialFilename || pageFilenames[0] || ''));
        setDirty(new Set()); setHistory([]); setFuture([]);
      } catch (error) { showToastRef.current?.(error.message || 'Não foi possível abrir o documento.', 'error'); }
      finally { if (!cancelled) setLoading(false); }
    };
    if (carouselId && slideKey) load();
    return () => { cancelled = true; };
  }, [carouselId, slideKey, cacheBuster, initialFilename]);

  useEffect(() => { if (initialFilename && documents[initialFilename]) setActiveFilename(initialFilename); }, [initialFilename, documents]);
  useEffect(() => {
    if (panel !== 'images' || library.length || libraryLoading) return;
    setLibraryLoading(true);
    customFetch('/api/library?sort=date_desc').then(response => response.json()).then(data => setLibrary(data.images || []))
      .catch(() => showToast?.('Não foi possível carregar a biblioteca.', 'error')).finally(() => setLibraryLoading(false));
  }, [panel, library.length, libraryLoading, showToast]);

  const activeDocument = documents[activeFilename];
  const activePage = pages.find(page => page.filename === activeFilename);
  const selected = activeDocument?.elements.find(element => element.id === selectedId);
  const scale = zoom / 100;
  const activatePage = useCallback(pageFilename => { setActiveFilename(pageFilename); setSelectedId(null); onActivatePage?.(pageFilename); }, [onActivatePage]);
  const commitSnapshot = useCallback(() => { setHistory(items => [...items.slice(-39), cloneDocument(documentsRef.current)]); setFuture([]); }, []);
  const markDirty = pageFilename => setDirty(current => new Set([...current, pageFilename]));
  const updateDocument = useCallback((pageFilename, updater, commit = true) => {
    if (commit) commitSnapshot();
    setDocuments(current => ({ ...current, [pageFilename]: updater(current[pageFilename]) }));
    setDirty(current => new Set([...current, pageFilename]));
  }, [commitSnapshot]);
  const updateElement = useCallback((pageFilename, id, patch, commit = true) => updateDocument(pageFilename, current => ({ ...current, elements: current.elements.map(element => element.id === id ? { ...element, ...patch } : element) }), commit), [updateDocument]);
  const undo = useCallback(() => setHistory(items => {
    if (!items.length) return items;
    const previous = items[items.length - 1];
    setFuture(next => [cloneDocument(documentsRef.current), ...next].slice(0, 40)); setDocuments(previous); setDirty(new Set(Object.keys(previous)));
    return items.slice(0, -1);
  }), []);
  const redo = useCallback(() => setFuture(items => {
    if (!items.length) return items;
    const next = items[0]; setHistory(previous => [...previous, cloneDocument(documentsRef.current)].slice(-40)); setDocuments(next); setDirty(new Set(Object.keys(next)));
    return items.slice(1);
  }), []);
  const removeSelected = useCallback(() => {
    if (!selected || selected.locked) return;
    updateDocument(activeFilename, current => ({ ...current, elements: current.elements.filter(element => element.id !== selectedId) })); setSelectedId(null);
  }, [activeFilename, selected, selectedId, updateDocument]);

  useEffect(() => {
    const keydown = event => {
      const editing = event.target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return; }
      if (editing || !selected) return;
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); removeSelected(); return; }
      const step = event.shiftKey ? 10 : 1;
      const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
      if (delta && !selected.locked) { event.preventDefault(); updateElement(activeFilename, selectedId, { x: selected.x + delta[0], y: selected.y + delta[1] }); }
    };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, [activeFilename, redo, removeSelected, selected, selectedId, undo, updateElement]);

  const addText = () => {
    if (!activeDocument) return;
    const id = makeId('text');
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, { id, type: 'text', name: 'Novo texto', content: 'Digite seu texto', x: 150, y: 560, width: 780, height: 150, rotation: 0, opacity: 1, locked: false, visible: true, fontFamily: 'Georgia, serif', fontSize: 58, fontWeight: 500, fontStyle: 'normal', lineHeight: 1.02, letterSpacing: -1, color: '#ffffff', align: 'center' }] }));
    setSelectedId(id); setPanel('design');
  };
  const addShape = (kind = 'rectangle') => {
    if (!activeDocument) return;
    const id = makeId('shape');
    const variants = {
      rectangle: { name: 'Retângulo', x: 240, y: 540, width: 600, height: 180, fill: '#b96642', radius: 0, opacity: .9, blur: 0 },
      circle: { name: 'Círculo', x: 410, y: 520, width: 260, height: 260, fill: '#b96642', radius: 999, opacity: .9, blur: 0 },
      line: { name: 'Linha', x: 240, y: 665, width: 600, height: 8, fill: '#f4efe5', radius: 8, opacity: .9, blur: 0 },
      veil: { name: 'Véu de contraste', x: 115, y: 430, width: 850, height: 390, fill: '#17110e', radius: 54, opacity: .58, blur: 22 }
    };
    const shape = variants[kind] || variants.rectangle;
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, { id, type: 'shape', ...shape, rotation: 0, locked: false, visible: true, stroke: '', strokeWidth: 0 }] }));
    setSelectedId(id); setPanel('design');
  };
  const insertImage = (source, asBackground = false) => {
    if (!source || !activeDocument) return;
    const cleanSource = withoutToken(source);
    if (asBackground) {
      const background = activeDocument.elements.find(element => element.id === 'background');
      if (background) updateElement(activeFilename, background.id, { src: cleanSource, visible: true });
      else updateDocument(activeFilename, current => ({ ...current, elements: [{ id: 'background', type: 'image', name: 'Imagem de fundo', src: cleanSource, x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, rotation: 0, opacity: 1, locked: true, visible: true, fit: 'cover' }, ...current.elements] }));
      setSelectedId('background'); return;
    }
    if (selected?.type === 'image') { updateElement(activeFilename, selected.id, { src: cleanSource, visible: true }); return; }
    const id = makeId('image');
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, { id, type: 'image', name: 'Imagem', src: cleanSource, x: 190, y: 360, width: 700, height: 620, rotation: 0, opacity: 1, locked: false, visible: true, fit: 'cover' }] }));
    setSelectedId(id);
  };
  const convertLegacy = () => {
    if (!activePage) return;
    commitSnapshot(); setDocuments(current => ({ ...current, [activeFilename]: createEditableSlideDocument(activePage.meta, activePage.rawImageUrl) })); markDirty(activeFilename); setSelectedId('title');
    showToast?.('Lâmina convertida. Revise a composição antes de salvar.', 'success');
  };
  const moveLayer = direction => {
    if (!selected || selected.locked) return;
    updateDocument(activeFilename, current => {
      const elements = [...current.elements]; const index = elements.findIndex(element => element.id === selectedId); const target = clamp(index + direction, 0, elements.length - 1);
      if (index === target) return current; const [item] = elements.splice(index, 1); elements.splice(target, 0, item); return { ...current, elements };
    });
  };
  const uploadImages = async event => {
    const files = [...(event.target.files || [])]; if (!files.length) return; setUploading(true);
    try {
      const body = new FormData(); files.forEach(file => body.append('files', file)); body.append('category', 'Bella — Estúdio');
      const response = await customFetch('/api/library/upload', { method: 'POST', body }); const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Falha no upload');
      setLibrary(current => [...data.images, ...current]); insertImage(data.images[0]?.url); showToast?.('Imagem adicionada à arte e à biblioteca.', 'success');
    } catch (error) { showToast?.(error.message || 'Não foi possível enviar a imagem.', 'error'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  const generateImage = async () => {
    if (!imagePrompt.trim()) return; setGeneratingImage(true);
    try {
      const response = await customFetch('/api/library/chat/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `${imagePrompt.trim()}. Vertical editorial image for a 4:5 Instagram carousel. No words, no letters, no typography, no logo.`, referenceIds: [], messages: [] }) });
      const data = await response.json(); if (!response.ok || !data.ok) throw new Error(data.error || 'Falha na geração');
      insertImage(data.generatedItem?.imageUrl); setImagePrompt(''); showToast?.(`Imagem gerada (${data.generatedItem?.costFormatted || 'custo registrado'}).`, 'success');
    } catch (error) { showToast?.(error.message || 'Não foi possível gerar a imagem.', 'error'); }
    finally { setGeneratingImage(false); }
  };
  const saveAll = async () => {
    const names = [...dirty]; if (!names.length) return; setSaving(true);
    try {
      for (const pageFilename of names) {
        const design = documentsRef.current[pageFilename]; const rendered = await renderDocument(design);
        const designResponse = await customFetch(`/api/carousels/${carouselId}/slide/${pageFilename}/design`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ design }) });
        const designData = await designResponse.json(); if (!designResponse.ok || !designData.ok) throw new Error(designData.error || 'Falha ao salvar camadas');
        const renderBody = new FormData(); renderBody.append('file', rendered, pageFilename);
        const renderResponse = await customFetch(`/api/carousels/${carouselId}/slide/${pageFilename}/render`, { method: 'PUT', body: renderBody });
        if (!renderResponse.ok) { const renderData = await renderResponse.json().catch(() => ({})); throw new Error(renderData.error || 'Falha ao atualizar a imagem final'); }
      }
      setDirty(new Set()); setPages(current => current.map(page => ({ ...page, imageUrl: `${page.imageUrl.split('&t=')[0]}&t=${Date.now()}` })));
      onSaved?.(); showToast?.(`${names.length} lâmina${names.length > 1 ? 's' : ''} salva${names.length > 1 ? 's' : ''} com todas as camadas.`, 'success');
    } catch (error) { showToast?.(error.message || 'Não foi possível salvar o documento.', 'error'); }
    finally { setSaving(false); }
  };
  const scrollToPage = pageFilename => { activatePage(pageFilename); pageRefs.current[pageFilename]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  if (loading) return <div className="slide-studio studio-loading">Preparando todas as lâminas…</div>;
  return (
    <div className="slide-studio" role="dialog" aria-modal="true" aria-label="Editor visual do carrossel">
      <header className="studio-topbar">
        <div className="studio-brand"><button type="button" className="studio-back" onClick={onClose}>←</button><div><strong>Estúdio de criação</strong><span>{pages.length} lâminas no mesmo documento</span></div></div>
        <div className="studio-history-actions"><IconButton label="Desfazer" disabled={!history.length} onClick={undo}>↶</IconButton><IconButton label="Refazer" disabled={!future.length} onClick={redo}>↷</IconButton><span className="studio-save-state">{dirty.size ? `${dirty.size} com alterações` : 'Tudo salvo'}</span></div>
        <div className="studio-primary-actions"><button type="button" className="studio-secondary-button" onClick={() => onRegenerate?.(activeFilename)}>✦ Nova imagem</button><button type="button" className="studio-save-button" disabled={saving || !dirty.size} onClick={saveAll}>{saving ? 'Salvando…' : 'Salvar carrossel'}</button></div>
      </header>
      <div className="studio-main">
        <aside className="studio-tools" aria-label="Ferramentas">
          <button type="button" className={panel === 'design' ? 'active' : ''} onClick={() => setPanel('design')}><span>◆</span>Editar</button>
          <button type="button" className={panel === 'images' ? 'active' : ''} onClick={() => setPanel('images')}><span>▧</span>Imagens</button>
          <button type="button" onClick={addText}><span>T</span>Texto</button><button type="button" className={panel === 'shapes' ? 'active' : ''} onClick={() => setPanel('shapes')}><span>□</span>Formas</button>
          <button type="button" className={panel === 'layers' ? 'active' : ''} onClick={() => setPanel('layers')}><span>▱</span>Camadas</button>
        </aside>
        <aside className="studio-panel">
          {panel === 'images' ? <div className="studio-images-panel">
            <div className="studio-panel-heading"><div><span>Recursos</span><strong>Imagens</strong></div></div>
            <div className="studio-image-actions"><input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={uploadImages} /><button type="button" onClick={() => uploadRef.current?.click()} disabled={uploading}>{uploading ? 'Enviando…' : '↑ Enviar imagem'}</button><small>Selecione uma imagem na arte para substituí-la.</small></div>
            <div className="studio-generator"><label>Gerador do Oráculo<textarea value={imagePrompt} onChange={event => setImagePrompt(event.target.value)} placeholder="Descreva a cena, emoção e metáfora visual…" /></label><button type="button" onClick={generateImage} disabled={generatingImage || !imagePrompt.trim()}>{generatingImage ? 'Criando imagem…' : '✦ Gerar sem texto'}</button></div>
            <div className="studio-library-grid">{libraryLoading ? <span className="studio-muted">Carregando biblioteca…</span> : library.slice(0, 30).map(item => <article key={item.id} className="studio-library-item"><img src={withToken(item.url)} alt={item.title || 'Imagem da biblioteca'} /><div><button type="button" onClick={() => insertImage(item.url)}>Adicionar</button><button type="button" onClick={() => insertImage(item.url, true)}>Fundo</button></div></article>)}</div>
          </div> : panel === 'shapes' ? <><div className="studio-panel-heading"><div><span>Elementos</span><strong>Formas e efeitos</strong></div></div><div className="studio-shape-grid"><button type="button" onClick={() => addShape('rectangle')}><i className="shape-preview rectangle" />Retângulo</button><button type="button" onClick={() => addShape('circle')}><i className="shape-preview circle" />Círculo</button><button type="button" onClick={() => addShape('line')}><i className="shape-preview line" />Linha</button><button type="button" onClick={() => addShape('veil')}><i className="shape-preview veil" />Véu com blur</button></div><div className="studio-info-card">O véu cria contraste suave atrás da copy sem aparência de caixa improvisada. Todos os elementos continuam editáveis.</div></> : panel === 'layers' ? <><div className="studio-panel-heading"><div><span>{activeFilename}</span><strong>Camadas</strong></div></div><div className="studio-layer-list">{[...(activeDocument?.elements || [])].reverse().map(element => <button type="button" key={element.id} className={`studio-layer ${selectedId === element.id ? 'selected' : ''}`} onClick={() => setSelectedId(element.id)}><span>{element.type === 'text' ? 'T' : element.type === 'image' ? '▧' : '□'}</span><strong>{element.name}</strong><small>{element.visible ? '◉' : '○'} {element.locked ? '⌑' : ''}</small></button>)}</div></> : <>
            <div className="studio-panel-heading"><div><span>{activeFilename}</span><strong>{selected?.name || 'Selecione um elemento'}</strong></div></div>
            {activeDocument?.legacyFlattened && !selected ? <div className="studio-legacy-card"><strong>Arte antiga preservada</strong><p>Ela foi criada como uma imagem única. Converta somente se quiser reconstruir título, texto e assinatura como camadas.</p><button type="button" onClick={convertLegacy}>Converter em camadas</button></div> : selected ? <div className="studio-inspector">
              {selected.type === 'text' && <><label>Conteúdo<textarea value={selected.content} onChange={event => updateElement(activeFilename, selected.id, { content: event.target.value })} /></label><label>Fonte<select value={selected.fontFamily} onChange={event => updateElement(activeFilename, selected.id, { fontFamily: event.target.value })}><option value="Georgia, serif">Editorial serifada</option><option value="Arial, sans-serif">Moderna sem serifa</option><option value="'Times New Roman', serif">Clássica</option></select></label><div className="studio-field-row"><label>Tamanho<input type="number" value={selected.fontSize} min="10" max="240" onChange={event => updateElement(activeFilename, selected.id, { fontSize: Number(event.target.value) })} /></label><label>Entrelinha<input type="number" step="0.05" value={selected.lineHeight} min="0.7" max="2" onChange={event => updateElement(activeFilename, selected.id, { lineHeight: Number(event.target.value) })} /></label></div><div className="studio-field-row"><label>Cor<input type="color" value={selected.color} onChange={event => updateElement(activeFilename, selected.id, { color: event.target.value })} /></label><label>Alinhamento<select value={selected.align} onChange={event => updateElement(activeFilename, selected.id, { align: event.target.value })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label></div></>}
              {selected.type === 'shape' && <><label>Cor da forma<input type="color" value={selected.fill} onChange={event => updateElement(activeFilename, selected.id, { fill: event.target.value })} /></label><label>Cantos<input type="range" min="0" max="540" value={selected.radius || 0} onChange={event => updateElement(activeFilename, selected.id, { radius: Number(event.target.value) })} /></label><label>Desfoque<input type="range" min="0" max="50" value={selected.blur || 0} onChange={event => updateElement(activeFilename, selected.id, { blur: Number(event.target.value) })} /></label></>}
              {selected.type === 'image' && <><label>Encaixe<select value={selected.fit || 'cover'} onChange={event => updateElement(activeFilename, selected.id, { fit: event.target.value })}><option value="cover">Preencher</option><option value="contain">Mostrar inteira</option></select></label><label>Desfoque<input type="range" min="0" max="40" value={selected.blur || 0} onChange={event => updateElement(activeFilename, selected.id, { blur: Number(event.target.value) })} /></label><div className="studio-field-row"><label>Contraste<input type="range" min="50" max="160" value={selected.contrast || 100} onChange={event => updateElement(activeFilename, selected.id, { contrast: Number(event.target.value) })} /></label><label>Saturação<input type="range" min="0" max="180" value={selected.saturation || 100} onChange={event => updateElement(activeFilename, selected.id, { saturation: Number(event.target.value) })} /></label></div><button type="button" className="studio-wide-action" onClick={() => setPanel('images')}>Substituir imagem</button></>}
              <div className="studio-field-row"><label>Opacidade<input type="range" min="0" max="1" step="0.05" value={selected.opacity ?? 1} onChange={event => updateElement(activeFilename, selected.id, { opacity: Number(event.target.value) })} /></label><label>Rotação<input type="number" min="-180" max="180" value={selected.rotation || 0} onChange={event => updateElement(activeFilename, selected.id, { rotation: Number(event.target.value) })} /></label></div>
              <div className="studio-inline-actions"><button type="button" onClick={() => updateElement(activeFilename, selected.id, { locked: !selected.locked })}>{selected.locked ? 'Desbloquear' : 'Bloquear'}</button><button type="button" onClick={() => updateElement(activeFilename, selected.id, { visible: !selected.visible })}>{selected.visible ? 'Ocultar' : 'Mostrar'}</button></div><div className="studio-inline-actions"><button type="button" onClick={() => moveLayer(-1)}>Para trás</button><button type="button" onClick={() => moveLayer(1)}>Para frente</button></div>{!selected.locked && <button type="button" className="studio-delete-action" onClick={removeSelected}>Remover elemento</button>}
            </div> : <div className="studio-empty-state">Clique em qualquer texto, imagem ou forma. Selecionar nunca altera o design.</div>}
          </>}
        </aside>
        <main className="studio-workspace" onPointerDown={() => setSelectedId(null)}><div className="studio-pages-column">{pages.map((page, index) => {
          const pageDocument = documents[page.filename]; if (!pageDocument) return null;
          return <section key={page.filename} ref={node => { pageRefs.current[page.filename] = node; }} className={`studio-page-block ${activeFilename === page.filename ? 'active' : ''}`} onPointerDown={() => activatePage(page.filename)}><div className="studio-page-label"><span>Página {index + 1}</span><small>{dirty.has(page.filename) ? 'Alterada' : 'Salva'}</small></div><div className="studio-canvas-frame" style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}><div className="studio-canvas" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})`, background: pageDocument.background }} onPointerDown={event => { event.stopPropagation(); activatePage(page.filename); }}>{pageDocument.elements.map((element, layerIndex) => <ElementView key={element.id} element={element} layerIndex={layerIndex} selected={activeFilename === page.filename && selectedId === element.id} scale={scale} onSelect={id => { setActiveFilename(page.filename); setSelectedId(id); onActivatePage?.(page.filename); }} onChange={(id, patchValue, commit) => updateElement(page.filename, id, patchValue, commit)} onBegin={commitSnapshot} />)}</div></div></section>;
        })}</div><div className="studio-zoom"><button type="button" onClick={() => setZoom(value => clamp(value - 5, 20, 65))}>−</button><span>{zoom}%</span><button type="button" onClick={() => setZoom(value => clamp(value + 5, 20, 65))}>+</button></div></main>
      </div>
      <footer className="studio-pages"><div className="studio-page-strip">{pages.map((page, index) => <button type="button" key={page.filename} className={`studio-page-thumb ${activeFilename === page.filename ? 'active' : ''}`} onClick={() => scrollToPage(page.filename)}><img src={page.imageUrl} alt={`Lâmina ${index + 1}`} /><span>{index + 1}</span></button>)}</div><span className="studio-tip">Clique seleciona · duplo clique edita · Delete remove · Shift + seta move 10 px</span></footer>
    </div>
  );
}
