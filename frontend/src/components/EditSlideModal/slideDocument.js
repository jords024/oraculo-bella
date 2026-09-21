const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

const numberOr = (value, fallback) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const defaultEditableElements = (meta = {}, imageUrl = '') => {
  const titleY = numberOr(meta.title_y, 150);
  const bodyY = numberOr(meta.body_y, 890);
  const titleSize = numberOr(meta.title_px, 76);
  const bodySize = numberOr(meta.body_px, 40);
  const watermarkX = numberOr(meta.watermark_x, 84);
  const watermarkY = numberOr(meta.watermark_y, 48);

  return [
    {
      id: 'background', type: 'image', name: 'Imagem de fundo', src: imageUrl,
      x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
      rotation: 0, opacity: 1, locked: true, visible: true, fit: 'cover'
    },
    {
      id: 'title', type: 'text', name: 'Título', content: meta.title || 'Título da lâmina',
      x: 84, y: titleY, width: 912, height: 260,
      rotation: 0, opacity: 1, locked: false, visible: true,
      fontFamily: 'Georgia, serif', fontSize: titleSize, fontWeight: 500,
      fontStyle: 'normal', lineHeight: 0.98, letterSpacing: -1,
      color: '#f7f2ea', align: 'left'
    },
    {
      id: 'body', type: 'text', name: 'Texto', content: meta.body || 'Texto complementar',
      x: 84, y: bodyY, width: 600, height: 240,
      rotation: 0, opacity: 1, locked: false, visible: true,
      fontFamily: 'Arial, sans-serif', fontSize: bodySize, fontWeight: 400,
      fontStyle: 'normal', lineHeight: 1.25, letterSpacing: 0,
      color: '#ffffff', align: 'left'
    },
    {
      id: 'watermark', type: 'text', name: 'Assinatura',
      content: meta.watermark_text || 'ISABELLA DALCIN',
      x: watermarkX, y: watermarkY, width: 320, height: 44,
      rotation: 0, opacity: 0.82, locked: false,
      visible: meta.watermark_pos !== 'hidden',
      fontFamily: 'Arial, sans-serif', fontSize: 22, fontWeight: 500,
      fontStyle: 'normal', lineHeight: 1.1, letterSpacing: 2,
      color: '#ffffff', align: 'left'
    }
  ];
};

export const createEditableSlideDocument = (meta = {}, imageUrl = '') => ({
  version: 1,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  background: '#2d241f',
  elements: defaultEditableElements(meta, imageUrl)
});

export const createSlideDocument = (meta = {}, rawImageUrl = '', finalImageUrl = '') => {
  if (meta.design?.version === 1 && Array.isArray(meta.design.elements)) {
    return {
      ...meta.design,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      elements: meta.design.elements.map(element => ({
        ...element,
        src: element.type === 'image'
          ? (element.src || (element.id === 'background' ? rawImageUrl : ''))
          : element.src
      }))
    };
  }

  return {
    version: 1,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: '#2d241f',
    legacyFlattened: true,
    elements: [{
      id: 'background', type: 'image', name: 'Arte original',
      src: finalImageUrl || rawImageUrl,
      x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
      rotation: 0, opacity: 1, locked: true, visible: true, fit: 'cover'
    }]
  };
};

export const cloneDocument = document => JSON.parse(JSON.stringify(document));

export const documentToLegacyMeta = document => {
  const get = id => document.elements.find(element => element.id === id);
  const title = get('title');
  const body = get('body');
  const watermark = get('watermark');
  return {
    title: title?.content || '',
    body: body?.content || '',
    title_y: Math.round(title?.y || 0),
    body_y: Math.round(body?.y || 0),
    title_px: Math.round(title?.fontSize || 76),
    body_px: Math.round(body?.fontSize || 40),
    watermark_text: watermark?.content || '',
    watermark_pos: watermark?.visible === false ? 'hidden' : 'custom',
    watermark_x: Math.round(watermark?.x || 0),
    watermark_y: Math.round(watermark?.y || 0)
  };
};

export { CANVAS_WIDTH, CANVAS_HEIGHT };
