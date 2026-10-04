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
      rotation: 0, opacity: 1, locked: true, visible: true, fit: 'cover', focusX: 50, focusY: 50
    },
    {
      id: 'title', type: 'text', name: 'Título', content: meta.title || 'Título da lâmina',
      x: 84, y: titleY, width: 912, height: 260,
      rotation: 0, opacity: 1, locked: false, visible: true,
      fontFamily: "'Playfair Display', Georgia, serif", fontSize: titleSize, fontWeight: 500,
      fontStyle: 'normal', lineHeight: 0.98, letterSpacing: -1,
      color: '#f7f2ea', align: 'left'
    },
    {
      id: 'body', type: 'text', name: 'Texto', content: meta.body || 'Texto complementar',
      x: 84, y: bodyY, width: 600, height: 240,
      rotation: 0, opacity: 1, locked: false, visible: true,
      fontFamily: "'Inter', Arial, sans-serif", fontSize: bodySize, fontWeight: 400,
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

const essentialDevelopmentMigration = (meta = {}, rawImageUrl = '') => {
  const slideNumber = Number(String(meta.layout || '').match(/(\d+)$/)?.[1] || 0);
  const elements = meta.design?.elements || [];
  const oldFlattenedPhoto = elements.find(element => (
    element.type === 'image'
    && element.id === 'background'
    && !element.sourceRole
    && numberOr(element.width, 0) >= CANVAS_WIDTH
    && numberOr(element.height, 0) >= CANVAS_HEIGHT
  ));
  if (meta.preset !== 'bella_essencial' || ![2, 3].includes(slideNumber) || !oldFlattenedPhoto) return null;

  const dark = slideNumber % 2 === 1;
  const ink = dark ? '#f7f2e9' : '#2a2420';
  const muted = dark ? '#ded4c6' : '#2a2420';
  const image = dark
    ? { x: 56, y: 230, width: 570, height: 820, focusX: 48, focusY: 43, radius: 34 }
    : { x: 548, y: 356, width: 430, height: 650, focusX: 55, focusY: 43, radius: 30 };
  const title = dark
    ? { x: 650, y: 174, width: 390, height: 430, fontSize: 58 }
    : { x: 74, y: 126, width: 460, height: 430, fontSize: 70 };
  const body = dark
    ? { x: 650, y: 720, width: 350, height: 360, fontSize: 31 }
    : { x: 108, y: 720, width: 350, height: 360, fontSize: 29 };

  return {
    version: 1,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: dark ? '#2d241f' : '#f7f2e9',
    migratedFromEssentialV1: true,
    elements: [
      {
        id: 'editorial-image', type: 'image', name: 'Cena editorial', src: rawImageUrl,
        sourceRole: 'raw', ...image, rotation: 0, opacity: 1, locked: false,
        visible: true, fit: 'cover', aspectLocked: true
      },
      {
        id: 'editorial-accent', type: 'shape', name: 'Traço terracota',
        x: dark ? 612 : 74, y: dark ? 190 : 720, width: 8, height: dark ? 160 : 164,
        rotation: 0, opacity: 0.95, locked: false, visible: true,
        fill: '#b8623e', radius: 4, blur: 0, stroke: '', strokeWidth: 0
      },
      {
        id: 'title', type: 'text', name: 'Título', content: meta.title || 'Título da lâmina',
        ...title, rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500,
        fontStyle: 'normal', lineHeight: 0.96, letterSpacing: -1, color: ink, align: 'left'
      },
      {
        id: 'body', type: 'text', name: 'Texto', content: meta.body || 'Texto complementar',
        ...body, rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: "'Inter', Arial, sans-serif", fontWeight: 400,
        fontStyle: 'normal', lineHeight: 1.22, letterSpacing: 0, color: muted, align: 'left'
      },
      {
        id: 'watermark', type: 'text', name: 'Assinatura',
        content: meta.watermark_text || '@ISABELLA.DALCIN', x: 74, y: 42, width: 320, height: 24,
        rotation: 0, opacity: 0.84, locked: false, visible: true,
        fontFamily: "'Inter', Arial, sans-serif", fontSize: 16, fontWeight: 500,
        fontStyle: 'normal', lineHeight: 1.2, letterSpacing: 0, color: ink, align: 'left'
      }
    ]
  };
};

// O gerador às vezes repete ids na mesma lâmina (ex.: várias "sombra-local"). Com ids repetidos, selecionar um
// elemento selecionaria todos os que compartilham o id; aqui cada um ganha um id próprio e estável.
const uniqueIds = elements => {
  const seen = new Map();
  return elements.map((element, index) => {
    const base = String(element.id || `elemento-${index}`);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? element : { ...element, id: `${base}-${count + 1}` };
  });
};

export const createSlideDocument = (meta = {}, rawImageUrl = '', finalImageUrl = '') => {
  const migratedEssential = essentialDevelopmentMigration(meta, rawImageUrl);
  if (migratedEssential) return migratedEssential;

  if (meta.design?.version === 1 && Array.isArray(meta.design.elements)) {
    return {
      ...meta.design,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      elements: uniqueIds(meta.design.elements.map(element => ({
        ...element,
        src: element.type === 'image'
          ? (element.src || (element.sourceRole === 'raw' || element.id === 'background' ? rawImageUrl : ''))
          : element.src
      })))
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
      rotation: 0, opacity: 1, locked: true, visible: true, fit: 'cover', focusX: 50, focusY: 50
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
