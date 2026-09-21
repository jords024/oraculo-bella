"use strict";

const { C, W, H, makeShadow, slideBase, addDecorativeBars, addTitle } = require("../helpers");

// ─── SLIDE 01 — CAPA ────────────────────────────────────────────────────────
function slide01(pres) {
  const slide = pres.addSlide();
  slide.background = { color: C.bg };

  // top gold bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { color: C.gold }, line: { color: C.gold },
  });
  // bottom teal bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: H - 0.06, w: W, h: 0.06,
    fill: { color: C.teal }, line: { color: C.teal },
  });
  // left vertical gold line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 0, w: 0.03, h: H,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  // brand label top-left
  slide.addText("Afonteoculta", {
    x: 0.65, y: 0.12, w: 3, h: 0.28,
    fontFace: "Calibri", fontSize: 11, italic: true,
    color: C.muted, align: "left", margin: 0,
  });

  // main title
  slide.addText("SISTEMA AUTÔNOMO\nDE CRIAÇÃO DE CONTEÚDO", {
    x: 0.65, y: 1.05, w: 6.8, h: 2.0,
    fontFace: "Georgia", fontSize: 38, bold: true,
    color: C.gold, align: "left", valign: "top",
  });

  // subtitle
  slide.addText(
    "Como geramos carrosséis virais com inteligência artificial\n— sem aprovação humana em cada etapa",
    {
      x: 0.65, y: 3.15, w: 6.5, h: 0.85,
      fontFace: "Calibri", fontSize: 14,
      color: C.white, align: "left", valign: "top",
    }
  );

  // footer pipeline
  slide.addText(
    "Pipeline de Agentes · Oráculo Revisor · Nano Banana 2 · Visual Style Guide",
    {
      x: 0.65, y: H - 0.52, w: 8, h: 0.32,
      fontFace: "Calibri", fontSize: 10,
      color: C.muted, align: "left", margin: 0,
    }
  );

  // decorative circles right side — teal (outer)
  slide.addShape(pres.shapes.OVAL, {
    x: 7.6, y: 0.5, w: 2.2, h: 2.2,
    fill: { color: C.teal, transparency: 82 },
    line: { color: C.teal, width: 1 },
  });
  // decorative circle — gold (inner)
  slide.addShape(pres.shapes.OVAL, {
    x: 8.1, y: 1.5, w: 1.6, h: 1.6,
    fill: { color: C.gold, transparency: 82 },
    line: { color: C.gold, width: 1 },
  });
}

// ─── SLIDE 02 — O QUE É O SISTEMA ──────────────────────────────────────────
function slide02(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "O Sistema de Agentes", { fontSize: 20 });

  // subtitle
  slide.addText(
    "Um sistema de agentes que cria, revisa e publica conteúdo sem aprovação em cada etapa",
    {
      x: 0.65, y: 0.88, w: 8.8, h: 0.38,
      fontFace: "Calibri", fontSize: 12, color: C.white,
      align: "left", margin: 0,
    }
  );

  // 3 column cards
  const cols = [
    {
      title: "COPY", icon: "✍", titleColor: C.gold,
      body: "Hook Forge · Humanizer · Copy Squad criam a narrativa completa com gatilhos psicológicos calibrados",
    },
    {
      title: "REVISÃO", icon: "✓", titleColor: C.teal,
      body: "Oráculo Revisor avalia 5 critérios com pontuação 1-3 cada. Aprova, reescreve ou escala para humano",
    },
    {
      title: "VISUAL", icon: "★", titleColor: C.gold,
      body: "Prompt Engineer → Nano Banana 2 → Design Compositor. Imagem + texto compostos automaticamente",
    },
  ];

  const cardW = 2.8;
  const cardH = 2.8;
  const cardY = 1.4;
  const startX = 0.65;
  const gap = 0.25;

  cols.forEach((col, i) => {
    const x = startX + i * (cardW + gap);

    // card bg
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: cardY, w: cardW, h: cardH,
      fill: { color: C.bgCard2 },
      line: { color: col.titleColor, width: 1.5 },
      shadow: makeShadow(),
    });

    // top accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: cardY, w: cardW, h: 0.06,
      fill: { color: col.titleColor },
      line: { color: col.titleColor },
    });

    // icon
    slide.addText(col.icon, {
      x, y: cardY + 0.15, w: cardW, h: 0.5,
      fontFace: "Calibri", fontSize: 26,
      color: col.titleColor, align: "center", margin: 0,
    });

    // title
    slide.addText(col.title, {
      x, y: cardY + 0.7, w: cardW, h: 0.38,
      fontFace: "Georgia", fontSize: 16, bold: true,
      color: col.titleColor, align: "center", margin: 0,
    });

    // body
    slide.addText(col.body, {
      x: x + 0.15, y: cardY + 1.15, w: cardW - 0.3, h: 1.5,
      fontFace: "Calibri", fontSize: 11,
      color: C.white, align: "center", valign: "top",
    });
  });

  // result footer bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: 4.55, w: 8.7, h: 0.42,
    fill: { color: C.bgCard }, line: { color: C.gold, width: 1 },
  });
  slide.addText(
    "Resultado: carrosséis prontos para publicar, com score de qualidade documentado",
    {
      x: 0.75, y: 4.55, w: 8.5, h: 0.42,
      fontFace: "Calibri", fontSize: 11, bold: true,
      color: C.gold, align: "center", valign: "middle", margin: 0,
    }
  );
}

// ─── SLIDE 03 — PIPELINE COMPLETO ──────────────────────────────────────────
function slide03(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "Pipeline de Produção — Da ideia ao carrossel publicado", { fontSize: 18 });

  // Helper to draw a flow box
  function flowBox(x, y, label, borderColor) {
    const bw = 1.55, bh = 0.42;
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: bw, h: bh,
      fill: { color: C.bgCard2 },
      line: { color: borderColor, width: 1.5 },
    });
    slide.addText(label, {
      x, y, w: bw, h: bh,
      fontFace: "Calibri", fontSize: 9, bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });
  }

  // Arrow helper (horizontal)
  function arrowH(x, y) {
    slide.addShape(pres.shapes.LINE, {
      x, y, w: 0.22, h: 0,
      line: { color: C.muted, width: 1.5, endArrowType: "arrow" },
    });
  }

  // ── Row 1: Copy ──
  const row1y = 0.98;
  const boxes1 = ["TEMA", "COPY SQUAD", "HOOK FORGE", "HUMANIZER"];
  const bw = 1.55, gap = 0.22;
  const startX1 = 0.65;

  boxes1.forEach((lbl, i) => {
    const x = startX1 + i * (bw + gap);
    flowBox(x, row1y, lbl, C.gold);
    if (i < boxes1.length - 1) arrowH(x + bw, row1y + 0.21);
  });

  // Row 1 label
  slide.addText("COPY", {
    x: 9.0, y: row1y, w: 0.9, h: 0.42,
    fontFace: "Calibri", fontSize: 9, italic: true,
    color: C.gold, align: "right", valign: "middle", margin: 0,
  });

  // ── Arrow down from HUMANIZER to ORÁCULO ──
  const humanizerX = startX1 + 3 * (bw + gap) + bw / 2 - 0.01;
  const row2y = 1.85;
  slide.addShape(pres.shapes.LINE, {
    x: humanizerX, y: row1y + 0.42, w: 0, h: 0.25,
    line: { color: C.muted, width: 1.5, endArrowType: "arrow" },
  });

  // ── Row 2: Revisão ──
  const oraculoX = startX1 + 3 * (bw + gap);
  flowBox(oraculoX, row2y, "ORÁCULO REVISOR", C.teal);

  // Decision branches
  // APROVADO (score 12-15)
  const aprovX = startX1 + 1 * (bw + gap);
  flowBox(aprovX, row2y, "✓ APROVADO\n(score 12-15)", C.tealLight);

  // Arrow from ORÁCULO to APROVADO (left arrow)
  slide.addShape(pres.shapes.LINE, {
    x: aprovX + bw, y: row2y + 0.21, w: oraculoX - aprovX - bw, h: 0,
    line: { color: C.teal, width: 1.5, endArrowType: "arrow" },
  });

  // REESCRITA
  const reesX = startX1 + 2 * (bw + gap);
  flowBox(reesX, row2y + 0.7, "↩ REESCRITA\n(score 8-11, máx 2x)", C.gold);
  slide.addShape(pres.shapes.LINE, {
    x: reesX + bw / 2, y: row2y + 0.42, w: 0, h: 0.28,
    line: { color: C.gold, width: 1.2, endArrowType: "arrow" },
  });

  // ESCALA
  const escX = startX1 + 3 * (bw + gap);
  flowBox(escX, row2y + 0.7, "⚠ ESCALA\n(score <8, humano)", "FF6B6B");
  slide.addShape(pres.shapes.LINE, {
    x: escX + bw / 2, y: row2y + 0.42, w: 0, h: 0.28,
    line: { color: "FF6B6B", width: 1.2, endArrowType: "arrow" },
  });

  // Row 2 label
  slide.addText("REVISÃO", {
    x: 9.0, y: row2y, w: 0.9, h: 0.42,
    fontFace: "Calibri", fontSize: 9, italic: true,
    color: C.teal, align: "right", valign: "middle", margin: 0,
  });

  // ── Row 3: Visual ──
  const row3y = 3.55;
  const boxes3 = ["APROVADO", "PROMPT ENG.", "NANO BANANA 2", "DESIGN COMP.", "NOÇÃO + DASH"];
  const bw3 = 1.5, gap3 = 0.15;
  const startX3 = 0.6;

  // Arrow from APROVADO (row2) down to row3
  const aprovMidX = aprovX + bw / 2;
  slide.addShape(pres.shapes.LINE, {
    x: aprovMidX, y: row2y + 0.42, w: 0, h: row3y - row2y - 0.42,
    line: { color: C.muted, width: 1.5, endArrowType: "arrow" },
  });

  boxes3.forEach((lbl, i) => {
    const x = startX3 + i * (bw3 + gap3);
    const borderC = i === 0 ? C.tealLight : i < 3 ? C.goldLight : C.teal;
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: row3y, w: bw3, h: 0.42,
      fill: { color: C.bgCard2 },
      line: { color: borderC, width: 1.5 },
    });
    slide.addText(lbl, {
      x, y: row3y, w: bw3, h: 0.42,
      fontFace: "Calibri", fontSize: 8.5, bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });
    if (i < boxes3.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: x + bw3, y: row3y + 0.21, w: gap3, h: 0,
        line: { color: C.muted, width: 1.5, endArrowType: "arrow" },
      });
    }
  });

  // Row 3 label
  slide.addText("VISUAL", {
    x: 9.0, y: row3y, w: 0.9, h: 0.42,
    fontFace: "Calibri", fontSize: 9, italic: true,
    color: C.goldLight, align: "right", valign: "middle", margin: 0,
  });
}

// ─── SLIDE 04 — OS AGENTES ──────────────────────────────────────────────────
function slide04(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "Os Agentes e suas Funções", { fontSize: 21 });

  const agents = [
    {
      name: "COPY SQUAD", border: C.gold,
      body: "Escreve os 10 slides com narrativa completa, arco emocional e 15 gatilhos psicológicos calibrados para o avatar.",
    },
    {
      name: "HOOK FORGE", border: C.teal,
      body: "Gera 3 variações de gancho (Paradoxo / Confronto Direto / Inversão de Crença) e seleciona o mais forte.",
    },
    {
      name: "HUMANIZER", border: C.gold,
      body: "Remove traços de IA: elimina travessões, linguagem distante e estruturas artificiais. Mantém voz conectiva.",
    },
    {
      name: "ORÁCULO REVISOR", border: C.teal,
      body: "Avalia 5 critérios com score 1-3 cada. Total 15pts. Aprova autônomo acima de 12. Sem aprovação humana.",
    },
    {
      name: "PROMPT ENGINEER", border: C.gold,
      body: "Transforma o conceito de cada slide em prompt cinematográfico para o Nano Banana 2. Estética dark, minimalista.",
    },
    {
      name: "NANO BANANA 2", border: C.tealLight,
      body: "Modelo Gemini gemini-2.0-flash-exp-image-generation. Gera imagem dark cinematográfica por slide.",
    },
  ];

  const cardW = 2.85, cardH = 1.55;
  const colGap = 0.22, rowGap = 0.18;
  const startX = 0.65, startY = 1.05;

  agents.forEach((ag, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + colGap);
    const y = startY + row * (cardH + rowGap);

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: cardW, h: cardH,
      fill: { color: C.bgCard2 },
      line: { color: ag.border, width: 1.5 },
      shadow: makeShadow(),
    });

    // left accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.06, h: cardH,
      fill: { color: ag.border },
      line: { color: ag.border },
    });

    slide.addText(ag.name, {
      x: x + 0.15, y: y + 0.1, w: cardW - 0.2, h: 0.35,
      fontFace: "Georgia", fontSize: 13, bold: true,
      color: ag.border, align: "left", margin: 0,
    });

    slide.addText(ag.body, {
      x: x + 0.15, y: y + 0.48, w: cardW - 0.25, h: cardH - 0.58,
      fontFace: "Calibri", fontSize: 11,
      color: C.white, align: "left", valign: "top",
    });
  });
}

// ─── SLIDE 05 — ORÁCULO REVISOR ─────────────────────────────────────────────
function slide05(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "Oráculo Revisor — Sistema de Avaliação Autônoma", { fontSize: 19 });

  slide.addText("5 critérios · Score 1-3 cada · Total 15 pts · Decisão automática", {
    x: 0.65, y: 0.85, w: 8.8, h: 0.32,
    fontFace: "Calibri", fontSize: 12, italic: true,
    color: C.muted, align: "left", margin: 0,
  });

  // Criteria table
  const headers = [
    { text: "#", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11 } },
    { text: "Critério", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11 } },
    { text: "O que avalia", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11 } },
    { text: "Score", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11 } },
  ];

  const rows = [
    ["C1", "Gancho Paradoxal", "Provoca crença do seguidor com tensão real", "1-3"],
    ["C2", "Arco Emocional 10 slides", "Validação → Confronto → Revelação → Esperança", "1-3"],
    ["C3", "Raiva Coletiva", "Nomeia o sistema/instituição que sabotou", "1-3"],
    ["C4", 'CTA Tribal "Comente FONTE se..."', "Verbaliza experiência interna específica", "1-3"],
    ["C5", "Slide 10 três camadas", "Cristalização + Ativação Tribal + Portal Sutil", "1-3"],
  ];

  const tableData = [
    headers,
    ...rows.map((r, ri) => {
      const bg = ri % 2 === 0 ? C.bgCard : C.bgCard2;
      return r.map((cell) => ({
        text: cell,
        options: { fill: { color: bg }, color: C.white, fontSize: 10 },
      }));
    }),
  ];

  slide.addTable(tableData, {
    x: 0.65, y: 1.25, w: 8.7,
    border: { pt: 0.5, color: C.border },
    colW: [0.5, 2.1, 4.5, 0.9],
    rowH: 0.38,
  });

  // Decision table
  const decisionY = 3.68;
  slide.addText("Tabela de Decisão", {
    x: 0.65, y: decisionY - 0.28, w: 8.7, h: 0.26,
    fontFace: "Calibri", fontSize: 11, bold: true,
    color: C.gold, align: "left", margin: 0,
  });

  const decisions = [
    { range: "12-15 pts", action: "APROVADO", detail: "Segue para imagens", bg: "0D4F2E", border: "2ECC71" },
    { range: "8-11 pts", action: "REESCRITA", detail: "Volta para Copy Squad (máx 2x)", bg: "4F3A0A", border: C.gold },
    { range: "<8 pts", action: "ESCALA", detail: "Revisão humana obrigatória", bg: "4F0D0D", border: "FF4444" },
  ];

  const dw = 2.8, dh = 0.72;
  decisions.forEach((d, i) => {
    const x = 0.65 + i * (dw + 0.18);
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: decisionY, w: dw, h: dh,
      fill: { color: d.bg },
      line: { color: d.border, width: 1.5 },
    });
    slide.addText([
      { text: d.range + " → ", options: { bold: true, color: d.border, fontSize: 12 } },
      { text: d.action, options: { bold: true, color: C.white, fontSize: 12, breakLine: true } },
      { text: d.detail, options: { color: C.muted, fontSize: 10 } },
    ], {
      x: x + 0.1, y: decisionY, w: dw - 0.2, h: dh,
      fontFace: "Calibri", valign: "middle",
    });
  });
}

// ─── SLIDE 06 — NANO BANANA 2 ───────────────────────────────────────────────
function slide06(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "Geração de Imagem — Do Conceito ao Visual Cinematográfico", { fontSize: 18 });

  // Left column — Prompt Engineer
  const colW = 4.1, colH = 3.4, colY = 1.0;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: colY, w: colW, h: colH,
    fill: { color: C.bgCard2 },
    line: { color: C.gold, width: 1.5 },
    shadow: makeShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: colY, w: colW, h: 0.06,
    fill: { color: C.gold }, line: { color: C.gold },
  });
  slide.addText("Prompt Engineer", {
    x: 0.65, y: colY + 0.12, w: colW, h: 0.36,
    fontFace: "Georgia", fontSize: 15, bold: true,
    color: C.gold, align: "center", margin: 0,
  });
  slide.addText([
    { text: "Recebe: ", options: { bold: true, color: C.gold } },
    { text: "conceito do slide + tema", options: { color: C.white, breakLine: true } },
    { text: "Aplica: ", options: { bold: true, color: C.gold } },
    { text: "Visual Style Guide (DNA da marca)", options: { color: C.white, breakLine: true } },
    { text: "Prefixo obrigatório:", options: { bold: true, color: C.muted, breakLine: true } },
    { text: '"Dark cinematic mystical illustration, single focal point, minimalist..."', options: { italic: true, color: C.muted, fontSize: 10, breakLine: true } },
    { text: "Sufixo: ", options: { bold: true, color: C.muted } },
    { text: '"No text, no words, no letters visible..."', options: { italic: true, color: C.muted, fontSize: 10, breakLine: true } },
    { text: "Output: ", options: { bold: true, color: C.gold } },
    { text: "prompt específico por slide", options: { color: C.white } },
  ], {
    x: 0.8, y: colY + 0.55, w: colW - 0.3, h: colH - 0.65,
    fontFace: "Calibri", fontSize: 11, valign: "top",
  });

  // Right column — Nano Banana 2
  const rightX = 5.2;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: rightX, y: colY, w: colW, h: colH,
    fill: { color: C.bgCard2 },
    line: { color: C.teal, width: 1.5 },
    shadow: makeShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: rightX, y: colY, w: colW, h: 0.06,
    fill: { color: C.teal }, line: { color: C.teal },
  });
  slide.addText("Nano Banana 2", {
    x: rightX, y: colY + 0.12, w: colW, h: 0.36,
    fontFace: "Georgia", fontSize: 15, bold: true,
    color: C.teal, align: "center", margin: 0,
  });
  slide.addText([
    { text: "Modelo: ", options: { bold: true, color: C.teal } },
    { text: "gemini-2.0-flash-exp-image-generation", options: { color: C.white, breakLine: true } },
    { text: "API: ", options: { bold: true, color: C.teal } },
    { text: "Google Generative Language", options: { color: C.white, breakLine: true } },
    { text: "Retry: ", options: { bold: true, color: C.teal } },
    { text: "4 tentativas com backoff exponencial", options: { color: C.white, breakLine: true } },
    { text: "Output: ", options: { bold: true, color: C.teal } },
    { text: "imagem 1080x1350px (formato 4:5 Instagram)", options: { color: C.white, breakLine: true } },
    { text: "Composição: ", options: { bold: true, color: C.teal } },
    { text: "Design Compositor (Python + Pillow)", options: { color: C.white } },
  ], {
    x: rightX + 0.15, y: colY + 0.55, w: colW - 0.25, h: colH - 0.65,
    fontFace: "Calibri", fontSize: 11, valign: "top",
  });

  // Gold footer box
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: 4.52, w: 8.7, h: 0.52,
    fill: { color: C.bgCard },
    line: { color: C.gold, width: 1.5 },
  });
  slide.addText(
    "Resultado: imagem dark cinematográfica + texto com margens corretas (MARGIN=92px) + marca d'água dupla",
    {
      x: 0.75, y: 4.52, w: 8.5, h: 0.52,
      fontFace: "Calibri", fontSize: 11, bold: true,
      color: C.gold, align: "center", valign: "middle", margin: 0,
    }
  );
}

module.exports = {
  slide01,
  slide02,
  slide03,
  slide04,
  slide05,
  slide06
};
