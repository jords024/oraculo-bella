export const PRESET_DEFAULTS = {
  bella_organico_terracota: { title: 78, body: 36 },
  bella_verde_musgo: { title: 78, body: 36 },
  bella_ambar_sagrado: { title: 78, body: 36 },
  brands_decoded_principal: { title: 84, body: 36 },
  brands_decoded_autoral: { title: 80, body: 36 },
  manuscrito_sagrado: { title: 76, body: 40 },
  sagrado: { title: 76, body: 40 },
  cinematografico: { title: 76, body: 40 },
  cinematografico_crimson: { title: 84, body: 38 },
  esoterico_minimalista: { title: 72, body: 38 },
  dramatico: { title: 84, body: 40 },
  etereo_luminoso: { title: 76, body: 40 },
  revelacao: { title: 76, body: 40 },
  cosmico: { title: 76, body: 40 }
};

export const parseFontSize = (val, fallback) => {
  if (val === undefined || val === null || String(val).trim() === '') return fallback;
  const parsed = parseInt(String(val).replace(/px/gi, ''), 10);
  return isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

export const getDefaultPositions = (layout) => {
  let defaultTitleY = 900;
  let defaultBodyY = 980;

  if (layout === 'brands_cover') {
    defaultTitleY = 820;
    defaultBodyY = 1040;
  } else if (layout === 'brands_split') {
    defaultTitleY = 132;
    defaultBodyY = 1010;
  } else if (layout === 'brands_editorial') {
    defaultTitleY = 110;
    defaultBodyY = 950;
  } else if (layout === 'brands_outro') {
    defaultTitleY = 700;
    defaultBodyY = 860;
  } else if (layout === 'dramatico') {
    defaultTitleY = 890;
    defaultBodyY = 970;
  } else if (layout === 'etereo') {
    defaultTitleY = 950;
    defaultBodyY = 1030;
  } else if (layout === 'text_only') {
    defaultTitleY = 460;
    defaultBodyY = 600;
  } else if (layout === 'card') {
    defaultTitleY = 720;
    defaultBodyY = 800;
  }

  return { defaultTitleY, defaultBodyY };
};
