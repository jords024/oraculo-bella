// Lógica pura da multisseleção do Estúdio (sem React): grupos, caixas, alinhamento, ímãs e escala.
// Cada elemento pode ter `groupId` e `groupName`; a ordem do array continua sendo a ordem de pintura.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './slideDocument';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const isSourceElement = element => element?.visible === false && element?.locked && String(element?.name || '').startsWith('Texto completo');

// Elementos que o usuário pode escolher com o mouse (fundo e texto-fonte oculto ficam de fora).
export const isPickable = element => element && element.id !== 'background' && element.visible !== false && !isSourceElement(element);

export const makeGroupId = () => `group-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const groupMembers = (elements, groupId) => groupId ? elements.filter(element => element.groupId === groupId) : [];

// Clicar em um membro seleciona o grupo inteiro; fora de grupo, só o próprio elemento.
export const expandToGroups = (elements, ids) => {
  const result = new Set();
  ids.forEach(id => {
    const element = elements.find(item => item.id === id);
    if (!element) return;
    if (element.groupId) groupMembers(elements, element.groupId).forEach(member => result.add(member.id));
    else result.add(element.id);
  });
  return [...result];
};

export const boundsOf = items => {
  if (!items.length) return null;
  const x0 = Math.min(...items.map(item => item.x));
  const y0 = Math.min(...items.map(item => item.y));
  const x1 = Math.max(...items.map(item => item.x + item.width));
  const y1 = Math.max(...items.map(item => item.y + item.height));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
};

export const nextGroupName = elements => {
  const names = new Set(elements.filter(element => element.groupId).map(element => element.groupName));
  let n = 1;
  while (names.has(`Grupo ${n}`)) n += 1;
  return `Grupo ${n}`;
};

// Agrupa: os membros ficam juntos na pilha, na altura do que estava mais à frente, mantendo a ordem relativa.
export const groupElements = (elements, ids, name) => {
  const picked = elements.filter(element => ids.includes(element.id) && isPickable(element));
  if (picked.length < 2) return { elements, groupId: null };
  const groupId = makeGroupId();
  const groupName = name || nextGroupName(elements);
  const topIndex = Math.max(...picked.map(element => elements.indexOf(element)));
  const pickedIds = new Set(picked.map(element => element.id));
  const before = elements.slice(0, topIndex + 1).filter(element => !pickedIds.has(element.id));
  const after = elements.slice(topIndex + 1).filter(element => !pickedIds.has(element.id));
  const grouped = picked.map(element => ({ ...element, groupId, groupName }));
  return { elements: [...before, ...grouped, ...after], groupId };
};

export const ungroupElements = (elements, ids) => {
  const groupIds = new Set(elements.filter(element => ids.includes(element.id) && element.groupId).map(element => element.groupId));
  if (!groupIds.size) return elements;
  return elements.map(element => groupIds.has(element.groupId) ? { ...element, groupId: undefined, groupName: undefined } : element);
};

export const renameGroup = (elements, groupId, name) => elements.map(element => element.groupId === groupId ? { ...element, groupName: name } : element);

// Mover/duplicar/colar nunca devem deixar o id de grupo antigo vazar: cada cópia ganha grupos novos.
export const cloneWithNewGroups = (items, makeId) => {
  const remap = new Map();
  const counts = new Map();
  items.forEach(item => { if (item.groupId) counts.set(item.groupId, (counts.get(item.groupId) || 0) + 1); });
  return items.map(item => {
    const copy = { ...item, id: makeId(item.type) };
    if (item.groupId) {
      // Um membro solto de um grupo, copiado sozinho, não forma grupo.
      if (counts.get(item.groupId) < 2) { delete copy.groupId; delete copy.groupName; return copy; }
      if (!remap.has(item.groupId)) remap.set(item.groupId, makeGroupId());
      copy.groupId = remap.get(item.groupId);
    }
    return copy;
  });
};

// Alinha à caixa da seleção (vários) ou à página (um só).
export const alignElements = (elements, ids, mode) => {
  const targets = elements.filter(element => ids.includes(element.id) && !element.locked && isPickable(element));
  if (!targets.length) return {};
  const ref = targets.length > 1 ? boundsOf(targets) : { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  const patches = {};
  targets.forEach(element => {
    if (mode === 'left') patches[element.id] = { x: Math.round(ref.x) };
    if (mode === 'center') patches[element.id] = { x: Math.round(ref.x + (ref.width - element.width) / 2) };
    if (mode === 'right') patches[element.id] = { x: Math.round(ref.x + ref.width - element.width) };
    if (mode === 'top') patches[element.id] = { y: Math.round(ref.y) };
    if (mode === 'middle') patches[element.id] = { y: Math.round(ref.y + (ref.height - element.height) / 2) };
    if (mode === 'bottom') patches[element.id] = { y: Math.round(ref.y + ref.height - element.height) };
  });
  return patches;
};

// Distribui o espaço livre igualmente entre três ou mais elementos.
export const distributeElements = (elements, ids, axis) => {
  const targets = elements.filter(element => ids.includes(element.id) && !element.locked && isPickable(element));
  if (targets.length < 3) return {};
  const pos = axis === 'h' ? 'x' : 'y';
  const size = axis === 'h' ? 'width' : 'height';
  const sorted = [...targets].sort((a, b) => a[pos] - b[pos]);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const total = last[pos] + last[size] - first[pos];
  const used = sorted.reduce((sum, element) => sum + element[size], 0);
  const gap = (total - used) / (sorted.length - 1);
  const patches = {};
  let cursor = first[pos] + first[size] + gap;
  sorted.slice(1, -1).forEach(element => {
    patches[element.id] = { [pos]: Math.round(cursor) };
    cursor += element[size] + gap;
  });
  return patches;
};

// Ímãs: encosta a caixa em movimento nas bordas/centro da página e dos outros elementos.
export const snapMove = (box, others, threshold) => {
  const xs = [0, CANVAS_WIDTH / 2, CANVAS_WIDTH];
  const ys = [0, CANVAS_HEIGHT / 2, CANVAS_HEIGHT];
  others.forEach(item => {
    xs.push(item.x, item.x + item.width / 2, item.x + item.width);
    ys.push(item.y, item.y + item.height / 2, item.y + item.height);
  });
  const best = (points, targets) => {
    let pick = null;
    points.forEach(point => targets.forEach(target => {
      const diff = target - point;
      if (Math.abs(diff) <= threshold && (!pick || Math.abs(diff) < Math.abs(pick.diff))) pick = { diff, at: target };
    }));
    return pick;
  };
  const sx = best([box.x, box.x + box.width / 2, box.x + box.width], xs);
  const sy = best([box.y, box.y + box.height / 2, box.y + box.height], ys);
  return { dx: sx ? sx.diff : 0, dy: sy ? sy.diff : 0, guideX: sx ? sx.at : null, guideY: sy ? sy.at : null };
};

// Escala uniforme da seleção em torno de uma âncora (o canto oposto à alça).
export const scaleElements = (starts, anchor, factor) => {
  const patches = {};
  starts.forEach(element => {
    const patch = {
      x: Math.round(anchor.x + (element.x - anchor.x) * factor),
      y: Math.round(anchor.y + (element.y - anchor.y) * factor),
      width: Math.max(8, Math.round(element.width * factor)),
      height: Math.max(8, Math.round(element.height * factor))
    };
    if (element.type === 'text') {
      patch.fontSize = Math.max(8, Math.round((Number(element.fontSize) || 40) * factor));
      if (element.letterSpacing) patch.letterSpacing = Math.round(Number(element.letterSpacing) * factor * 100) / 100;
    }
    if (element.strokeWidth) patch.strokeWidth = Math.max(1, Math.round(Number(element.strokeWidth) * factor));
    if (element.radius) patch.radius = Math.round(Number(element.radius) * factor);
    if (element.blur) patch.blur = Math.round(Number(element.blur) * factor);
    patches[element.id] = patch;
  });
  return patches;
};

export const rectsIntersect = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

export const normalizeRect = (x0, y0, x1, y1) => ({ x: Math.min(x0, x1), y: Math.min(y0, y1), width: Math.abs(x1 - x0), height: Math.abs(y1 - y0) });

// Elementos tocados pelo retângulo de seleção (bloqueados ficam de fora, como no Canva).
export const pickInRect = (elements, rect) => elements.filter(element => isPickable(element) && !element.locked && rectsIntersect(rect, element)).map(element => element.id);

// Cor estável por grupo, para as faixas na lista de camadas.
export const groupHue = groupId => {
  let hash = 0;
  String(groupId || '').split('').forEach(char => { hash = (hash * 31 + char.charCodeAt(0)) % 360; });
  return hash;
};

export const clampMove = (box, dx, dy) => ({
  dx: clamp(dx, -(box.x + box.width - 28), CANVAS_WIDTH - 28 - box.x),
  dy: clamp(dy, -(box.y + box.height - 28), CANVAS_HEIGHT - 28 - box.y)
});
