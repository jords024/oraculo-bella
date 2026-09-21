"use strict";

const { C, W, H, makeShadow, slideBase, addDecorativeBars, addTitle } = require("../helpers");

// ─── SLIDE 07 — LIÇÕES DO CARROSSEL DE 1M+ ──────────────────────────────────
function slide07(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "A Fórmula do Carrossel Viral — Lições de 1M+ visualizações", { fontSize: 18 });

  const discoveries = [
    {
      title: "COLAGEM, NÃO IA PURA",
      body: "Os slides mais impactantes combinam foto real P&B + overlay geométrico colorido. Não imagem 100% gerada por IA.",
      border: C.gold,
    },
    {
      title: "COLISÃO DE DOIS MUNDOS",
      body: "O gancho une duas verdades que o seguidor conhece mas nunca conectou. 'O que X chama de A, Y chama de B.'",
      border: C.teal,
    },
    {
      title: "FRASE DEVASTADORA",
      body: "Todo carrossel viral tem um slide curto e impactante — a linha que vai nos stories de outras pessoas.",
      border: C.gold,
    },
    {
      title: "RICH TEXT NO CORPO",
      body: "Alternância de bold + italic dentro do parágrafo cria hierarquia de atenção e mantém o olho em movimento.",
      border: C.teal,
    },
  ];

  const cardW = 4.25, cardH = 1.65;
  const gap = 0.18;
  const startX = 0.65, startY = 1.05;

  discoveries.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + gap);

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cardW, h: cardH,
      fill: { color: C.bgCard2 },
      line: { color: d.border, width: 1.5 },
      shadow: makeShadow(),
    });

    // top accent
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cardW, h: 0.06,
      fill: { color: d.border }, line: { color: d.border },
    });

    slide.addText(d.title, {
      x: x + 0.15, y: y + 0.12, w: cardW - 0.25, h: 0.38,
      fontFace: "Georgia", fontSize: 13, bold: true,
      color: d.border, align: "left", margin: 0,
    });

    slide.addText(d.body, {
      x: x + 0.15, y: y + 0.55, w: cardW - 0.25, h: cardH - 0.65,
      fontFace: "Calibri", fontSize: 11,
      color: C.white, align: "left", valign: "top",
    });
  });

  // footer
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: 4.78, w: 8.7, h: 0.32,
    fill: { color: C.bgCard }, line: { color: C.teal, width: 1 },
  });
  slide.addText(
    "40k compartilhamentos · 1M+ visualizações · Tema: O que a Bíblia chama de Verbo, a Física chama de Frequência",
    {
      x: 0.75, y: 4.78, w: 8.5, h: 0.32,
      fontFace: "Calibri", fontSize: 9.5, italic: true,
      color: C.muted, align: "center", valign: "middle", margin: 0,
    }
  );
}

// ─── SLIDE 08 — ANATOMIA DO CARROSSEL ────────────────────────────────────────
function slide08(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "Estrutura Narrativa — A Função de Cada Posição", { fontSize: 19 });

  const structure = [
    ["01", "Gancho Paradoxal", "Colisão de dois mundos — o cérebro não categoriza rápido, para"],
    ["02", "Validação Silenciosa", '"Foi escrito pra mim" — nomeia o que o seguidor sente mas não articula'],
    ["03", "O Que Te Ensinaram", "Nomeia a mentira — ativa cortisol, tensão sem escape"],
    ["04", "Raiva Coletiva", "Nomeia o culpado — direciona a raiva, gera identificação tribal"],
    ["05", "A Prova Científica", '"Então não era loucura minha" — valida a intuição que já existia'],
    ["06", "O Mecanismo", "Explica como funciona — sensação de acesso a algo oculto"],
    ["07", "A Ponte Sagrada", "Une ciência + espiritualidade — reconciliação cognitiva"],
    ["08", "O Impacto Real", "Sai do abstrato — o seguidor se vê na narrativa"],
    ["09", "A Aplicação", "Transforma insight em comportamento — sensação de controle"],
    ["10", "Cristalização + CTA", 'Frase devastadora + "Comente FONTE se..." — alimenta o algoritmo'],
  ];

  const header = [
    { text: "Pos.", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 10 } },
    { text: "Função", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 10 } },
    { text: "Por que funciona", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 10 } },
  ];

  const tableData = [
    header,
    ...structure.map((r, ri) => {
      const bg = ri % 2 === 0 ? C.bgCard : C.bgCard2;
      return [
        { text: r[0], options: { fill: { color: bg }, color: C.gold, bold: true, fontSize: 10, align: "center" } },
        { text: r[1], options: { fill: { color: bg }, color: C.white, bold: true, fontSize: 10 } },
        { text: r[2], options: { fill: { color: bg }, color: C.white, fontSize: 10 } },
      ];
    }),
  ];

  slide.addTable(tableData, {
    x: 0.65, y: 0.98, w: 8.7,
    border: { pt: 0.5, color: C.border },
    colW: [0.55, 2.1, 6.05],
    rowH: 0.39,
  });
}

// ─── SLIDE 09 — OS 10 NOVOS TEMAS ───────────────────────────────────────────
function slide09(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "10 Temas Desenvolvidos — Prontos para Produção", { fontSize: 20 });

  const left = [
    { n: "1", title: "O Diabo e o Ego", phrase: "Você não está possuído. Está programado." },
    { n: "2", title: "O Placebo e a Mente", phrase: "O remédio mais poderoso é a crença." },
    { n: "3", title: "A Ansiedade e o Despertar", phrase: "Você não está doente. Está acordando." },
    { n: "4", title: "À Imagem e Semelhança", phrase: "Você foi criado para criar. Te ensinaram a pedir permissão." },
    { n: "5", title: "O Karma e a Epigenética", phrase: "Karma não é dívida. É herança reescrevível." },
  ];

  const right = [
    { n: "6", title: "A Emoção e o Campo", phrase: "O passado está no seu corpo como frequência." },
    { n: "7", title: "A Intuição e os 11M bits", phrase: "Você trocou 11M bits por 50. E chamou de bom senso." },
    { n: "8", title: "O Entrelaçamento e a Conexão", phrase: "A separação não é real na física." },
    { n: "9", title: "O TDAH e o Processamento", phrase: "Foram eles que precisavam de diagnóstico." },
    { n: "10", title: "O Vazio e a Memória de Unidade", phrase: "O vazio não é o que falta. É o que sobrou." },
  ];

  const colW = 4.25;
  const leftX = 0.65, rightX = 5.2;
  const startY = 1.0, itemH = 0.76, gap = 0.08;

  function renderThemes(themes, x) {
    themes.forEach((t, i) => {
      const y = startY + i * (itemH + gap);

      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: colW, h: itemH,
        fill: { color: C.bgCard2 },
        line: { color: C.border, width: 0.75 },
      });

      // number
      slide.addText(t.n, {
        x: x + 0.08, y, w: 0.38, h: itemH,
        fontFace: "Georgia", fontSize: 14, bold: true,
        color: C.gold, align: "center", valign: "middle", margin: 0,
      });

      // title
      slide.addText(t.title, {
        x: x + 0.5, y: y + 0.06, w: colW - 0.6, h: 0.34,
        fontFace: "Calibri", fontSize: 11, bold: true,
        color: C.white, align: "left", valign: "top", margin: 0,
      });

      // phrase
      slide.addText(t.phrase, {
        x: x + 0.5, y: y + 0.38, w: colW - 0.6, h: 0.32,
        fontFace: "Calibri", fontSize: 10, italic: true,
        color: C.muted, align: "left", valign: "top", margin: 0,
      });
    });
  }

  renderThemes(left, leftX);
  renderThemes(right, rightX);
}

// ─── SLIDE 10 — RESULTADOS PRODUZIDOS ───────────────────────────────────────
function slide10(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "Carrosséis Produzidos — Score do Oráculo Revisor", { fontSize: 19 });

  const carousels = [
    ["01", "Glândula Pineal", "—", "Concluído"],
    ["02", "Oração = Reconfiguração Neural", "—", "Concluído"],
    ["03", "Einstein + Campo Unificado", "—", "Concluído"],
    ["04", "Identidade Vibracional", "—", "Concluído"],
    ["05", "Memórias como Frequência", "15/15", "✓ Aprovado"],
    ["06", "Cabala + Neurociência", "14/15", "✓ Aprovado"],
    ["07", "Neville Goddard", "15/15", "✓ Aprovado"],
    ["08", "Memórias como Frequência", "15/15", "✓ Aprovado"],
  ];

  const header = [
    { text: "#", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11, align: "center" } },
    { text: "Carrossel", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11 } },
    { text: "Tema", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11 } },
    { text: "Score", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11, align: "center" } },
    { text: "Status", options: { fill: { color: C.bgCard }, color: C.gold, bold: true, fontSize: 11 } },
  ];

  const tableData = [
    header,
    ...carousels.map((r, ri) => {
      const bg = ri % 2 === 0 ? C.bgCard : C.bgCard2;
      const scoreColor = r[2] === "15/15" ? "2ECC71" : r[2] === "14/15" ? C.goldLight : C.muted;
      const statusColor = r[3].includes("Aprovado") ? "2ECC71" : C.muted;
      return [
        { text: r[0], options: { fill: { color: bg }, color: C.muted, fontSize: 10, align: "center" } },
        { text: r[1], options: { fill: { color: bg }, color: C.white, bold: true, fontSize: 10 } },
        { text: r[2], options: { fill: { color: bg }, color: C.white, fontSize: 10 } },
        { text: r[3], options: { fill: { color: bg }, color: scoreColor, bold: true, fontSize: 10, align: "center" } },
        { text: r[4], options: { fill: { color: bg }, color: statusColor, fontSize: 10 } },
      ];
    }),
  ];

  slide.addTable(tableData, {
    x: 0.65, y: 1.0, w: 8.7,
    border: { pt: 0.5, color: C.border },
    colW: [0.5, 1.5, 3.5, 1.0, 2.2],
    rowH: 0.4,
  });

  // highlight box
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: 4.58, w: 8.7, h: 0.44,
    fill: { color: "0D4F2E" },
    line: { color: "2ECC71", width: 1.5 },
  });
  slide.addText("3 carrosséis consecutivos com 15/15 — máxima qualidade autônoma", {
    x: 0.75, y: 4.58, w: 8.5, h: 0.44,
    fontFace: "Calibri", fontSize: 12, bold: true,
    color: "2ECC71", align: "center", valign: "middle", margin: 0,
  });
}

// ─── SLIDE 11 — INFRAESTRUTURA TÉCNICA ──────────────────────────────────────
function slide11(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "A Infraestrutura Técnica por Trás do Sistema", { fontSize: 20 });

  const cols = [
    {
      title: "GERAÇÃO",
      titleColor: C.gold,
      items: [
        "Python + Pillow (composição)",
        "Google Gemini API (imagem)",
        "compose_util.py (margens, fontes)",
        "MARGIN: 92px · Canvas: 1080x1350",
      ],
    },
    {
      title: "DADOS",
      titleColor: C.teal,
      items: [
        "Node.js + Express (dashboard)",
        "JSON flat store (carousels.json)",
        "Filesystem de imagens",
        "API REST para CRUD",
      ],
    },
    {
      title: "INTERFACE",
      titleColor: C.goldLight,
      items: [
        "Dashboard web (porta 3131)",
        "Download por slide ou total",
        "Edição de texto por slide",
        "Regeneração de imagem por slide",
      ],
    },
  ];

  const cardW = 2.8, cardH = 3.2;
  const gap = 0.28;
  const startX = 0.65, startY = 1.05;

  cols.forEach((col, i) => {
    const x = startX + i * (cardW + gap);

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: startY, w: cardW, h: cardH,
      fill: { color: C.bgCard2 },
      line: { color: col.titleColor, width: 1.5 },
      shadow: makeShadow(),
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: startY, w: cardW, h: 0.06,
      fill: { color: col.titleColor }, line: { color: col.titleColor },
    });

    slide.addText(col.title, {
      x, y: startY + 0.1, w: cardW, h: 0.4,
      fontFace: "Georgia", fontSize: 15, bold: true,
      color: col.titleColor, align: "center", margin: 0,
    });

    slide.addText(
      col.items.map((item, idx) => ({
        text: item,
        options: { bullet: true, breakLine: idx < col.items.length - 1 },
      })),
      {
        x: x + 0.15, y: startY + 0.6, w: cardW - 0.25, h: cardH - 0.7,
        fontFace: "Calibri", fontSize: 11,
        color: C.white, align: "left", valign: "top",
      }
    );
  });
}

// ─── SLIDE 12 — PRÓXIMOS PASSOS ──────────────────────────────────────────────
function slide12(pres) {
  const slide = slideBase(pres);
  addDecorativeBars(pres, slide);
  addTitle(slide, "Próximos Passos — Roadmap", { fontSize: 22 });

  const steps = [
    { n: "1", label: "PRODUÇÃO", detail: "Gerar os 10 novos carrosséis com estrutura de 10 slides", color: C.gold },
    { n: "2", label: "VISUAL", detail: "Implementar estilo de colagem fotográfica nos prompts de imagem", color: C.teal },
    { n: "3", label: "DASHBOARD", detail: "Download por slide + edição de texto + regeneração de imagem", color: C.gold },
    { n: "4", label: "ESCALA", detail: "Automação de publicação no Instagram via API", color: C.teal },
    { n: "5", label: "ANÁLISE", detail: "Tracking de métricas por carrossel (alcance, saves, compartilhamentos)", color: C.goldLight },
  ];

  const cardH = 0.72, gap = 0.14;
  const startY = 1.05, cardW = 8.7;

  steps.forEach((s, i) => {
    const y = startY + i * (cardH + gap);

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.65, y, w: cardW, h: cardH,
      fill: { color: C.bgCard2 },
      line: { color: s.color, width: 1 },
    });

    // number circle
    slide.addShape(pres.shapes.OVAL, {
      x: 0.72, y: y + 0.12, w: 0.48, h: 0.48,
      fill: { color: s.color }, line: { color: s.color },
    });
    slide.addText(s.n, {
      x: 0.72, y: y + 0.12, w: 0.48, h: 0.48,
      fontFace: "Georgia", fontSize: 13, bold: true,
      color: C.bg, align: "center", valign: "middle", margin: 0,
    });

    // label
    slide.addText(s.label, {
      x: 1.32, y: y + 0.06, w: 1.8, h: 0.36,
      fontFace: "Georgia", fontSize: 13, bold: true,
      color: s.color, align: "left", valign: "middle", margin: 0,
    });

    // detail
    slide.addText(s.detail, {
      x: 1.32, y: y + 0.38, w: cardW - 0.85, h: 0.3,
      fontFace: "Calibri", fontSize: 11,
      color: C.white, align: "left", valign: "top", margin: 0,
    });
  });

  // final quote
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.65, y: 4.88, w: 8.7, h: 0.38,
    fill: { color: C.bgCard }, line: { color: C.gold, width: 1 },
  });
  slide.addText(
    "O sistema não substitui a criatividade humana. Ele a escala.",
    {
      x: 0.75, y: 4.88, w: 8.5, h: 0.38,
      fontFace: "Georgia", fontSize: 13, italic: true, bold: true,
      color: C.gold, align: "center", valign: "middle", margin: 0,
    }
  );
}

module.exports = {
  slide07,
  slide08,
  slide09,
  slide10,
  slide11,
  slide12
};
