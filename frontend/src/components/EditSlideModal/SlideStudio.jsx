import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { customFetch } from '../../utils/customFetch';
import { CANVAS_HEIGHT, CANVAS_WIDTH, cloneDocument, createEditableSlideDocument, createSlideDocument } from './slideDocument';
import {
  alignElements, boundsOf, clampMove, cloneWithNewGroups, distributeElements, expandToGroups, groupElements, groupHue,
  groupMembers, isPickable, normalizeRect, pickInRect, renameGroup, scaleElements, snapMove, ungroupElements
} from './studioSelection';

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
const normalizeSearch = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const shapeBackground = element => {
  if (!element.gradient?.stops?.length) return element.fill || '#ffffff';
  const stops = element.gradient.stops.map(stop => `${stop.color} ${stop.at}%`).join(', ');
  if (element.gradient.type === 'radial') return `radial-gradient(circle at center, ${stops})`;
  const direction = element.gradient.direction === 'horizontal' ? 'to right' : element.gradient.direction === 'up' ? 'to top' : 'to bottom';
  return `linear-gradient(${direction}, ${stops})`;
};
const canvasShapeFill = (context, element) => {
  if (!element.gradient?.stops?.length) return element.fill || '#ffffff';
  let gradient;
  if (element.gradient.type === 'radial') {
    const radius = Math.max(element.width, element.height) / 2;
    gradient = context.createRadialGradient(element.x + element.width / 2, element.y + element.height / 2, 0, element.x + element.width / 2, element.y + element.height / 2, radius);
  } else if (element.gradient.direction === 'horizontal') gradient = context.createLinearGradient(element.x, element.y, element.x + element.width, element.y);
  else if (element.gradient.direction === 'up') gradient = context.createLinearGradient(element.x, element.y + element.height, element.x, element.y);
  else gradient = context.createLinearGradient(element.x, element.y, element.x, element.y + element.height);
  element.gradient.stops.forEach(stop => gradient.addColorStop(clamp(Number(stop.at) / 100, 0, 1), stop.color));
  return gradient;
};
const FONT_OPTIONS = [
  { value: "'Bodoni Moda', 'Playfair Display', Georgia, serif", label: 'Bodoni Moda' },
  { value: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", label: 'Cormorant Garamond' },
  { value: "'Playfair Display', Georgia, serif", label: 'Playfair Display' },
  { value: "'Fraunces', 'Playfair Display', Georgia, serif", label: 'Fraunces' },
  { value: "'Prata', 'Bodoni Moda', Georgia, serif", label: 'Prata' },
  { value: "'Libre Baskerville', Georgia, serif", label: 'Libre Baskerville' },
  { value: "'Lora', Georgia, serif", label: 'Lora' },
  { value: "'Inter', Arial, sans-serif", label: 'Inter' },
  { value: "'DM Sans', 'Inter', Arial, sans-serif", label: 'DM Sans' },
  { value: "'Manrope', 'Inter', Arial, sans-serif", label: 'Manrope' },
  { value: "'Oswald', Arial, sans-serif", label: 'Oswald' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' }
];
const ELEMENT_LIBRARY = [
  { kind: 'shadowSoft', label: 'Sombra suave', category: 'Sombras', preview: 'shadow-soft', keywords: 'sombra blur preto escuro fumaça contraste leitura' },
  { kind: 'shadowBottom', label: 'Sombra inferior', category: 'Sombras', preview: 'shadow-bottom', keywords: 'sombra degradê preto base rodapé texto contraste' },
  { kind: 'shadowTop', label: 'Sombra superior', category: 'Sombras', preview: 'shadow-top', keywords: 'sombra degradê preto topo cabeçalho título' },
  { kind: 'shadowLeft', label: 'Sombra lateral', category: 'Sombras', preview: 'shadow-left', keywords: 'sombra degradê preto esquerda lateral' },
  { kind: 'vignette', label: 'Vinheta escura', category: 'Sombras', preview: 'vignette', keywords: 'sombra vinheta bordas foco centro fotografia cinema' },
  { kind: 'shadowSpot', label: 'Sombra circular', category: 'Sombras', preview: 'shadow-spot', keywords: 'sombra blur preto mancha ponto circular suave' },
  { kind: 'rectangle', label: 'Retângulo', category: 'Essenciais', preview: 'rectangle', keywords: 'quadrado bloco forma fundo' },
  { kind: 'circle', label: 'Círculo', category: 'Essenciais', preview: 'circle', keywords: 'redondo esfera disco forma' },
  { kind: 'pill', label: 'Cápsula', category: 'Essenciais', preview: 'pill', keywords: 'etiqueta botão arredondado' },
  { kind: 'line', label: 'Linha horizontal', category: 'Essenciais', preview: 'line', keywords: 'traço divisor separador' },
  { kind: 'verticalLine', label: 'Linha vertical', category: 'Essenciais', preview: 'vertical-line', keywords: 'traço divisor separador' },
  { kind: 'paper', label: 'Papel marfim', category: 'Editorial', preview: 'paper' },
  { kind: 'frame', label: 'Moldura fina', category: 'Editorial', preview: 'frame' },
  { kind: 'photoMat', label: 'Passe-partout', category: 'Editorial', preview: 'photo-mat' },
  { kind: 'footerBand', label: 'Faixa editorial', category: 'Editorial', preview: 'footer-band' },
  { kind: 'highlight', label: 'Marca orgânica', category: 'Editorial', preview: 'highlight' },
  { kind: 'veil', label: 'Véu de contraste', category: 'Luz e atmosfera', preview: 'veil' },
  { kind: 'glow', label: 'Luz difusa', category: 'Luz e atmosfera', preview: 'glow' },
  { kind: 'outline', label: 'Aro editorial', category: 'Luz e atmosfera', preview: 'outline' },
  { kind: 'halo', label: 'Halo duplo', category: 'Composições', preview: 'halo', composition: true },
  { kind: 'ritualFrame', label: 'Moldura ritual', category: 'Composições', preview: 'ritual-frame', composition: true },
  { kind: 'constellation', label: 'Constelação', category: 'Composições', preview: 'constellation', composition: true }
];
const ALIGN_ACTIONS = [
  { mode: 'left', glyph: '⇤', label: 'Alinhar à esquerda' },
  { mode: 'center', glyph: '↔', label: 'Centralizar na horizontal' },
  { mode: 'right', glyph: '⇥', label: 'Alinhar à direita' },
  { mode: 'top', glyph: '⤒', label: 'Alinhar ao topo' },
  { mode: 'middle', glyph: '↕', label: 'Centralizar na vertical' },
  { mode: 'bottom', glyph: '⤓', label: 'Alinhar à base' }
];
const ELEMENT_CATEGORIES =['Tudo', 'Sombras', 'Essenciais', 'Editorial', 'Luz e atmosfera', 'Composições'];
const positionValue = value => Number.isFinite(Number(value)) ? Number(value) : 50;
const imagePosition = element => `${clamp(positionValue(element.focusX), 0, 100)}% ${clamp(positionValue(element.focusY), 0, 100)}%`;
const textureBackground = element => {
  const alpha = clamp(Number(element.intensity) || .14, .02, .8);
  const color = element.color || '#30261f';
  return {
    backgroundImage: `radial-gradient(circle, ${color} ${Math.max(1, alpha * 9)}%, transparent ${Math.max(2, alpha * 18)}%)`,
    backgroundSize: `${Math.max(3, 8 - alpha * 5)}px ${Math.max(3, 8 - alpha * 5)}px`,
    mixBlendMode: element.blendMode || 'multiply'
  };
};

const isSourceElement = element => element?.visible === false && element?.locked && String(element?.name || '').startsWith('Texto completo');
const boxesOverlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

// A ordem do array é a ordem de pintura: o fim da lista fica na frente. Nada vai para baixo do fundo.
// "forward/backward" pulam elementos invisíveis ou que não se tocam, para que cada clique mude de fato
// quem está na frente de quem; "swap-up/swap-down" andam um degrau entre os itens listados.
function reorderElements(elements, id, mode, ignore = null) {
  const index = elements.findIndex(element => element.id === id);
  if (index < 0 || id === 'background') return elements;
  const floor = elements[0]?.id === 'background' ? 1 : 0;
  const item = elements[index];
  let target = index;
  const find = (from, step, test) => { for (let j = from; j >= floor && j < elements.length; j += step) if (test(elements[j])) return j; return -1; };
  const ignored = other => ignore?.has(other.id);
  const touching = other => other.visible !== false && !isSourceElement(other) && !ignored(other) && boxesOverlap(item, other);
  if (mode === 'front') target = elements.length - 1;
  else if (mode === 'back') target = floor;
  else if (mode === 'forward') { const j = find(index + 1, 1, touching); target = j >= 0 ? j : index; }
  else if (mode === 'backward') { const j = find(index - 1, -1, touching); target = j >= 0 ? j : index; }
  else if (mode === 'swap-up') { const j = find(index + 1, 1, other => !isSourceElement(other)); target = j >= 0 ? j : index; }
  else if (mode === 'swap-down') { const j = find(index - 1, -1, other => !isSourceElement(other)); target = j >= 0 ? j : index; }
  else if (typeof mode === 'object' && mode) target = clamp(mode.to, floor, elements.length - 1);
  if (target === index) return elements;
  const next = [...elements];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

// Vários elementos (ou um grupo) mudam de camada juntos, sem perder a ordem entre eles.
function reorderMany(elements, ids, mode) {
  const picked = elements.filter(element => ids.includes(element.id) && element.id !== 'background');
  if (!picked.length) return elements;
  if (picked.length === 1) return reorderElements(elements, picked[0].id, mode);
  const pickedIds = new Set(picked.map(element => element.id));
  const floor = elements[0]?.id === 'background' ? 1 : 0;
  if (mode === 'front') return [...elements.filter(element => !pickedIds.has(element.id)), ...picked];
  if (mode === 'back') {
    const rest = elements.filter(element => !pickedIds.has(element.id));
    return [...rest.slice(0, floor), ...picked, ...rest.slice(floor)];
  }
  const forward = mode === 'forward';
  const order = [...picked].sort((a, b) => forward ? elements.indexOf(b) - elements.indexOf(a) : elements.indexOf(a) - elements.indexOf(b));
  return order.reduce((current, element) => reorderElements(current, element.id, mode, pickedIds), elements);
}

function SymbolLayer({ element }) {
  const color = element.color || '#f4efe5';
  const strokeWidth = Number(element.strokeWidth) || 4;
  const density = Math.max(3, Number(element.density) || 9);
  if (element.symbolKind === 'arc') return <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true"><path d="M 10 70 Q 45 5 92 54" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 100 20" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="2" x2="100" y2="2" stroke={color} strokeWidth={strokeWidth / 2} />{Array.from({ length: density + 1 }, (_, index) => { const x = (index / density) * 100; const h = index % 5 === 0 ? 17 : index % 2 === 0 ? 12 : 8; return <line key={index} x1={x} y1="2" x2={x} y2={h} stroke={color} strokeWidth={strokeWidth / 2} />; })}</svg>;
}

function IconButton({ label, children, disabled, onClick }) {
  return <button type="button" className="studio-icon-button" aria-label={label} title={label} disabled={disabled} onClick={onClick}>{children}</button>;
}

function ElementView({ element, layerIndex, selected, multi, scale, cropMode, onSelect, onMoveStart, onBackdropDown, onIsolate, onChange, onBegin, onToggleCrop }) {
  const [dragging, setDragging] = useState(false);
  const canPanImage = element.type === 'image' && (element.fit || 'cover') === 'cover';
  const pointerStart = (event, mode) => {
    event.preventDefault();
    event.stopPropagation();
    document.activeElement?.blur?.();
    const panImage = mode === 'move' && canPanImage && (cropMode || element.locked || element.id === 'background');
    // Fundo ainda não selecionado: arrastar sobre ele desenha o retângulo de seleção (clique simples seleciona o fundo).
    if (mode === 'move' && element.id === 'background' && !selected && !cropMode) { onBackdropDown(event, element.id); return; }
    // Mover (um elemento, vários ou um grupo) é tratado pelo editor, que conhece a seleção inteira.
    if (mode === 'move' && !panImage) { onMoveStart(event, element.id); return; }
    onSelect(element.id);
    if (element.locked && !panImage) return;
    onBegin();
    setDragging(true);
    const elementRect = event.currentTarget.closest('.studio-element')?.getBoundingClientRect();
    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: Number(element.rotation) || 0,
      centerClientX: elementRect ? elementRect.left + elementRect.width / 2 : event.clientX,
      centerClientY: elementRect ? elementRect.top + elementRect.height / 2 : event.clientY,
      focusX: positionValue(element.focusX),
      focusY: positionValue(element.focusY)
    };
    const move = moveEvent => {
      const dx = (moveEvent.clientX - start.pointerX) / scale;
      const dy = (moveEvent.clientY - start.pointerY) / scale;
      let patch;
      if (panImage) patch = {
          focusX: clamp(Math.round(start.focusX - (dx / Math.max(1, start.width)) * 100), 0, 100),
          focusY: clamp(Math.round(start.focusY - (dy / Math.max(1, start.height)) * 100), 0, 100)
        };
      else if (mode === 'move') {
        let x = Math.round(start.x + dx);
        let y = Math.round(start.y + dy);
        const centerX = x + start.width / 2;
        const centerY = y + start.height / 2;
        if (Math.abs(centerX - CANVAS_WIDTH / 2) < 14) x = Math.round((CANVAS_WIDTH - start.width) / 2);
        if (Math.abs(centerY - CANVAS_HEIGHT / 2) < 14) y = Math.round((CANVAS_HEIGHT - start.height) / 2);
        patch = { x: clamp(x, -start.width + 28, CANVAS_WIDTH - 28), y: clamp(y, -start.height + 28, CANVAS_HEIGHT - 28) };
      } else if (mode === 'rotate') {
        const startAngle = Math.atan2(start.pointerY - start.centerClientY, start.pointerX - start.centerClientX);
        const nextAngle = Math.atan2(moveEvent.clientY - start.centerClientY, moveEvent.clientX - start.centerClientX);
        patch = { rotation: Math.round(start.rotation + ((nextAngle - startAngle) * 180) / Math.PI) };
      } else {
        const west = mode.includes('w');
        const east = mode.includes('e');
        const north = mode.includes('n');
        const south = mode.includes('s');
        const changesWidth = west || east;
        const changesHeight = north || south;
        let width = changesWidth
          ? clamp(Math.round(start.width + (west ? -dx : dx)), 40, CANVAS_WIDTH * 2)
          : start.width;
        let height = changesHeight
          ? clamp(Math.round(start.height + (north ? -dy : dy)), 24, CANVAS_HEIGHT * 2)
          : start.height;
        const isCornerResize = changesWidth && changesHeight;
        if (isCornerResize && element.type === 'image' && element.aspectLocked !== false && !moveEvent.shiftKey) {
          const ratio = start.width / Math.max(1, start.height);
          if (Math.abs(dx) >= Math.abs(dy)) height = Math.round(width / ratio);
          else width = Math.round(height * ratio);
        }
        patch = { width, height, x: west ? Math.round(start.x + start.width - width) : start.x, y: north ? Math.round(start.y + start.height - height) : start.y };
      }
      onChange(element.id, patch, false);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  if (!element.visible) return null;
  return (
    <div className={`studio-element ${selected ? 'selected' : ''} ${multi ? 'multi' : ''} ${element.groupId ? 'grouped' : ''} ${element.locked ? 'locked' : ''} ${dragging ? 'dragging' : ''} ${cropMode ? 'crop-mode' : ''}`} data-name={element.name}
      style={{ position: 'absolute', left: element.x, top: element.y, width: element.width, height: element.height, opacity: element.opacity ?? 1, transform: `rotate(${element.rotation || 0}deg)`, transformOrigin: 'center', cursor: canPanImage && (cropMode || element.locked || element.id === 'background') ? (dragging ? 'grabbing' : 'grab') : element.locked ? 'default' : 'move', zIndex: layerIndex + 1, overflow: element.type === 'image' ? 'hidden' : 'visible', borderRadius: element.type === 'image' ? (element.radius || 0) : 0 }}
      onPointerDown={event => pointerStart(event, 'move')} onClick={event => event.stopPropagation()}
      onDoubleClick={event => {
        // Duplo clique em um grupo entra nele: seleciona só o elemento clicado.
        if (element.groupId && multi) { event.stopPropagation(); onIsolate(element.id); return; }
        if (element.type === 'image') { event.stopPropagation(); onToggleCrop?.(element.id); }
      }}>
      {element.type === 'image' && <img src={withToken(element.src)} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: element.fit || 'cover', objectPosition: imagePosition(element), pointerEvents: 'none', filter: visualFilter(element), transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})` }} />}
      {element.type === 'shape' && <div style={{ width: '100%', height: '100%', background: shapeBackground(element), border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : 'none', borderRadius: element.radius || 0, filter: visualFilter(element) }} />}
      {element.type === 'texture' && <div style={{ width: '100%', height: '100%', ...textureBackground(element), pointerEvents: 'none' }} />}
      {element.type === 'symbol' && <SymbolLayer element={element} />}
      {element.type === 'text' && <div className="studio-text-element" contentEditable={!element.locked} suppressContentEditableWarning spellCheck
        onPointerDown={event => document.activeElement === event.currentTarget ? event.stopPropagation() : pointerStart(event, 'move')}
        onDoubleClick={event => { if (multi) return; event.stopPropagation(); event.currentTarget.focus(); }}
        onBlur={event => onChange(element.id, { content: event.currentTarget.innerText })}
        style={{ fontFamily: element.fontFamily, fontSize: element.fontSize, fontWeight: element.fontWeight, fontStyle: element.fontStyle, lineHeight: element.lineHeight, letterSpacing: element.letterSpacing, color: element.color, textAlign: element.align, width: '100%', height: '100%', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{element.content}</div>}
      {selected && !multi && !element.locked && !cropMode && <>
        {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(handle => <button type="button" key={handle} aria-label={`Redimensionar pela alça ${handle}`} className={`studio-resize-handle ${handle}`} onPointerDown={event => pointerStart(event, `resize-${handle}`)} />)}
        <button type="button" aria-label="Girar elemento" className="studio-rotate-handle" onPointerDown={event => pointerStart(event, 'rotate')}>↻</button>
      </>}
      {selected && cropMode && <div className="studio-crop-badge">Arraste para recortar · duplo clique conclui</div>}
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
    context.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);
    context.translate(-centerX, -centerY);
    context.filter = visualFilter(element);
    if (element.type === 'shape') {
      context.fillStyle = canvasShapeFill(context, element);
      context.beginPath();
      context.roundRect(element.x, element.y, element.width, element.height, Math.min(Number(element.radius) || 0, element.width / 2, element.height / 2));
      context.fill();
      if (element.stroke && element.strokeWidth) { context.strokeStyle = element.stroke; context.lineWidth = element.strokeWidth; context.strokeRect(element.x, element.y, element.width, element.height); }
    } else if (element.type === 'texture') {
      const intensity = clamp(Number(element.intensity) || .14, .02, .8);
      let seed = Number(element.seed) || 17;
      context.fillStyle = element.color || '#30261f';
      const count = Math.round((element.width * element.height / 260) * intensity);
      for (let index = 0; index < count; index += 1) {
        seed = (seed * 9301 + 49297) % 233280;
        const x = element.x + (seed / 233280) * element.width;
        seed = (seed * 9301 + 49297) % 233280;
        const y = element.y + (seed / 233280) * element.height;
        context.globalAlpha = (element.opacity ?? 1) * (.08 + intensity * .28);
        context.fillRect(x, y, 1.2, 1.2);
      }
    } else if (element.type === 'symbol') {
      context.strokeStyle = element.color || '#f4efe5';
      context.lineWidth = Number(element.strokeWidth) || 4;
      context.lineCap = 'round';
      if (element.symbolKind === 'arc') {
        context.beginPath();
        context.moveTo(element.x + element.width * .1, element.y + element.height * .7);
        context.quadraticCurveTo(element.x + element.width * .45, element.y + element.height * .05, element.x + element.width * .92, element.y + element.height * .54);
        context.stroke();
      } else {
        const density = Math.max(3, Number(element.density) || 9);
        context.beginPath(); context.moveTo(element.x, element.y + 2); context.lineTo(element.x + element.width, element.y + 2); context.stroke();
        for (let index = 0; index <= density; index += 1) {
          const x = element.x + (index / density) * element.width;
          const h = index % 5 === 0 ? element.height * .85 : index % 2 === 0 ? element.height * .6 : element.height * .4;
          context.beginPath(); context.moveTo(x, element.y + 2); context.lineTo(x, element.y + h); context.stroke();
        }
      }
    } else if (element.type === 'image' && element.src) {
      const image = await loadCanvasImage(element.src);
      if (Number(element.radius) > 0) {
        context.beginPath();
        context.roundRect(element.x, element.y, element.width, element.height, Math.min(Number(element.radius), element.width / 2, element.height / 2));
        context.clip();
      }
      if ((element.fit || 'cover') === 'contain') {
        const ratio = Math.min(element.width / image.width, element.height / image.height);
        const width = image.width * ratio;
        const height = image.height * ratio;
        context.drawImage(image, element.x + (element.width - width) / 2, element.y + (element.height - height) / 2, width, height);
      } else {
        const ratio = Math.max(element.width / image.width, element.height / image.height);
        const sourceWidth = element.width / ratio;
        const sourceHeight = element.height / ratio;
        const focusX = clamp(positionValue(element.focusX), 0, 100) / 100;
        const focusY = clamp(positionValue(element.focusY), 0, 100) / 100;
        const sourceX = (image.width - sourceWidth) * focusX;
        const sourceY = (image.height - sourceHeight) * focusY;
        context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, element.x, element.y, element.width, element.height);
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
  const [selectedIds, setSelectedIds] = useState([]);
  const setSelectedId = useCallback(id => setSelectedIds(id ? [id] : []), []);
  const [marquee, setMarquee] = useState(null);
  const [guides, setGuides] = useState(null);
  const [cropModeId, setCropModeId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [dirty, setDirty] = useState(() => new Set());
  const [panel, setPanel] = useState('shapes');
  const [zoom, setZoom] = useState(38);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [elementQuery, setElementQuery] = useState('');
  const [elementCategory, setElementCategory] = useState('Tudo');
  const [recentElementKinds, setRecentElementKinds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bella_studio_recent_elements') || '[]'); } catch { return []; }
  });
  const [hasPageClipboard, setHasPageClipboard] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragLayerId, setDragLayerId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const documentsRef = useRef(documents);
  const showToastRef = useRef(showToast);
  const pageRefs = useRef({});
  const uploadRef = useRef(null);
  const uploadIntentRef = useRef('smart');
  const elementClipboardRef = useRef(null);
  const pageClipboardRef = useRef(null);
  const layerAnchorRef = useRef(null);

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
  // Trocar a página ativa não pode recarregar o documento do servidor: isso
  // descartava silenciosamente as alterações ainda não salvas nas outras páginas.
  // `initialFilename` é sincronizado no efeito separado logo abaixo.
  }, [carouselId, slideKey, cacheBuster]);

  useEffect(() => { if (initialFilename && documents[initialFilename]) setActiveFilename(initialFilename); }, [initialFilename, documents]);
  useEffect(() => {
    if (!['library', 'oracle'].includes(panel) || library.length || libraryLoading) return;
    setLibraryLoading(true);
    customFetch('/api/library?sort=date_desc').then(response => response.json()).then(data => setLibrary(data.images || []))
      .catch(() => showToast?.('Não foi possível carregar a biblioteca.', 'error')).finally(() => setLibraryLoading(false));
  }, [panel, library.length, libraryLoading, showToast]);

  const activeDocument = documents[activeFilename];
  const activePage = pages.find(page => page.filename === activeFilename);
  const selectedElements = (activeDocument?.elements || []).filter(element => selectedIds.includes(element.id));
  const multi = selectedElements.length > 1;
  const selected = selectedElements.length === 1 ? selectedElements[0] : undefined;
  const selectedId = selected?.id || null;
  const selectedGroupIds = [...new Set(selectedElements.map(element => element.groupId).filter(Boolean))];
  const wholeGroup = multi && selectedGroupIds.length === 1 && groupMembers(activeDocument.elements, selectedGroupIds[0]).length === selectedElements.length ? selectedGroupIds[0] : null;
  const selectionLabel = wholeGroup ? `${selectedElements[0].groupName || 'Grupo'} · ${selectedElements.length} elementos` : `${selectedElements.length} selecionados`;
  const canGroup = multi && selectedElements.filter(isPickable).length > 1 && !wholeGroup;
  const allText = multi && selectedElements.every(element => element.type === 'text');
  const allShapes = multi && selectedElements.every(element => element.type === 'shape');
  const filteredLibrary = library.filter(item => {
    const query = libraryQuery.trim().toLowerCase();
    if (!query) return true;
    return [item.title, item.category, item.notes].some(value => String(value || '').toLowerCase().includes(query));
  });
  const filteredElements = ELEMENT_LIBRARY.filter(item => {
    const matchesCategory = elementCategory === 'Tudo' || item.category === elementCategory;
    const query = normalizeSearch(elementQuery.trim());
    return matchesCategory && (!query || normalizeSearch(`${item.label} ${item.category} ${item.keywords || ''}`).includes(query));
  });
  const recentElements = recentElementKinds.map(kind => ELEMENT_LIBRARY.find(item => item.kind === kind)).filter(Boolean);
  const scale = zoom / 100;
  const layerList = (activeDocument?.elements || []).map((element, index) => ({ element, index })).filter(item => !isSourceElement(item.element));
  const selectedLayerNumber = layerList.findIndex(item => item.element.id === selectedId) + 1;
  const activatePage = useCallback(pageFilename => { setActiveFilename(pageFilename); setSelectedId(null); setCropModeId(null); onActivatePage?.(pageFilename); }, [onActivatePage]);
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
  const updateElements = useCallback((pageFilename, patches, commit = true) => updateDocument(pageFilename, current => ({ ...current, elements: current.elements.map(element => patches[element.id] ? { ...element, ...patches[element.id] } : element) }), commit), [updateDocument]);
  const removeSelected = useCallback(() => {
    const removable = selectedElements.filter(element => !element.locked);
    if (!removable.length) return;
    const ids = new Set(removable.map(element => element.id));
    updateDocument(activeFilename, current => ({ ...current, elements: current.elements.filter(element => !ids.has(element.id)) })); setSelectedIds([]);
  }, [activeFilename, selectedElements, updateDocument]);

  const addText = useCallback((kind = 'heading', fontFamily) => {
    if (!activeDocument) return;
    const id = makeId('text');
    const variants = {
      heading: { name: 'Título', content: 'Adicione um título', x: 120, y: 420, width: 840, height: 230, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 82, fontWeight: 500, lineHeight: .98, letterSpacing: -1.5 },
      body: { name: 'Texto', content: 'Adicione um texto', x: 150, y: 650, width: 780, height: 220, fontFamily: "'Inter', Arial, sans-serif", fontSize: 38, fontWeight: 400, lineHeight: 1.24, letterSpacing: 0 },
      eyebrow: { name: 'Chamada', content: 'NOVA CHAMADA', x: 150, y: 330, width: 520, height: 70, fontFamily: "'Inter', Arial, sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1.1, letterSpacing: 3 }
    };
    const text = { ...(variants[kind] || variants.heading), ...(fontFamily ? { fontFamily } : {}) };
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, { id, type: 'text', ...text, rotation: 0, opacity: 1, locked: false, visible: true, fontStyle: 'normal', color: '#ffffff', align: 'left' }] }));
    setSelectedId(id); setPanel('design');
  }, [activeDocument, activeFilename, updateDocument]);
  const addShape = (kind = 'rectangle') => {
    if (!activeDocument) return;
    const id = makeId('shape');
    const variants = {
      rectangle: { name: 'Retângulo', x: 240, y: 540, width: 600, height: 180, fill: '#b96642', radius: 0, opacity: .9, blur: 0 },
      circle: { name: 'Círculo', x: 410, y: 520, width: 260, height: 260, fill: '#b96642', radius: 999, opacity: .9, blur: 0 },
      line: { name: 'Linha', x: 240, y: 665, width: 600, height: 8, fill: '#f4efe5', radius: 8, opacity: .9, blur: 0 },
      verticalLine: { name: 'Linha vertical', x: 536, y: 360, width: 8, height: 630, fill: '#f4efe5', radius: 8, opacity: .82, blur: 0 },
      pill: { name: 'Cápsula', x: 290, y: 600, width: 500, height: 120, fill: '#b96642', radius: 999, opacity: .92, blur: 0 },
      veil: { name: 'Véu de contraste', x: 115, y: 430, width: 850, height: 390, fill: '#17110e', radius: 54, opacity: .58, blur: 22 }
      ,outline: { name: 'Aro editorial', x: 330, y: 420, width: 420, height: 420, fill: 'transparent', radius: 999, opacity: .8, blur: 0, stroke: '#d7cec2', strokeWidth: 4 }
      ,frame: { name: 'Moldura fina', x: 80, y: 80, width: 920, height: 1190, fill: 'transparent', radius: 0, opacity: .8, blur: 0, stroke: '#d7cec2', strokeWidth: 2 }
      ,highlight: { name: 'Marca orgânica', x: 260, y: 650, width: 560, height: 34, fill: '#71824b', radius: 999, opacity: .65, blur: 5 }
      ,paper: { name: 'Bloco de papel', x: 155, y: 430, width: 770, height: 460, fill: '#f1eadf', radius: 8, opacity: .96, blur: 0, stroke: '#d9cdbd', strokeWidth: 1 }
      ,photoMat: { name: 'Passe-partout', x: 125, y: 180, width: 830, height: 990, fill: 'transparent', radius: 2, opacity: 1, blur: 0, stroke: '#efe6d8', strokeWidth: 34 }
      ,footerBand: { name: 'Faixa editorial', x: 0, y: 1030, width: 1080, height: 320, fill: '#171513', radius: 0, opacity: .88, blur: 0 }
      ,glow: { name: 'Luz difusa', x: 315, y: 430, width: 450, height: 450, fill: '#e2b98b', radius: 999, opacity: .34, blur: 42 }
      ,shadowSoft: { name: 'Sombra suave', x: 160, y: 500, width: 760, height: 300, fill: '#000000', radius: 80, opacity: .62, blur: 38 }
      ,shadowBottom: { name: 'Sombra inferior', x: 0, y: 810, width: 1080, height: 540, fill: '#000000', radius: 0, opacity: 1, blur: 0, gradient: { type: 'linear', direction: 'down', stops: [{ at: 0, color: 'rgba(0,0,0,0)' }, { at: 100, color: 'rgba(0,0,0,0.92)' }] } }
      ,shadowTop: { name: 'Sombra superior', x: 0, y: 0, width: 1080, height: 500, fill: '#000000', radius: 0, opacity: 1, blur: 0, gradient: { type: 'linear', direction: 'up', stops: [{ at: 0, color: 'rgba(0,0,0,0)' }, { at: 100, color: 'rgba(0,0,0,0.88)' }] } }
      ,shadowLeft: { name: 'Sombra lateral', x: 0, y: 0, width: 620, height: 1350, fill: '#000000', radius: 0, opacity: 1, blur: 0, gradient: { type: 'linear', direction: 'horizontal', stops: [{ at: 0, color: 'rgba(0,0,0,0.9)' }, { at: 100, color: 'rgba(0,0,0,0)' }] } }
      ,vignette: { name: 'Vinheta escura', x: 0, y: 0, width: 1080, height: 1350, fill: '#000000', radius: 0, opacity: 1, blur: 0, gradient: { type: 'radial', stops: [{ at: 0, color: 'rgba(0,0,0,0)' }, { at: 58, color: 'rgba(0,0,0,0.08)' }, { at: 100, color: 'rgba(0,0,0,0.78)' }] } }
      ,shadowSpot: { name: 'Sombra circular', x: 290, y: 430, width: 500, height: 500, fill: '#000000', radius: 999, opacity: .62, blur: 55 }
    };
    const shape = variants[kind] || variants.rectangle;
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, { id, type: 'shape', stroke: '', strokeWidth: 0, ...shape, rotation: 0, locked: false, visible: true }] }));
    setSelectedId(id); setPanel('design');
  };
  const addElementPreset = kind => {
    if (!activeDocument) return;
    setRecentElementKinds(current => {
      const next = [kind, ...current.filter(value => value !== kind)].slice(0, 6);
      localStorage.setItem('bella_studio_recent_elements', JSON.stringify(next));
      return next;
    });
    if (!['halo', 'ritualFrame', 'constellation'].includes(kind)) { addShape(kind); return; }
    const shape = (name, patch) => ({ id: makeId('shape'), type: 'shape', name, fill: 'transparent', stroke: '#e8ddcf', strokeWidth: 3, radius: 0, opacity: .82, blur: 0, rotation: 0, locked: false, visible: true, ...patch });
    const compositions = {
      halo: [
        shape('Halo externo', { x: 250, y: 385, width: 580, height: 580, radius: 999, strokeWidth: 3 }),
        shape('Halo interno', { x: 315, y: 450, width: 450, height: 450, radius: 999, stroke: '#b96642', strokeWidth: 2 })
      ],
      ritualFrame: [
        shape('Moldura externa', { x: 74, y: 74, width: 932, height: 1202, strokeWidth: 2 }),
        shape('Moldura interna', { x: 94, y: 94, width: 892, height: 1162, stroke: '#b96642', strokeWidth: 1 }),
        shape('Selo circular', { x: 490, y: 1190, width: 100, height: 100, radius: 999, fill: '#b96642', stroke: '', strokeWidth: 0, opacity: .9 })
      ],
      constellation: [
        shape('Órbita', { x: 255, y: 410, width: 570, height: 570, radius: 999, strokeWidth: 2, opacity: .55 }),
        shape('Ponto norte', { x: 515, y: 375, width: 50, height: 50, radius: 999, fill: '#e8ddcf', stroke: '', strokeWidth: 0 }),
        shape('Ponto leste', { x: 805, y: 670, width: 34, height: 34, radius: 999, fill: '#b96642', stroke: '', strokeWidth: 0 }),
        shape('Ponto sul', { x: 525, y: 965, width: 28, height: 28, radius: 999, fill: '#71824b', stroke: '', strokeWidth: 0 })
      ]
    };
    const elements = compositions[kind];
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, ...elements] }));
    setSelectedId(elements.at(-1).id); setPanel('design');
  };
  const copyPageDesign = pageFilename => {
    const source = documentsRef.current[pageFilename];
    if (!source) return;
    pageClipboardRef.current = cloneDocument(source);
    setHasPageClipboard(true);
    showToast?.('Design da página copiado. Escolha outra página e clique em Colar.', 'success');
  };
  const pastePageDesign = pageFilename => {
    if (!pageClipboardRef.current) return;
    updateDocument(pageFilename, () => cloneDocument(pageClipboardRef.current));
    activatePage(pageFilename);
    showToast?.('Design colado nesta página. Você pode desfazer com Ctrl+Z.', 'success');
  };
  const togglePageLock = pageFilename => {
    const pageDocument = documentsRef.current[pageFilename];
    if (!pageDocument) return;
    const editable = pageDocument.elements.filter(element => element.id !== 'background');
    const shouldLock = editable.some(element => !element.locked);
    updateDocument(pageFilename, current => ({ ...current, elements: current.elements.map(element => element.id === 'background' ? element : { ...element, locked: shouldLock }) }));
  };
  const insertImage = (source, mode = 'smart') => {
    if (!source || !activeDocument) return;
    const cleanSource = withoutToken(source);
    if (mode === true || mode === 'background') {
      const background = activeDocument.elements.find(element => element.id === 'background');
      if (background) updateElement(activeFilename, background.id, { src: cleanSource, visible: true, focusX: 50, focusY: 50 });
      else updateDocument(activeFilename, current => ({ ...current, elements: [{ id: 'background', type: 'image', name: 'Imagem de fundo', src: cleanSource, x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, rotation: 0, opacity: 1, locked: true, visible: true, fit: 'cover', focusX: 50, focusY: 50 }, ...current.elements] }));
      setSelectedId('background'); return;
    }
    if ((mode === 'replace' || mode === 'smart') && selected?.type === 'image') { updateElement(activeFilename, selected.id, { src: cleanSource, visible: true, focusX: 50, focusY: 50 }); return; }
    const id = makeId('image');
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, { id, type: 'image', name: 'Imagem livre', src: cleanSource, x: 240, y: 390, width: 600, height: 600, rotation: 0, opacity: 1, locked: false, visible: true, fit: 'cover', focusX: 50, focusY: 50, aspectLocked: true, flipX: false, flipY: false }] }));
    setSelectedId(id); setCropModeId(null); setPanel('design');
  };
  const openUpload = (intent = 'smart') => { uploadIntentRef.current = intent; uploadRef.current?.click(); };
  const detachBackground = () => {
    if (selected?.type !== 'image') return;
    const id = makeId('image');
    updateDocument(activeFilename, current => ({
      ...current,
      legacyFlattened: false,
      elements: [
        ...current.elements.map(element => element.id === selected.id ? { ...element, visible: false } : element),
        { ...selected, id, name: 'Imagem livre', x: 160, y: 205, width: 760, height: 950, locked: false, visible: true, rotation: 0, aspectLocked: true }
      ]
    }));
    setSelectedId(id); setCropModeId(null);
    showToast?.('A imagem agora é uma camada livre. O fundo original foi apenas ocultado.', 'success');
  };
  const convertLegacy = () => {
    if (!activePage) return;
    commitSnapshot(); setDocuments(current => ({ ...current, [activeFilename]: createEditableSlideDocument(activePage.meta, activePage.rawImageUrl) })); markDirty(activeFilename); setSelectedId('title');
    showToast?.('Lâmina convertida. Revise a composição antes de salvar.', 'success');
  };
  // `target` é um id ou uma lista de ids (seleção múltipla/grupo): todos mudam de camada juntos.
  const reorderElement = useCallback((target, mode) => {
    const ids = Array.isArray(target) ? target : [target];
    if (!ids.length || !ids[0]) return;
    updateDocument(activeFilename, current => {
      const elements = reorderMany(current.elements, ids, mode);
      const unchanged = elements.length === current.elements.length && elements.every((element, index) => element === current.elements[index]);
      return unchanged ? current : { ...current, elements };
    });
  }, [activeFilename, updateDocument]);
  const duplicateSelected = useCallback(() => {
    const sources = selectedElements.filter(element => element.id !== 'background');
    if (!sources.length || !activeDocument) return;
    const copies = cloneWithNewGroups(sources, makeId).map(copy => ({ ...copy, name: `${copy.name} — cópia`, x: copy.x + 28, y: copy.y + 28, locked: false }));
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, ...copies] }));
    setSelectedIds(copies.map(copy => copy.id));
  }, [activeDocument, activeFilename, selectedElements, updateDocument]);
  const copySelected = useCallback(() => {
    const sources = selectedElements.filter(element => element.id !== 'background');
    if (!sources.length) return;
    elementClipboardRef.current = sources.map(element => ({ ...element }));
    showToastRef.current?.(sources.length > 1 ? `${sources.length} elementos copiados.` : 'Elemento copiado.', 'success');
  }, [selectedElements]);
  const pasteClipboard = useCallback(() => {
    const sources = elementClipboardRef.current;
    if (!sources?.length || !activeDocument) return;
    const copies = cloneWithNewGroups(sources, makeId).map(copy => ({ ...copy, name: `${String(copy.name).replace(/ — cópia$/, '')} — cópia`, x: copy.x + 34, y: copy.y + 34, locked: false }));
    updateDocument(activeFilename, current => ({ ...current, legacyFlattened: false, elements: [...current.elements, ...copies] }));
    elementClipboardRef.current = sources.map(element => ({ ...element, x: element.x + 34, y: element.y + 34 }));
    setSelectedIds(copies.map(copy => copy.id));
  }, [activeDocument, activeFilename, updateDocument]);

  // ── Seleção múltipla, grupos, alinhamento ──────────────────────────────────────────────────────────────
  const groupSelected = useCallback(() => {
    if (!canGroup) return;
    updateDocument(activeFilename, current => {
      const result = groupElements(current.elements, selectedIds);
      return result.groupId ? { ...current, elements: result.elements } : current;
    });
    showToastRef.current?.('Elementos agrupados. Arraste, gire ou redimensione como uma peça só; duplo clique entra no grupo.', 'success');
  }, [activeFilename, canGroup, selectedIds, updateDocument]);
  const ungroupSelected = useCallback(() => {
    if (!selectedElements.some(element => element.groupId)) return;
    updateDocument(activeFilename, current => ({ ...current, elements: ungroupElements(current.elements, selectedIds) }));
    showToastRef.current?.('Grupo desfeito. Os elementos continuam selecionados.', 'success');
  }, [activeFilename, selectedElements, selectedIds, updateDocument]);
  const renameSelectedGroup = name => { if (wholeGroup) updateDocument(activeFilename, current => ({ ...current, elements: renameGroup(current.elements, wholeGroup, name) }), false); setDirty(current => new Set([...current, activeFilename])); };
  const alignSelection = mode => {
    if (!activeDocument) return;
    const patches = alignElements(activeDocument.elements, selectedIds, mode);
    if (Object.keys(patches).length) updateElements(activeFilename, patches);
  };
  const distributeSelection = axis => {
    if (!activeDocument) return;
    const patches = distributeElements(activeDocument.elements, selectedIds, axis);
    if (Object.keys(patches).length) updateElements(activeFilename, patches);
  };
  const patchSelection = (build, commit = true) => {
    const patches = {};
    selectedElements.filter(element => !element.locked).forEach(element => { const patch = build(element); if (patch) patches[element.id] = patch; });
    if (Object.keys(patches).length) updateElements(activeFilename, patches, commit);
  };
  const toggleLockSelection = () => {
    const shouldLock = selectedElements.some(element => !element.locked);
    updateElements(activeFilename, Object.fromEntries(selectedElements.filter(element => element.id !== 'background').map(element => [element.id, { locked: shouldLock }])));
  };
  const selectAllOnPage = useCallback(() => {
    if (!activeDocument) return;
    setSelectedIds(activeDocument.elements.filter(element => isPickable(element) && !element.locked).map(element => element.id));
  }, [activeDocument]);
  const selectOnly = (pageFilename, id) => {
    if (pageFilename !== activeFilename) { setActiveFilename(pageFilename); onActivatePage?.(pageFilename); }
    setSelectedIds([id]);
    if (cropModeId && cropModeId !== id) setCropModeId(null);
  };

  // Mover: clique seleciona (o grupo inteiro, se houver); Ctrl/Shift+clique soma ou tira da seleção; arrastar leva todos.
  const beginMove = (event, id, pageFilename) => {
    const elements = documentsRef.current[pageFilename]?.elements || [];
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    const members = expandToGroups(elements, [id]);
    const samePage = pageFilename === activeFilename;
    const current = samePage ? selectedIds : [];
    if (!samePage) { setActiveFilename(pageFilename); onActivatePage?.(pageFilename); }
    if (cropModeId) setCropModeId(null);
    let ids;
    let collapseTo = null;
    if (additive) {
      const removing = members.every(member => current.includes(member));
      ids = removing ? current.filter(item => !members.includes(item)) : [...new Set([...current, ...members])];
      setSelectedIds(ids);
      if (removing) return;
    } else if (current.includes(id) && current.length > 1) { ids = current; collapseTo = members; }
    else { ids = members; setSelectedIds(ids); }
    const movable = elements.filter(element => ids.includes(element.id) && !element.locked);
    const finish = () => { if (collapseTo) setSelectedIds(collapseTo); };
    if (!movable.length) { finish(); return; }
    const box = boundsOf(movable);
    const starts = movable.map(element => ({ id: element.id, x: element.x, y: element.y }));
    const others = elements.filter(element => !ids.includes(element.id) && isPickable(element));
    const origin = { x: event.clientX, y: event.clientY };
    let started = false;
    const move = moveEvent => {
      if (!started) {
        if (Math.hypot(moveEvent.clientX - origin.x, moveEvent.clientY - origin.y) < 3) return;
        started = true; commitSnapshot();
      }
      let dx = (moveEvent.clientX - origin.x) / scale;
      let dy = (moveEvent.clientY - origin.y) / scale;
      let guideX = null; let guideY = null;
      if (!moveEvent.altKey) {
        const snap = snapMove({ x: box.x + dx, y: box.y + dy, width: box.width, height: box.height }, others, Math.max(5, 7 / scale));
        dx += snap.dx; dy += snap.dy; guideX = snap.guideX; guideY = snap.guideY;
      }
      const limited = clampMove(box, dx, dy);
      updateElements(pageFilename, Object.fromEntries(starts.map(start => [start.id, { x: Math.round(start.x + limited.dx), y: Math.round(start.y + limited.dy) }])), false);
      setGuides({ page: pageFilename, x: guideX, y: guideY });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setGuides(null);
      if (!started) finish();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Retângulo de seleção: arraste no vazio da página. Ctrl/Shift soma à seleção atual.
  const beginMarquee = (event, pageFilename, clickId = null) => {
    event.preventDefault();
    event.stopPropagation();
    document.activeElement?.blur?.();
    const additive = event.ctrlKey || event.metaKey || event.shiftKey;
    const samePage = pageFilename === activeFilename;
    if (!samePage) { setActiveFilename(pageFilename); setSelectedIds([]); onActivatePage?.(pageFilename); }
    setCropModeId(null);
    const canvas = event.currentTarget.closest('.studio-canvas') || event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const toCanvas = pointer => ({ x: (pointer.clientX - rect.left) / scale, y: (pointer.clientY - rect.top) / scale });
    const start = toCanvas(event);
    const base = additive && samePage ? selectedIds : [];
    const elements = documentsRef.current[pageFilename]?.elements || [];
    let dragged = false;
    const move = moveEvent => {
      const point = toCanvas(moveEvent);
      if (!dragged && Math.hypot(point.x - start.x, point.y - start.y) * scale < 4) return;
      dragged = true;
      const area = normalizeRect(start.x, start.y, point.x, point.y);
      setMarquee({ page: pageFilename, ...area });
      setSelectedIds([...new Set([...base, ...expandToGroups(elements, pickInRect(elements, area))])]);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setMarquee(null);
      if (!dragged) setSelectedIds(clickId ? [clickId] : additive ? base : []);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Alças do quadro de seleção: escala todos os elementos juntos (texto inclusive), mantendo a proporção.
  const beginGroupResize = (event, handle) => {
    event.preventDefault();
    event.stopPropagation();
    const targets = selectedElements.filter(element => !element.locked);
    if (!targets.length) return;
    const box = boundsOf(selectedElements);
    const anchor = { x: handle.includes('w') ? box.x + box.width : box.x, y: handle.includes('n') ? box.y + box.height : box.y };
    const starts = targets.map(element => ({ ...element }));
    const origin = { x: event.clientX, y: event.clientY };
    const pageFilename = activeFilename;
    let started = false;
    const move = moveEvent => {
      if (!started) { started = true; commitSnapshot(); }
      const dx = (moveEvent.clientX - origin.x) / scale;
      const dy = (moveEvent.clientY - origin.y) / scale;
      const fx = (box.width + (handle.includes('e') ? dx : -dx)) / Math.max(1, box.width);
      const fy = (box.height + (handle.includes('s') ? dy : -dy)) / Math.max(1, box.height);
      const factor = clamp(Math.abs(fx - 1) > Math.abs(fy - 1) ? fx : fy, .15, 5);
      updateElements(pageFilename, scaleElements(starts, anchor, factor), false);
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const selectLayer = (id, event) => {
    const ordered = layerList.map(item => item.element.id);
    if (event.shiftKey && layerAnchorRef.current && ordered.includes(layerAnchorRef.current)) {
      const [a, b] = [ordered.indexOf(layerAnchorRef.current), ordered.indexOf(id)].sort((x, y) => x - y);
      setSelectedIds(ordered.slice(a, b + 1).filter(item => item !== 'background'));
      return;
    }
    layerAnchorRef.current = id;
    if (event.ctrlKey || event.metaKey) setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    else setSelectedIds([id]);
  };
  useEffect(() => {
    const keydown = event => {
      const editing = event.target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName);
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (command && key === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
      if (command && key === 'y') { event.preventDefault(); redo(); return; }
      if (editing) return;
      if (event.key === 'Escape') { setSelectedIds([]); setCropModeId(null); return; }
      if (!command && !event.altKey && key === 't') { event.preventDefault(); addText('body'); return; }
      if (command && key === 'a') { event.preventDefault(); selectAllOnPage(); return; }
      if (command && key === 'g') { event.preventDefault(); event.shiftKey ? ungroupSelected() : groupSelected(); return; }
      if (command && key === 'd' && selectedElements.length) { event.preventDefault(); duplicateSelected(); return; }
      if (command && key === 'c' && selectedElements.length) { event.preventDefault(); copySelected(); return; }
      if (command && key === 'v' && elementClipboardRef.current && activeDocument) { event.preventDefault(); pasteClipboard(); return; }
      if (selectedElements.length && command && (event.code === 'BracketRight' || event.code === 'BracketLeft')) {
        event.preventDefault();
        reorderElement(selectedIds, event.code === 'BracketRight' ? (event.shiftKey ? 'front' : 'forward') : (event.shiftKey ? 'back' : 'backward'));
        return;
      }
      if (!selectedElements.length) return;
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); removeSelected(); return; }
      const step = event.shiftKey ? 10 : 1;
      const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
      if (delta) {
        event.preventDefault();
        const patches = Object.fromEntries(selectedElements.filter(element => !element.locked).map(element => [element.id, { x: element.x + delta[0], y: element.y + delta[1] }]));
        if (Object.keys(patches).length) updateElements(activeFilename, patches);
      }
    };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, [activeDocument, activeFilename, addText, copySelected, duplicateSelected, groupSelected, pasteClipboard, redo, removeSelected, reorderElement, selectAllOnPage, selectedElements, selectedIds, ungroupSelected, undo, updateElements]);
  const uploadImages = async event => {
    event.preventDefault?.();
    const files = [...(event.target?.files || event.dataTransfer?.files || [])].filter(file => file.type.startsWith('image/'));
    if (!files.length) return; setUploading(true);
    try {
      const body = new FormData(); files.forEach(file => body.append('files', file)); body.append('category', 'Bella — Estúdio');
      const response = await customFetch('/api/library/upload', { method: 'POST', body }); const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Falha no upload');
      setLibrary(current => [...data.images, ...current]); insertImage(data.images[0]?.url, uploadIntentRef.current); showToast?.('Imagem adicionada à arte e à biblioteca.', 'success');
    } catch (error) { showToast?.(error.message || 'Não foi possível enviar a imagem.', 'error'); }
    finally { setUploading(false); if (event.target && 'value' in event.target) event.target.value = ''; }
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

  const selectionBox = multi ? boundsOf(selectedElements) : null;
  const partialGroups = activeDocument ? selectedGroupIds.filter(id => id !== wholeGroup).map(id => {
    const members = groupMembers(activeDocument.elements, id);
    return { id, name: members[0]?.groupName || 'Grupo', box: boundsOf(members) };
  }).filter(group => group.box) : [];

  if (loading) return <div className="slide-studio studio-loading">Preparando todas as lâminas…</div>;
  return (
    <div className="slide-studio" role="dialog" aria-modal="true" aria-label="Editor visual do carrossel">
      <input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={uploadImages} />
      <header className="studio-topbar">
        <div className="studio-brand"><button type="button" className="studio-back" onClick={onClose}>←</button><div><strong>Estúdio de criação</strong><span>{pages.length} lâminas no mesmo documento</span></div></div>
        <div className="studio-history-actions"><IconButton label="Desfazer" disabled={!history.length} onClick={undo}>↶</IconButton><IconButton label="Refazer" disabled={!future.length} onClick={redo}>↷</IconButton><span className="studio-save-state">{dirty.size ? `${dirty.size} com alterações` : 'Tudo salvo'}</span></div>
        <div className="studio-primary-actions"><button type="button" className="studio-secondary-button" onClick={() => onRegenerate?.(activeFilename)}>✦ Nova imagem</button><button type="button" className="studio-save-button" disabled={saving || !dirty.size} onClick={saveAll}>{saving ? 'Salvando…' : 'Salvar carrossel'}</button></div>
      </header>
      <div className="studio-main">
        <div className="studio-contextbar" aria-label="Controles do elemento selecionado">
          {multi ? <>
            <strong>{selectionLabel}</strong>
            <i className="studio-context-divider" />
            <button type="button" disabled={!canGroup} title="Agrupar (Ctrl+G)" onClick={groupSelected}>▣ Agrupar</button>
            <button type="button" disabled={!selectedElements.some(element => element.groupId)} title="Desagrupar (Ctrl+Shift+G)" onClick={ungroupSelected}>▢ Desagrupar</button>
            <i className="studio-context-divider" />
            {ALIGN_ACTIONS.map(action => <button type="button" key={action.mode} aria-label={action.label} title={action.label} onClick={() => alignSelection(action.mode)}>{action.glyph}</button>)}
            <button type="button" aria-label="Distribuir na horizontal" title="Distribuir espaço na horizontal (3 ou mais)" disabled={selectedElements.length < 3} onClick={() => distributeSelection('h')}>⇹</button>
            <button type="button" aria-label="Distribuir na vertical" title="Distribuir espaço na vertical (3 ou mais)" disabled={selectedElements.length < 3} onClick={() => distributeSelection('v')}>⇳</button>
            {(allText || allShapes) && <><i className="studio-context-divider" />
              {allText && <><button type="button" aria-label="Diminuir fonte de todos" onClick={() => patchSelection(element => ({ fontSize: clamp((Number(element.fontSize) || 40) - 2, 10, 240) }))}>A−</button><button type="button" aria-label="Aumentar fonte de todos" onClick={() => patchSelection(element => ({ fontSize: clamp((Number(element.fontSize) || 40) + 2, 10, 240) }))}>A+</button></>}
              <input className="studio-color-control" aria-label={allText ? 'Cor de todos os textos' : 'Cor de todas as formas'} type="color" value={(allText ? selectedElements[0].color : selectedElements[0].fill) && /^#[0-9a-f]{6}$/i.test(allText ? selectedElements[0].color : selectedElements[0].fill) ? (allText ? selectedElements[0].color : selectedElements[0].fill) : '#ffffff'} onFocus={commitSnapshot} onChange={event => patchSelection(() => allText ? { color: event.target.value } : { fill: event.target.value }, false)} />
            </>}
            <i className="studio-context-divider" />
            <button type="button" title="Trazer para frente (Ctrl+Shift+])" onClick={() => reorderElement(selectedIds, 'front')}>⇡ Frente</button>
            <button type="button" title="Enviar para o fundo (Ctrl+Shift+[)" onClick={() => reorderElement(selectedIds, 'back')}>⇣ Fundo</button>
            <button type="button" title="Bloquear ou desbloquear todos" onClick={toggleLockSelection}>{selectedElements.some(element => !element.locked) ? '⌓ Bloquear' : '⌑ Desbloquear'}</button>
            <button type="button" onClick={duplicateSelected}>Duplicar</button>
            <button type="button" className="danger" onClick={removeSelected}>Excluir</button>
          </> : selected?.type === 'text' ? <>
            <select aria-label="Fonte" value={selected.fontFamily} onChange={event => updateElement(activeFilename, selected.id, { fontFamily: event.target.value })}>{FONT_OPTIONS.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}</select>
            <button type="button" aria-label="Diminuir fonte" onClick={() => updateElement(activeFilename, selected.id, { fontSize: clamp(selected.fontSize - 2, 10, 240) })}>−</button>
            <input className="studio-font-size" aria-label="Tamanho da fonte" type="number" min="10" max="240" value={selected.fontSize} onChange={event => updateElement(activeFilename, selected.id, { fontSize: Number(event.target.value) })} />
            <button type="button" aria-label="Aumentar fonte" onClick={() => updateElement(activeFilename, selected.id, { fontSize: clamp(selected.fontSize + 2, 10, 240) })}>+</button>
            <input className="studio-color-control" aria-label="Cor do texto" type="color" value={selected.color} onChange={event => updateElement(activeFilename, selected.id, { color: event.target.value })} />
            <button type="button" className={Number(selected.fontWeight) >= 700 ? 'active' : ''} aria-label="Negrito" onClick={() => updateElement(activeFilename, selected.id, { fontWeight: Number(selected.fontWeight) >= 700 ? 400 : 700 })}><strong>B</strong></button>
            <button type="button" className={selected.fontStyle === 'italic' ? 'active' : ''} aria-label="Itálico" onClick={() => updateElement(activeFilename, selected.id, { fontStyle: selected.fontStyle === 'italic' ? 'normal' : 'italic' })}><em>I</em></button>
            {['left', 'center', 'right'].map(align => <button type="button" key={align} className={selected.align === align ? 'active' : ''} aria-label={`Alinhar ${align}`} onClick={() => updateElement(activeFilename, selected.id, { align })}>{align === 'left' ? '≡' : align === 'center' ? '≣' : '≡'}</button>)}
          </> : selected?.type === 'image' ? <>
            <button type="button" onClick={() => openUpload(selected.id === 'background' ? 'background' : 'replace')}>↑ Upload</button>
            <button type="button" onClick={() => setPanel('library')}>Biblioteca</button>
            {selected.id === 'background' && <button type="button" onClick={detachBackground}>Soltar do fundo</button>}
            <button type="button" className={cropModeId === selected.id ? 'active' : ''} onClick={() => { updateElement(activeFilename, selected.id, { fit: 'cover' }); setCropModeId(current => current === selected.id ? null : selected.id); }}>{cropModeId === selected.id ? 'Concluir recorte' : 'Recortar'}</button>
            <button type="button" className={(selected.fit || 'cover') === 'cover' ? 'active' : ''} onClick={() => updateElement(activeFilename, selected.id, { fit: 'cover' })}>Preencher</button>
            <button type="button" className={selected.fit === 'contain' ? 'active' : ''} onClick={() => updateElement(activeFilename, selected.id, { fit: 'contain' })}>Ajustar</button>
            <button type="button" onClick={() => updateElement(activeFilename, selected.id, { focusX: 50, focusY: 50 })}>Centralizar imagem</button>
            <button type="button" onClick={() => updateElement(activeFilename, selected.id, { flipX: !selected.flipX })}>Virar H</button>
            <button type="button" onClick={() => updateElement(activeFilename, selected.id, { flipY: !selected.flipY })}>Virar V</button>
          </> : selected?.type === 'shape' ? <>
            <span>Cor</span><input className="studio-color-control" aria-label="Cor da forma" type="color" value={selected.fill} onChange={event => updateElement(activeFilename, selected.id, { fill: event.target.value })} />
            </> : <><strong>Página vertical 1080 × 1350</strong><span>Selecione qualquer item para editar</span></>}
          {selected && selected.id !== 'background' && <><i className="studio-context-divider" /><span title="Posição na pilha (1 = mais ao fundo)">Camada {selectedLayerNumber}/{layerList.length}</span><button type="button" title="Trazer para frente (Ctrl+Shift+])" onClick={() => reorderElement(selected.id, 'front')}>⇡ Frente</button><button type="button" title="Avançar sobre o elemento que a cobre (Ctrl+])" onClick={() => reorderElement(selected.id, 'forward')}>↑ Avançar</button><button type="button" title="Recuar para trás do elemento que ela cobre (Ctrl+[)" onClick={() => reorderElement(selected.id, 'backward')}>↓ Recuar</button><button type="button" title="Enviar para o fundo (Ctrl+Shift+[)" onClick={() => reorderElement(selected.id, 'back')}>⇣ Fundo</button></>}
          {selected?.groupId && <><i className="studio-context-divider" /><span title="Este elemento faz parte de um grupo. Clique fora e depois nele para selecionar o grupo todo.">{selected.groupName || 'Grupo'}</span><button type="button" title="Desagrupar (Ctrl+Shift+G)" onClick={ungroupSelected}>▢ Desagrupar</button></>}
          {selected && !selected.locked && <><i className="studio-context-divider" /><button type="button" onClick={duplicateSelected}>Duplicar</button><button type="button" className="danger" onClick={removeSelected}>Excluir</button></>}
        </div>
        <aside className="studio-tools" aria-label="Ferramentas">
          <button type="button" className={panel === 'design' ? 'active' : ''} onClick={() => setPanel('design')}><span>◆</span>Ajustes</button>
          <button type="button" className={panel === 'shapes' ? 'active' : ''} onClick={() => setPanel('shapes')}><span>✦</span>Elementos</button>
          <button type="button" className={panel === 'text' ? 'active' : ''} onClick={() => setPanel('text')}><span>T</span>Texto</button>
          <button type="button" className={panel === 'oracle' ? 'active' : ''} onClick={() => setPanel('oracle')}><span>✧</span>Oráculo</button>
          <button type="button" className={panel === 'uploads' ? 'active' : ''} onClick={() => setPanel('uploads')}><span>↑</span>Uploads</button>
          <button type="button" className={panel === 'library' ? 'active' : ''} onClick={() => setPanel('library')}><span>▧</span>Biblioteca</button>
          <button type="button" className={panel === 'layers' ? 'active' : ''} onClick={() => setPanel('layers')}><span>▱</span>Camadas</button>
        </aside>
        <aside className="studio-panel">
          {panel === 'library' ? <div className="studio-images-panel">
            <div className="studio-panel-heading"><div><span>Suas imagens</span><strong>Biblioteca</strong></div></div>
            <div className="studio-library-search"><input type="search" value={libraryQuery} onChange={event => setLibraryQuery(event.target.value)} placeholder="Buscar fotos e referências…" /><small>{selected?.type === 'image' ? 'Clique em Usar para substituir a imagem selecionada.' : 'Adicione como elemento ou defina como fundo.'}</small></div>
            <div className="studio-library-grid">{libraryLoading ? <span className="studio-muted">Carregando biblioteca…</span> : filteredLibrary.slice(0, 60).map(item => <article key={item.id} className="studio-library-item"><img src={withToken(item.url)} alt={item.title || 'Imagem da biblioteca'} /><strong title={item.title}>{item.title || 'Sem título'}</strong><div className="three-actions"><button type="button" onClick={() => insertImage(item.url, 'element')}>Adicionar</button><button type="button" disabled={selected?.type !== 'image'} onClick={() => insertImage(item.url, 'replace')}>Trocar</button><button type="button" onClick={() => insertImage(item.url, 'background')}>Fundo</button></div></article>)}</div>
          </div> : panel === 'uploads' ? <><div className="studio-panel-heading"><div><span>Mídia própria</span><strong>Uploads</strong></div></div><button type="button" className="studio-dropzone" onClick={() => openUpload('smart')} onDragOver={event => event.preventDefault()} onDrop={event => { uploadIntentRef.current = 'smart'; uploadImages(event); }} disabled={uploading}><span>↑</span><strong>{uploading ? 'Enviando imagens…' : 'Envie suas fotos'}</strong><small>Arraste JPG, PNG ou WEBP aqui. O arquivo entra na arte e fica salvo na Biblioteca.</small></button><div className="studio-upload-choices"><button type="button" onClick={() => openUpload('background')}>Trocar imagem de fundo</button><button type="button" onClick={() => openUpload('element')}>Adicionar nova camada</button></div><div className="studio-info-card">Você escolhe: substituir o fundo, trocar a imagem selecionada ou adicionar uma nova camada livre.</div></> : panel === 'oracle' ? <><div className="studio-panel-heading"><div><span>Criação visual</span><strong>Oráculo de imagens</strong></div></div><div className="studio-generator"><label>Descreva a cena<textarea value={imagePrompt} onChange={event => setImagePrompt(event.target.value)} placeholder="Ex.: mulher atravessando um campo de luz, atmosfera sensível e sacerdotal…" /></label><button type="button" onClick={generateImage} disabled={generatingImage || !imagePrompt.trim()}>{generatingImage ? 'Criando imagem…' : '✦ Gerar imagem sem texto'}</button><small>A imagem gerada entra como uma camada e também fica disponível na Biblioteca.</small></div></> : panel === 'text' ? <><div className="studio-panel-heading"><div><span>Tipografia</span><strong>Adicionar texto</strong></div></div><div className="studio-shortcut-banner"><kbd>T</kbd><span>Pressione T em qualquer lugar para criar uma caixa de texto.</span></div><div className="studio-text-presets"><button type="button" onClick={() => addText('heading')}><strong>Adicione um título</strong><small>Editorial de alto impacto</small></button><button type="button" onClick={() => addText('body')}><span>Adicione um texto</span><small>Corpo de leitura confortável</small></button><button type="button" onClick={() => addText('eyebrow')}><em>NOVA CHAMADA</em><small>Etiqueta e assinatura</small></button></div><div className="studio-font-list"><span>Fontes do documento · {FONT_OPTIONS.length}</span>{FONT_OPTIONS.map(font => <button type="button" key={font.value} style={{ fontFamily: font.value }} onClick={() => selected?.type === 'text' ? updateElement(activeFilename, selected.id, { fontFamily: font.value }) : addText('heading', font.value)}>{font.label}<small>AaBbCc</small></button>)}</div></> : panel === 'shapes' ? <><div className="studio-panel-heading"><div><span>Biblioteca criativa</span><strong>Elementos editáveis</strong></div></div><div className="studio-element-search"><input type="search" value={elementQuery} onChange={event => setElementQuery(event.target.value)} placeholder="Busque sombra, blur, moldura, círculo…" aria-label="Buscar elementos" /><div className="studio-element-search-actions"><button type="button" onClick={() => setPanel('oracle')}>✦ Gerar</button><button type="button" className="active">⌕ Buscar</button></div><div className="studio-element-categories">{ELEMENT_CATEGORIES.map(category => <button type="button" key={category} className={elementCategory === category ? 'active' : ''} onClick={() => setElementCategory(category)}>{category}</button>)}</div></div>{!elementQuery && elementCategory === 'Tudo' && recentElements.length > 0 && <section className="studio-recent-elements"><div><strong>Usados recentemente</strong><span>{recentElements.length}</span></div><div>{recentElements.map(item => <button type="button" key={item.kind} onClick={() => addElementPreset(item.kind)} title={item.label}><i className={`shape-preview ${item.preview}`} /><small>{item.label}</small></button>)}</div></section>}<div className="studio-elements-count"><span>{elementQuery ? `Resultados para “${elementQuery}”` : `${filteredElements.length} elementos`}</span><small>Camadas livres e editáveis</small></div><div className="studio-shape-grid">{filteredElements.map(item => <button type="button" key={item.kind} onClick={() => addElementPreset(item.kind)}><i className={`shape-preview ${item.preview}`} />{item.label}<small>{item.composition ? 'composição' : item.category}</small></button>)}</div>{!filteredElements.length && <div className="studio-empty-state">Nenhum elemento encontrado. Tente “sombra”, “blur”, “moldura”, “luz” ou “círculo”.</div>}<div className="studio-info-card">Clique para inserir. Cada recurso entra como camada livre: mova, redimensione, gire, altere transparência, desfoque e ordem.</div></> : panel === 'layers' ? <><div className="studio-panel-heading"><div><span>{activeFilename}</span><strong>Camadas</strong></div></div><p className="studio-layer-hint">Topo da lista = na frente. Arraste uma camada para reordenar ou use as setas. Ctrl+clique soma à seleção, Shift+clique seleciona uma faixa.</p><div className="studio-layer-list">{[...layerList].reverse().map(({ element, index }, position) => {
            const number = layerList.length - position;
            const movable = element.id !== 'background';
            return <div key={element.id} style={element.groupId ? { '--group-hue': groupHue(element.groupId) } : undefined} className={`studio-layer-row ${element.groupId ? 'grouped' : ''} ${selectedIds.includes(element.id) ? 'selected' : ''}${dragOverId === element.id ? 'drop' : ''}`} draggable={movable} onDragStart={event => { setDragLayerId(element.id); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => { setDragLayerId(null); setDragOverId(null); }} onDragOver={event => { if (dragLayerId && element.id !== dragLayerId) { event.preventDefault(); setDragOverId(element.id); } }} onDrop={event => { event.preventDefault(); if (dragLayerId && dragLayerId !== element.id) reorderElement(dragLayerId, { to: index }); setDragLayerId(null); setDragOverId(null); }}>
              <button type="button" className="studio-layer" onClick={event => { if (element.groupId && event.target.closest?.('.studio-layer-chip')) { setSelectedIds(expandToGroups(activeDocument.elements, [element.id])); return; } selectLayer(element.id, event); }}><b className="studio-layer-number">{number}</b><span>{element.type === 'text' ? 'T' : element.type === 'image' ? '▧' : element.type === 'texture' ? '░' : element.type === 'symbol' ? '⌁' : '□'}</span><strong title={element.name}>{element.name}</strong>{element.groupId && <em className="studio-layer-chip" title="Clique para selecionar o grupo todo">{element.groupName || 'Grupo'}</em>}</button>
              <div className="studio-layer-controls">
                <button type="button" aria-label={element.visible ? 'Ocultar camada' : 'Mostrar camada'} title={element.visible ? 'Ocultar' : 'Mostrar'} onClick={() => updateElement(activeFilename, element.id, { visible: !element.visible })}>{element.visible ? '◉' : '○'}</button>
                <button type="button" aria-label={element.locked ? 'Desbloquear camada' : 'Bloquear camada'} title={element.locked ? 'Desbloquear' : 'Bloquear'} onClick={() => updateElement(activeFilename, element.id, { locked: !element.locked })}>{element.locked ? '⌑' : '⌓'}</button>
                <button type="button" aria-label="Subir camada" title="Subir (para frente)" disabled={!movable || position === 0} onClick={() => reorderElement(element.id, 'swap-up')}>▲</button>
                <button type="button" aria-label="Descer camada" title="Descer (para trás)" disabled={!movable || number <= 2} onClick={() => reorderElement(element.id, 'swap-down')}>▼</button>
              </div>
            </div>;
          })}</div></> : <>
            <div className="studio-panel-heading"><div><span>{activeFilename}</span><strong>{multi ? selectionLabel : selected?.name || 'Selecione um elemento'}</strong></div></div>
            {activeDocument?.legacyFlattened && !selected && !multi ?<div className="studio-legacy-card"><strong>Arte antiga preservada</strong><p>Ela foi criada como uma imagem única. Converta somente se quiser reconstruir título, texto e assinatura como camadas.</p><button type="button" onClick={convertLegacy}>Converter em camadas</button></div> : multi ? <div className="studio-inspector studio-multi">
              <div className="studio-multi-summary"><strong>{wholeGroup ? 'Grupo' : 'Seleção múltipla'}</strong><span>{selectedElements.length} elementos · {['text', 'image', 'shape', 'texture', 'symbol'].map(type => [type, selectedElements.filter(element => element.type === type).length]).filter(([, count]) => count).map(([type, count]) => `${count} ${({ text: 'texto', image: 'imagem', shape: 'forma', texture: 'textura', symbol: 'símbolo' })[type]}${count > 1 ? 's' : ''}`).join(', ')}</span></div>
              {wholeGroup && <label>Nome do grupo<input type="text" value={selectedElements[0].groupName || ''} onFocus={commitSnapshot} onChange={event => renameSelectedGroup(event.target.value)} /></label>}
              <div className="studio-inline-actions"><button type="button" disabled={!canGroup} onClick={groupSelected}>▣ Agrupar <kbd>Ctrl G</kbd></button><button type="button" disabled={!selectedElements.some(element => element.groupId)} onClick={ungroupSelected}>▢ Desagrupar <kbd>Ctrl ⇧ G</kbd></button></div>
              <div className="studio-multi-section"><span>Alinhar {selectedElements.length > 1 ? 'entre si' : 'à página'}</span><div className="studio-align-grid">{ALIGN_ACTIONS.map(action => <button type="button" key={action.mode} title={action.label} aria-label={action.label} onClick={() => alignSelection(action.mode)}>{action.glyph}</button>)}</div></div>
              <div className="studio-inline-actions"><button type="button" disabled={selectedElements.length < 3} onClick={() => distributeSelection('h')}>⇹ Distribuir H</button><button type="button" disabled={selectedElements.length < 3} onClick={() => distributeSelection('v')}>⇳ Distribuir V</button></div>
              <label>Opacidade de todos<input type="range" min="0" max="1" step="0.05" value={selectedElements.reduce((sum, element) => sum + (element.opacity ?? 1), 0) / selectedElements.length} onPointerDown={commitSnapshot} onChange={event => patchSelection(() => ({ opacity: Number(event.target.value) }), false)} /></label>
              {(allText || allShapes) && <label>{allText ? 'Cor de todos os textos' : 'Cor de todas as formas'}<input type="color" value={(() => { const c = allText ? selectedElements[0].color : selectedElements[0].fill; return /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#ffffff'; })()} onFocus={commitSnapshot} onChange={event => patchSelection(() => allText ? { color: event.target.value } : { fill: event.target.value }, false)} /></label>}
              <div className="studio-multi-section"><span>Ordem das camadas</span></div>
              <div className="studio-inline-actions"><button type="button" onClick={() => reorderElement(selectedIds, 'back')}>Enviar ao fundo</button><button type="button" onClick={() => reorderElement(selectedIds, 'backward')}>Recuar</button></div>
              <div className="studio-inline-actions"><button type="button" onClick={() => reorderElement(selectedIds, 'forward')}>Avançar</button><button type="button" onClick={() => reorderElement(selectedIds, 'front')}>Trazer à frente</button></div>
              <div className="studio-inline-actions"><button type="button" onClick={toggleLockSelection}>{selectedElements.some(element => !element.locked) ? 'Bloquear todos' : 'Desbloquear todos'}</button><button type="button" onClick={duplicateSelected}>Duplicar</button></div>
              <button type="button" className="studio-delete-action" onClick={removeSelected}>Remover {selectedElements.length} elementos</button>
              <div className="studio-info-card">Arraste qualquer item para mover todos. As alças do quadro redimensionam tudo junto (texto inclusive). Duplo clique em um grupo entra nele; Alt desliga os ímãs de alinhamento.</div>
            </div> : selected ? <div className="studio-inspector">
              {selected.type === 'text' && <><label>Conteúdo<textarea value={selected.content} onChange={event => updateElement(activeFilename, selected.id, { content: event.target.value })} /></label><label>Fonte<select value={selected.fontFamily} onChange={event => updateElement(activeFilename, selected.id, { fontFamily: event.target.value })}>{FONT_OPTIONS.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}</select></label><div className="studio-field-row"><label>Tamanho<input type="number" value={selected.fontSize} min="10" max="240" onChange={event => updateElement(activeFilename, selected.id, { fontSize: Number(event.target.value) })} /></label><label>Entrelinha<input type="number" step="0.05" value={selected.lineHeight} min="0.7" max="2" onChange={event => updateElement(activeFilename, selected.id, { lineHeight: Number(event.target.value) })} /></label></div><div className="studio-field-row"><label>Cor<input type="color" value={selected.color} onChange={event => updateElement(activeFilename, selected.id, { color: event.target.value })} /></label><label>Alinhamento<select value={selected.align} onChange={event => updateElement(activeFilename, selected.id, { align: event.target.value })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label></div></>}
              {selected.type === 'shape' && <><label>Cor da forma<input type="color" value={selected.fill === 'transparent' ? '#ffffff' : selected.fill} onChange={event => updateElement(activeFilename, selected.id, { fill: event.target.value })} /></label><label>Cantos<input type="range" min="0" max="540" value={selected.radius || 0} onChange={event => updateElement(activeFilename, selected.id, { radius: Number(event.target.value) })} /></label><label>Desfoque<input type="range" min="0" max="50" value={selected.blur || 0} onChange={event => updateElement(activeFilename, selected.id, { blur: Number(event.target.value) })} /></label></>}
              {selected.type === 'symbol' && <><label>Cor do símbolo<input type="color" value={selected.color || '#f4efe5'} onChange={event => updateElement(activeFilename, selected.id, { color: event.target.value })} /></label><label>Espessura<input type="range" min="1" max="18" value={selected.strokeWidth || 4} onChange={event => updateElement(activeFilename, selected.id, { strokeWidth: Number(event.target.value) })} /></label>{selected.symbolKind === 'ruler' && <label>Marcações<input type="range" min="3" max="24" value={selected.density || 9} onChange={event => updateElement(activeFilename, selected.id, { density: Number(event.target.value) })} /></label>}</>}
              {selected.type === 'texture' && <><label>Cor da textura<input type="color" value={selected.color || '#30261f'} onChange={event => updateElement(activeFilename, selected.id, { color: event.target.value })} /></label><label>Intensidade<input type="range" min="0.02" max="0.8" step="0.02" value={selected.intensity || .14} onChange={event => updateElement(activeFilename, selected.id, { intensity: Number(event.target.value) })} /></label><label>Mesclagem<select value={selected.blendMode || 'multiply'} onChange={event => updateElement(activeFilename, selected.id, { blendMode: event.target.value })}><option value="multiply">Multiplicar</option><option value="overlay">Sobrepor</option><option value="soft-light">Luz suave</option><option value="normal">Normal</option></select></label></>}
              {selected.type === 'image' && <><div className="studio-image-drag-hint"><strong>{cropModeId === selected.id ? 'Modo de recorte ativo' : selected.id === 'background' ? 'Arraste para reposicionar o fundo' : 'Arraste para mover a camada'}</strong><span>Use as quatro alças para aumentar ou diminuir. Duplo clique alterna o recorte interno.</span></div>{selected.id === 'background' && <button type="button" className="studio-wide-action" onClick={detachBackground}>↗ Transformar em camada livre</button>}<div className="studio-field-row"><label>X<input type="number" value={Math.round(selected.x)} onChange={event => updateElement(activeFilename, selected.id, { x: Number(event.target.value) })} /></label><label>Y<input type="number" value={Math.round(selected.y)} onChange={event => updateElement(activeFilename, selected.id, { y: Number(event.target.value) })} /></label></div><div className="studio-field-row"><label>Largura<input type="number" min="40" value={Math.round(selected.width)} onChange={event => updateElement(activeFilename, selected.id, { width: Number(event.target.value) })} /></label><label>Altura<input type="number" min="24" value={Math.round(selected.height)} onChange={event => updateElement(activeFilename, selected.id, { height: Number(event.target.value) })} /></label></div>{selected.id !== 'background' && <button type="button" className={`studio-wide-action ${selected.aspectLocked !== false ? 'active' : ''}`} onClick={() => updateElement(activeFilename, selected.id, { aspectLocked: selected.aspectLocked === false })}>{selected.aspectLocked !== false ? '🔒 Proporção preservada' : '🔓 Proporção livre'}</button>}<label>Encaixe<select value={selected.fit || 'cover'} onChange={event => { updateElement(activeFilename, selected.id, { fit: event.target.value }); if (event.target.value === 'contain') setCropModeId(null); }}><option value="cover">Preencher moldura</option><option value="contain">Mostrar imagem inteira</option></select></label><label>Cantos arredondados <span>{Math.round(selected.radius || 0)} px</span><input type="range" min="0" max="540" value={selected.radius || 0} onChange={event => updateElement(activeFilename, selected.id, { radius: Number(event.target.value) })} /></label><label>Posição horizontal <span>{Math.round(positionValue(selected.focusX))}%</span><input type="range" min="0" max="100" value={positionValue(selected.focusX)} onChange={event => updateElement(activeFilename, selected.id, { focusX: Number(event.target.value) })} /></label><label>Posição vertical <span>{Math.round(positionValue(selected.focusY))}%</span><input type="range" min="0" max="100" value={positionValue(selected.focusY)} onChange={event => updateElement(activeFilename, selected.id, { focusY: Number(event.target.value) })} /></label><label>Desfoque<input type="range" min="0" max="40" value={selected.blur || 0} onChange={event => updateElement(activeFilename, selected.id, { blur: Number(event.target.value) })} /></label><div className="studio-field-row"><label>Contraste<input type="range" min="50" max="160" value={selected.contrast || 100} onChange={event => updateElement(activeFilename, selected.id, { contrast: Number(event.target.value) })} /></label><label>Saturação<input type="range" min="0" max="180" value={selected.saturation || 100} onChange={event => updateElement(activeFilename, selected.id, { saturation: Number(event.target.value) })} /></label></div><div className="studio-upload-choices"><button type="button" onClick={() => openUpload(selected.id === 'background' ? 'background' : 'replace')}>↑ Enviar substituta</button><button type="button" onClick={() => setPanel('library')}>Abrir Biblioteca</button></div></>}
              <div className="studio-field-row"><label>Opacidade<input type="range" min="0" max="1" step="0.05" value={selected.opacity ?? 1} onChange={event => updateElement(activeFilename, selected.id, { opacity: Number(event.target.value) })} /></label><label>Rotação<input type="number" min="-180" max="180" value={selected.rotation || 0} onChange={event => updateElement(activeFilename, selected.id, { rotation: Number(event.target.value) })} /></label></div>
              <div className="studio-inline-actions"><button type="button" onClick={() => updateElement(activeFilename, selected.id, { locked: !selected.locked })}>{selected.locked ? 'Desbloquear' : 'Bloquear'}</button><button type="button" onClick={() => updateElement(activeFilename, selected.id, { visible: !selected.visible })}>{selected.visible ? 'Ocultar' : 'Mostrar'}</button></div>{selected.id !== 'background' && <><div className="studio-layer-position">Camada {selectedLayerNumber} de {layerList.length} <small>(1 = mais ao fundo)</small></div><div className="studio-inline-actions"><button type="button" onClick={() => reorderElement(selected.id, 'back')}>Enviar ao fundo</button><button type="button" onClick={() => reorderElement(selected.id, 'backward')}>Recuar</button></div><div className="studio-inline-actions"><button type="button" onClick={() => reorderElement(selected.id, 'forward')}>Avançar</button><button type="button" onClick={() => reorderElement(selected.id, 'front')}>Trazer à frente</button></div></>}{!selected.locked && <button type="button" className="studio-delete-action" onClick={removeSelected}>Remover elemento</button>}
            </div> : <div className="studio-empty-state">Clique em qualquer texto, imagem ou forma. Selecionar nunca altera o design.</div>}
          </>}
        </aside>
        <main className="studio-workspace" onPointerDown={() => setSelectedId(null)}><div className="studio-pages-column">{pages.map((page, index) => {
          const pageDocument = documents[page.filename]; if (!pageDocument) return null;
          const editableElements = pageDocument.elements.filter(element => element.id !== 'background');
          const pageLocked = editableElements.length > 0 && editableElements.every(element => element.locked);
          return <section key={page.filename} ref={node => { pageRefs.current[page.filename] = node; }} className={`studio-page-block ${activeFilename === page.filename ? 'active' : ''}`} onPointerDown={() => activatePage(page.filename)}><div className="studio-page-label"><div><strong>Página {index + 1}</strong><small>{dirty.has(page.filename) ? 'Alterada' : 'Salva'}</small></div><nav aria-label={`Ações da página ${index + 1}`} onPointerDown={event => event.stopPropagation()}><button type="button" onClick={() => copyPageDesign(page.filename)} title="Copiar o design completo desta página">□ Copiar</button><button type="button" disabled={!hasPageClipboard} onClick={() => pastePageDesign(page.filename)} title="Colar o design copiado nesta página">▣ Colar</button><button type="button" className={pageLocked ? 'active' : ''} onClick={() => togglePageLock(page.filename)} title={pageLocked ? 'Desbloquear elementos desta página' : 'Bloquear elementos desta página'}>{pageLocked ? '🔒 Desbloquear' : '♢ Bloquear'}</button></nav></div><div className="studio-canvas-frame" style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}><div className="studio-canvas" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})`, background: pageDocument.background }} onPointerDown={event => beginMarquee(event, page.filename)}>{pageDocument.elements.map((element, layerIndex) => <ElementView key={element.id} element={element} layerIndex={layerIndex} selected={activeFilename === page.filename && selectedIds.includes(element.id)} multi={activeFilename === page.filename && multi && selectedIds.includes(element.id)} cropMode={activeFilename === page.filename && cropModeId === element.id} scale={scale} onSelect={id => selectOnly(page.filename, id)} onMoveStart={(event, id) => beginMove(event, id, page.filename)} onBackdropDown={(event, id) => beginMarquee(event, page.filename, id)} onIsolate={id => selectOnly(page.filename, id)} onChange={(id, patchValue, commit) => updateElement(page.filename, id, patchValue, commit)} onBegin={commitSnapshot} onToggleCrop={id => setCropModeId(current => current === id ? null : id)} />)}
            {activeFilename === page.filename && partialGroups.map(group => <div key={group.id} className="studio-group-outline" style={{ left: group.box.x, top: group.box.y, width: group.box.width, height: group.box.height, borderWidth: 2 / scale }}><span>{group.name}</span></div>)}
            {activeFilename === page.filename && selectionBox && <div className={`studio-selection-box ${wholeGroup ? 'is-group' : ''}`} style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.width, height: selectionBox.height, borderWidth: 2.5 / scale }}><span className="studio-selection-label">{selectionLabel}</span>{['nw', 'ne', 'sw', 'se'].map(handle => <button type="button" key={handle} aria-label={`Redimensionar a seleção pela alça ${handle}`} className={`studio-resize-handle ${handle}`} onPointerDown={event => beginGroupResize(event, handle)} />)}</div>}
            {guides?.page === page.filename && <>{guides.x != null && <i className="studio-guide vertical" style={{ left: guides.x, width: 2 / scale }} />}{guides.y != null && <i className="studio-guide horizontal" style={{ top: guides.y, height: 2 / scale }} />}</>}
            {marquee?.page === page.filename && <div className="studio-marquee" style={{ left: marquee.x, top: marquee.y, width: marquee.width, height: marquee.height, borderWidth: 1.5 / scale }} />}
          </div></div></section>;
        })}</div><div className="studio-zoom"><button type="button" onClick={() => setZoom(value => clamp(value - 5, 20, 65))}>−</button><span>{zoom}%</span><button type="button" onClick={() => setZoom(value => clamp(value + 5, 20, 65))}>+</button></div></main>
      </div>
      <footer className="studio-pages"><div className="studio-page-strip">{pages.map((page, index) => <button type="button" key={page.filename} className={`studio-page-thumb ${activeFilename === page.filename ? 'active' : ''}`} onClick={() => scrollToPage(page.filename)}><img src={page.imageUrl} alt={`Lâmina ${index + 1}`} /><span>{index + 1}</span></button>)}</div><span className="studio-tip">T texto · Ctrl+clique ou arraste no vazio seleciona vários · Ctrl+G agrupa · Ctrl+A tudo · Alt solta os ímãs · Shift+seta move 10 px</span></footer>
    </div>
  );
}
