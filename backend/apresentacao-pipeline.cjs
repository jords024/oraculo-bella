// apresentacao-pipeline.cjs
// Apresentação: Sistema de Criação de Conteúdo com IA — Fonte Oculta
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" x 7.5"
pres.title = "Sistema de Criação de Conteúdo com IA — Fonte Oculta";

// ── Paleta ─────────────────────────────────────────────────────────────────────
const C = {
  bg:       "080810",   // quase preto
  card:     "10101C",   // card dark
  card2:    "161626",   // card um pouco mais claro
  gold:     "C9A84C",   // dourado principal
  goldDim:  "7A6130",   // dourado escuro
  white:    "F5F5F5",
  gray:     "8888A0",
  grayDim:  "4A4A60",
  phase1:   "C9A84C",   // gold
  phase2:   "4C7AC9",   // azul (aprovação)
  phase3:   "A44CC9",   // roxo (prompt)
  phase4:   "4CA8C9",   // ciano (nano banana)
  phase5:   "4CC97A",   // verde (composição)
  approved: "3ACC7A",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function bgDark(slide) {
  slide.background = { color: C.bg };
}

function addGoldBar(slide, y = 0.55, h = 0.05) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y, w: 1.2, h,
    fill: { color: C.gold }, line: { color: C.gold },
  });
}

function slideTitle(slide, text, y = 0.38) {
  slide.addText(text, {
    x: 0.6, y, w: 12.1, h: 0.7,
    fontSize: 28, bold: true, color: C.white,
    fontFace: "Calibri", margin: 0,
  });
}

function slideSubtitle(slide, text, y = 1.05) {
  slide.addText(text, {
    x: 0.6, y, w: 12.1, h: 0.45,
    fontSize: 16, color: C.gray,
    fontFace: "Calibri", margin: 0,
  });
}

function card(slide, x, y, w, h, fillColor = C.card) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: C.grayDim, width: 0.5 },
    shadow: { type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.3 },
  });
}

function phaseCircle(slide, num, label, color, x, y) {
  // Circle
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: 0.65, h: 0.65,
    fill: { color },
    line: { color },
  });
  slide.addText(num, {
    x, y: y + 0.04, w: 0.65, h: 0.57,
    fontSize: 20, bold: true, color: "000000",
    fontFace: "Calibri", align: "center", margin: 0,
  });
  slide.addText(label, {
    x: x - 0.2, y: y + 0.72, w: 1.05, h: 0.5,
    fontSize: 9, color: color, bold: true,
    fontFace: "Calibri", align: "center", margin: 0,
  });
}

function arrow(slide, x, y) {
  slide.addShape(pres.shapes.LINE, {
    x, y: y + 0.32, w: 0.45, h: 0,
    line: { color: C.grayDim, width: 1.5 },
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — CAPA
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Decoração: retângulo dourado lateral esquerda
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  // Retângulo decorativo direito sutil
  s.addShape(pres.shapes.RECTANGLE, {
    x: 12.7, y: 0, w: 0.6, h: 7.5,
    fill: { color: C.card }, line: { color: C.card },
  });

  // Linha dourada horizontal (acima do título)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 2.2, w: 6.5, h: 0.04,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  // Título principal
  s.addText("SISTEMA DE CRIAÇÃO\nDE CONTEÚDO COM IA", {
    x: 0.55, y: 2.3, w: 9, h: 2.0,
    fontSize: 52, bold: true, color: C.white,
    fontFace: "Calibri", charSpacing: 1,
  });

  // Linha dourada horizontal (abaixo do título)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 4.3, w: 6.5, h: 0.04,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  // Subtítulo
  s.addText("Como o time de agentes produz carrosséis virais — do zero à arte final", {
    x: 0.55, y: 4.5, w: 9.5, h: 0.5,
    fontSize: 18, color: C.gray, fontFace: "Calibri",
  });

  // Brand
  s.addText("FONTE OCULTA  ·  2025", {
    x: 0.55, y: 6.6, w: 5, h: 0.4,
    fontSize: 13, color: C.goldDim, bold: true,
    fontFace: "Calibri", charSpacing: 4,
  });

  // Decoração grid direita
  const gridColors = [C.phase1, C.phase3, C.phase4, C.phase5, C.phase2];
  for (let i = 0; i < 5; i++) {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 10.2 + (i % 3) * 0.9, y: 1.5 + Math.floor(i / 3) * 0.9, w: 0.7, h: 0.7,
      fill: { color: gridColors[i], transparency: 70 },
      line: { color: gridColors[i], width: 0.5 },
    });
  }
  for (let i = 0; i < 5; i++) {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 10.2 + (i % 3) * 0.9, y: 3.3 + Math.floor(i / 3) * 0.9, w: 0.7, h: 0.7,
      fill: { color: gridColors[(i + 2) % 5], transparency: 80 },
      line: { color: gridColors[(i + 2) % 5], width: 0.5 },
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — O PROBLEMA: CONTEÚDO MANUAL NÃO ESCALA
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  addGoldBar(s);
  slideTitle(s, "Por que o modelo tradicional de conteúdo trava o crescimento");
  slideSubtitle(s, "Cada carrossel manual consome recursos que deveriam estar em estratégia");

  const problems = [
    { icon: "⏱", title: "TEMPO", desc: "1 carrossel completo = 6–12h de trabalho\n(copy + imagem + design + revisão)\nScale impossível acima de 8 posts/mês", color: "CC4444" },
    { icon: "📉", title: "INCONSISTÊNCIA", desc: "Cada peça reflete o humor do dia.\nVoz, estética e qualidade variam.\nA marca nunca se consolida.", color: "CC7744" },
    { icon: "💸", title: "CUSTO", desc: "Copywriter + Designer + Estrategista\n= R$3.000–8.000/mês só para conteúdo.\nROI difícil de justificar.", color: "CC4488" },
  ];

  problems.forEach((p, i) => {
    const x = 0.55 + i * 4.2;
    card(s, x, 1.55, 3.8, 4.2, "14141F");
    // Top accent
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.55, w: 3.8, h: 0.06,
      fill: { color: p.color }, line: { color: p.color },
    });
    s.addText(p.icon, {
      x: x + 0.2, y: 1.75, w: 0.8, h: 0.7,
      fontSize: 32, align: "center",
    });
    s.addText(p.title, {
      x: x + 0.25, y: 2.45, w: 3.3, h: 0.45,
      fontSize: 18, bold: true, color: p.color,
      fontFace: "Calibri", charSpacing: 3,
    });
    s.addText(p.desc, {
      x: x + 0.25, y: 2.95, w: 3.35, h: 2.4,
      fontSize: 13, color: C.gray, fontFace: "Calibri",
    });
  });

  // vs. box
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 5.9, w: 12.2, h: 0.85,
    fill: { color: "0D1F0D" }, line: { color: C.approved, width: 1 },
  });
  s.addText("✦  Com o Sistema de Agentes: 1 carrossel completo em menos de 20 minutos — repetível infinitamente, com qualidade consistente", {
    x: 0.8, y: 5.97, w: 11.8, h: 0.65,
    fontSize: 15, color: C.approved, bold: true, fontFace: "Calibri",
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — VISÃO GERAL DO PIPELINE
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  addGoldBar(s);
  slideTitle(s, "O Pipeline Completo: 6 Fases com 2 Gates de Aprovação Humana");
  slideSubtitle(s, "Cada fase tem responsável, critério e output definidos antes de avançar");

  // Fases
  const phases = [
    { num: "1", label: "COPY\nSQUAD",    color: C.phase1, x: 0.55 },
    { num: "✓", label: "APROVAÇÃO\nHUMANA", color: C.phase2, x: 2.7  },
    { num: "2", label: "PROMPT\nENGINEER", color: C.phase3, x: 4.85 },
    { num: "✓", label: "APROVAÇÃO\nHUMANA", color: C.phase2, x: 7.0  },
    { num: "3", label: "NANO\nBANANA 2", color: C.phase4, x: 9.15 },
    { num: "4", label: "DESIGN\nCOMPOSITOR", color: C.phase5, x: 11.3},
  ];

  phases.forEach((p, i) => {
    phaseCircle(s, p.num, p.label, p.color, p.x, 1.85);
    if (i < phases.length - 1) arrow(s, p.x + 0.65, 1.85);
  });

  // Descrição de cada fase
  const details = [
    { x: 0.25, color: C.phase1, title: "Copy Squad", lines: ["• Arqueologia do prospect", "• Escolha de formato (A/B/C/D)", "• 8 slides com hook, corpo e CTA", "• Framework: Oráculo V2"] },
    { x: 2.4, color: C.phase2, title: "Gate 1", lines: ["• Hook forte o suficiente?", "• Arco narrativo coeso?", "• Voz da marca correta?", "• Aprovação antes de gerar imagens"] },
    { x: 4.55, color: C.phase3, title: "Prompt Engineer", lines: ["• Lê a copy de cada slide", "• Traduz conceito → metáfora visual", "• Decide layout: fullbleed ou card", "• Calibra paleta e emoção"] },
    { x: 6.7, color: C.phase2, title: "Gate 2", lines: ["• Prompts condizem com a copy?", "• Imagem adequada ao público?", "• Aprovação antes de gastar crédito", "• Última revisão estratégica"] },
    { x: 8.85, color: C.phase4, title: "Nano Banana 2", lines: ["• gemini-3.1-flash-image-preview", "• 8 imagens em ~8–12 min", "• Base64 → Pillow pipeline", "• Retry automático em falha"] },
    { x: 11.0, color: C.phase5, title: "Design Compositor", lines: ["• Gradiente calculado", "• Tipografia hierárquica", "• Watermark + layout pixel-perfect", "• Saída: JPEG 95% 1080×1350"] },
  ];

  details.forEach((d) => {
    card(s, d.x, 3.05, 2.15, 3.85, "0D0D18");
    s.addShape(pres.shapes.RECTANGLE, {
      x: d.x, y: 3.05, w: 2.15, h: 0.05,
      fill: { color: d.color }, line: { color: d.color },
    });
    s.addText(d.title, {
      x: d.x + 0.12, y: 3.13, w: 1.95, h: 0.4,
      fontSize: 11, bold: true, color: d.color, fontFace: "Calibri", margin: 0,
    });
    d.lines.forEach((line, li) => {
      s.addText(line, {
        x: d.x + 0.1, y: 3.58 + li * 0.72, w: 2.0, h: 0.6,
        fontSize: 10.5, color: C.gray, fontFace: "Calibri", margin: 0,
      });
    });
  });

  // Output final
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 7.05, w: 12.8, h: 0.0,
    line: { color: C.grayDim, width: 0.5, dashType: "dash" },
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — O TIME DE AGENTES
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  addGoldBar(s);
  slideTitle(s, "O Time de Agentes: Funções e Especialidades");
  slideSubtitle(s, "Cada agente foi selecionado pela competência específica que contribui ao processo");

  const agents = [
    {
      squad: "COPY SQUAD",
      color: C.phase1,
      members: [
        { name: "Copy Chief", role: "Orquestra o processo, define estratégia e valida coerência" },
        { name: "Gary Halbert", role: "Headlines magnéticos, hooks que param o scroll" },
        { name: "Eugene Schwartz", role: "Níveis de consciência, sofisticação de mercado" },
        { name: "Dan Kennedy", role: "Polarização, autoridade e urgência genuína" },
        { name: "Stefan Georgi", role: "Emoção, vulnerabilidade, conexão profunda" },
      ],
    },
    {
      squad: "ESTRATÉGIA VISUAL",
      color: C.phase3,
      members: [
        { name: "Prompt Engineer", role: "Traduz texto em linguagem visual compreendida pelo AI" },
        { name: "Layout Director", role: "Decide fullbleed vs card por tipo de conteúdo do slide" },
        { name: "Palette Guardian", role: "Mantém coerência visual entre os 8 slides do carrossel" },
      ],
    },
    {
      squad: "EXECUÇÃO TÉCNICA",
      color: C.phase5,
      members: [
        { name: "Nano Banana 2", role: "Gera imagens via Gemini API (gemini-3.1-flash-image-preview)" },
        { name: "Design Compositor", role: "Python + Pillow: composição, tipografia, gradiente, watermark" },
        { name: "QA Automático", role: "Verifica geração bem-sucedida e retry em caso de falha de API" },
      ],
    },
  ];

  agents.forEach((ag, i) => {
    const x = 0.45 + i * 4.25;
    // Header card
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.45, w: 3.95, h: 0.52,
      fill: { color: ag.color }, line: { color: ag.color },
    });
    s.addText(ag.squad, {
      x: x + 0.15, y: 1.48, w: 3.65, h: 0.45,
      fontSize: 13, bold: true, color: "000000",
      fontFace: "Calibri", charSpacing: 2, margin: 0,
    });

    ag.members.forEach((m, mi) => {
      const cy = 2.05 + mi * 1.0;
      card(s, x, cy, 3.95, 0.88, "0E0E1A");
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: cy, w: 0.06, h: 0.88,
        fill: { color: ag.color }, line: { color: ag.color },
      });
      s.addText(m.name, {
        x: x + 0.2, y: cy + 0.07, w: 3.6, h: 0.32,
        fontSize: 12, bold: true, color: C.white,
        fontFace: "Calibri", margin: 0,
      });
      s.addText(m.role, {
        x: x + 0.2, y: cy + 0.4, w: 3.6, h: 0.42,
        fontSize: 10, color: C.gray,
        fontFace: "Calibri", margin: 0,
      });
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — FASE 1: COPY SQUAD
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);

  // Left accent bar gold
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.phase1 }, line: { color: C.phase1 },
  });

  s.addText("FASE 1", {
    x: 0.55, y: 0.28, w: 3, h: 0.38,
    fontSize: 13, bold: true, color: C.phase1,
    fontFace: "Calibri", charSpacing: 4, margin: 0,
  });
  slideTitle(s, "Copy Squad — Criação da Narrativa do Carrossel", 0.65);
  slideSubtitle(s, "Nenhuma imagem é gerada antes de a copy estar validada. A narrativa comanda o visual.");

  // Coluna esquerda: processo
  const steps = [
    { num: "01", title: "Arqueologia do Prospect", desc: "Mapeamos: nível de consciência, conversa interna às 3h da manhã, o que já tentou, por que não funcionou. Isso determina o gancho." },
    { num: "02", title: "Big Idea", desc: "Uma verdade emocional não-dita que faz o prospect pensar: 'como ninguém me disse isso antes?' Não é benefício — é revelação." },
    { num: "03", title: "Escolha de Formato", desc: "A: Tese+Tradução  /  B: Demolição+Reconstrução\nC: Lista Revelação  /  D: História+Verdade" },
    { num: "04", title: "Bolha A/B (Polarização)", desc: "Identificamos as duas tribos que o conteúdo vai unir ou dividir. A bolha é o que gera salvo e compartilhamento orgânico." },
    { num: "05", title: "8 Slides com Copy Completa", desc: "Hook → Demolição → Revelação → Prova → Amplificação → Solução → Ponte → CTA. Cada slide tem título e corpo." },
  ];

  steps.forEach((st, i) => {
    const y = 1.45 + i * 1.15;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.45, y, w: 0.55, h: 0.55,
      fill: { color: C.phase1 }, line: { color: C.phase1 },
    });
    s.addText(st.num, {
      x: 0.45, y: y + 0.04, w: 0.55, h: 0.47,
      fontSize: 17, bold: true, color: "000000",
      fontFace: "Calibri", align: "center", margin: 0,
    });
    s.addText(st.title, {
      x: 1.12, y: y + 0.0, w: 5.8, h: 0.32,
      fontSize: 13, bold: true, color: C.white,
      fontFace: "Calibri", margin: 0,
    });
    s.addText(st.desc, {
      x: 1.12, y: y + 0.33, w: 5.8, h: 0.68,
      fontSize: 10.5, color: C.gray, fontFace: "Calibri", margin: 0,
    });
  });

  // Coluna direita: framework Oráculo
  card(s, 7.35, 1.45, 5.4, 5.7, "0D0D1A");
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.35, y: 1.45, w: 5.4, h: 0.05,
    fill: { color: C.phase1 }, line: { color: C.phase1 },
  });
  s.addText("ORÁCULO DO CONTEÚDO V2", {
    x: 7.5, y: 1.56, w: 5.1, h: 0.38,
    fontSize: 12, bold: true, color: C.phase1,
    fontFace: "Calibri", charSpacing: 2, margin: 0,
  });

  const oracle = [
    { emoji: "⚡", label: "GANCHO", desc: "Quebra a bolha em 2 segundos" },
    { emoji: "🔥", label: "DEMOLIÇÃO", desc: "Destrói a crença limitante" },
    { emoji: "💡", label: "REVELAÇÃO", desc: "Entrega a verdade não-dita" },
    { emoji: "🔬", label: "PROVA", desc: "Ciência, dados ou autoridade" },
    { emoji: "📉", label: "AMPLIFICAÇÃO", desc: "Quanto custa não saber isso?" },
    { emoji: "🔓", label: "SOLUÇÃO", desc: "O mecanismo único do produto" },
    { emoji: "🌉", label: "PONTE", desc: "Conecta ao produto sem vender" },
    { emoji: "🚪", label: "CTA PORTAL", desc: "A decisão já estava dentro" },
  ];

  oracle.forEach((o, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ox = 7.5 + col * 2.6;
    const oy = 2.12 + row * 1.12;
    s.addText(o.emoji + " " + o.label, {
      x: ox, y: oy, w: 2.5, h: 0.32,
      fontSize: 11, bold: true, color: C.phase1,
      fontFace: "Calibri", margin: 0,
    });
    s.addText(o.desc, {
      x: ox, y: oy + 0.33, w: 2.5, h: 0.36,
      fontSize: 10, color: C.gray,
      fontFace: "Calibri", margin: 0,
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — FASE 2: APROVAÇÃO HUMANA (GATE 1)
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.phase2 }, line: { color: C.phase2 },
  });

  s.addText("GATE DE APROVAÇÃO 1 & 2", {
    x: 0.55, y: 0.28, w: 6, h: 0.38,
    fontSize: 13, bold: true, color: C.phase2,
    fontFace: "Calibri", charSpacing: 4, margin: 0,
  });
  slideTitle(s, "Aprovação Humana — Por que o humano permanece no loop", 0.65);
  slideSubtitle(s, "A automação executa. O humano decide. Essa distinção é intencional e estratégica.");

  // Filosofia
  card(s, 0.45, 1.45, 5.8, 1.5, "0A0A1F");
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 1.45, w: 5.8, h: 0.05,
    fill: { color: C.phase2 }, line: { color: C.phase2 },
  });
  s.addText("A filosofia dos gates", {
    x: 0.6, y: 1.55, w: 5.5, h: 0.38,
    fontSize: 13, bold: true, color: C.phase2, fontFace: "Calibri", margin: 0,
  });
  s.addText("Automação de excelência não elimina o humano — concentra o esforço humano nos pontos de maior valor estratégico. O time não escreve. Ele decide e valida.", {
    x: 0.6, y: 1.95, w: 5.6, h: 0.85,
    fontSize: 12, color: C.gray, fontFace: "Calibri", margin: 0,
  });

  // Gate 1
  card(s, 0.45, 3.1, 5.8, 2.9, "0A0A1F");
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 3.1, w: 5.8, h: 0.05,
    fill: { color: C.phase1 }, line: { color: C.phase1 },
  });
  s.addText("GATE 1 — Após Copy Squad", {
    x: 0.6, y: 3.2, w: 5.5, h: 0.38,
    fontSize: 13, bold: true, color: C.phase1, fontFace: "Calibri", margin: 0,
  });
  const g1 = [
    "O gancho quebra a bolha em 2 segundos?",
    "O arco narrativo vai do problema ao portal sem buracos?",
    "A voz está alinhada com a marca Fonte Oculta?",
    "O CTA está como portal — não como pedido?",
    "A polarização está calibrada para a bolha certa?",
  ];
  g1.forEach((q, qi) => {
    s.addText([
      { text: "□  ", options: { bold: true, color: C.phase1 } },
      { text: q, options: { color: C.gray } },
    ], {
      x: 0.6, y: 3.65 + qi * 0.44, w: 5.5, h: 0.38,
      fontSize: 11.5, fontFace: "Calibri", margin: 0,
    });
  });

  // Gate 2
  card(s, 6.65, 1.45, 6.2, 5.55, "0A0A1F");
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.65, y: 1.45, w: 6.2, h: 0.05,
    fill: { color: C.phase3 }, line: { color: C.phase3 },
  });
  s.addText("GATE 2 — Após Prompt Engineer", {
    x: 6.8, y: 1.55, w: 5.9, h: 0.38,
    fontSize: 13, bold: true, color: C.phase3, fontFace: "Calibri", margin: 0,
  });
  const g2 = [
    "O prompt de cada slide reflete a emoção certa para a copy?",
    "A metáfora visual é legível sem precisar ler o texto?",
    "A paleta (dark + gold) está consistente nos 8 prompts?",
    "A decisão fullbleed/card está justificada por tipo de conteúdo?",
    "Nenhum prompt vai gerar imagem inadequada para o público?",
  ];
  g2.forEach((q, qi) => {
    s.addText([
      { text: "□  ", options: { bold: true, color: C.phase3 } },
      { text: q, options: { color: C.gray } },
    ], {
      x: 6.8, y: 2.02 + qi * 0.44, w: 5.9, h: 0.38,
      fontSize: 11.5, fontFace: "Calibri", margin: 0,
    });
  });

  // Nota sobre gate 2
  s.addText("Aprovação antes de gastar crédito de API. Cada geração consome tokens — revisão de prompt é mais barata que regeneração.", {
    x: 6.8, y: 4.22, w: 5.9, h: 0.8,
    fontSize: 11, color: C.grayDim, fontFace: "Calibri",
    italic: true, margin: 0,
  });

  // Outcome
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.65, y: 5.15, w: 6.2, h: 1.0,
    fill: { color: "0D1F0D" }, line: { color: C.approved, width: 1 },
  });
  s.addText("✦  Com 2 gates, a taxa de acerto na arte final é >90%.\nSem gates: 3–4 ciclos de retrabalho por carrossel.", {
    x: 6.85, y: 5.22, w: 5.9, h: 0.85,
    fontSize: 12, color: C.approved, fontFace: "Calibri", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — FASE 3: PROMPT ENGINEER
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.phase3 }, line: { color: C.phase3 },
  });
  s.addText("FASE 3", {
    x: 0.55, y: 0.28, w: 3, h: 0.38,
    fontSize: 13, bold: true, color: C.phase3,
    fontFace: "Calibri", charSpacing: 4, margin: 0,
  });
  slideTitle(s, "Prompt Engineer — Traduzindo Copy em Linguagem Visual", 0.65);
  slideSubtitle(s, "O elo mais subestimado do pipeline. A imagem certa não descreve o texto — evoca a mesma emoção.");

  const decisions = [
    { q: "Qual ESTADO EMOCIONAL\na imagem precisa evocar?", a: "Lê o slide e identifica: medo, revelação, esperança, poder, urgência. A imagem amplifica — nunca contradiz." },
    { q: "Qual METÁFORA VISUAL\nrepresenta o conceito?", a: "Ex: 'frequência cerebral bloqueada' → silhueta alcançando luz acima de barreira de ondas caóticas. Legível sem ler o texto." },
    { q: "Qual LAYOUT\ncomunica melhor?", a: "Fullbleed: slides emocionais de impacto (hooks, CTAs).\nCard: slides de revelação/prova com imagem como evidência." },
    { q: "Qual PALETA E\nATMOSFERA usar?", a: "Dark cosmic / quase preto para fundo. Gold e elétrico para energia. Coerência entre os 8 slides do carrossel." },
  ];

  decisions.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.45 + col * 6.35;
    const y = 1.55 + row * 2.85;
    card(s, x, y, 6.05, 2.6, "0D0D1A");
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 6.05, h: 0.05,
      fill: { color: C.phase3 }, line: { color: C.phase3 },
    });
    s.addText(d.q, {
      x: x + 0.2, y: y + 0.15, w: 5.7, h: 0.65,
      fontSize: 13, bold: true, color: C.white,
      fontFace: "Calibri", margin: 0,
    });
    s.addText(d.a, {
      x: x + 0.2, y: y + 0.88, w: 5.7, h: 1.55,
      fontSize: 12, color: C.gray, fontFace: "Calibri", margin: 0,
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — FASES 4 & 5: GERAÇÃO + COMPOSIÇÃO
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  addGoldBar(s, 0.55, 0.05);
  slideTitle(s, "Execução Técnica: Geração de Imagem + Composição Final");
  slideSubtitle(s, "Da API ao arquivo final — o sistema executa sem intervenção humana");

  // Fase 4: Nano Banana
  card(s, 0.45, 1.45, 5.8, 5.45, "0A0A1A");
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 1.45, w: 5.8, h: 0.06,
    fill: { color: C.phase4 }, line: { color: C.phase4 },
  });
  s.addText("FASE 4  —  NANO BANANA 2", {
    x: 0.6, y: 1.57, w: 5.5, h: 0.38,
    fontSize: 14, bold: true, color: C.phase4,
    fontFace: "Calibri", charSpacing: 2, margin: 0,
  });

  const nb = [
    { label: "Modelo", val: "gemini-3.1-flash-image-preview" },
    { label: "API", val: "Google Gemini Image Generation" },
    { label: "Endpoint", val: "generativelanguage.googleapis.com/v1beta" },
    { label: "Output", val: "Base64 inline — image/png ou image/jpeg" },
    { label: "Tempo médio", val: "8–12 minutos para 8 slides completos" },
    { label: "Retry", val: "Automático com espera exponencial em 503/timeout" },
    { label: "Custo", val: "~US$ 0.003 por imagem (Gemini Flash pricing)" },
  ];

  nb.forEach((n, ni) => {
    s.addText(n.label + ":", {
      x: 0.6, y: 2.05 + ni * 0.65, w: 1.6, h: 0.38,
      fontSize: 11, bold: true, color: C.phase4,
      fontFace: "Calibri", margin: 0,
    });
    s.addText(n.val, {
      x: 2.25, y: 2.05 + ni * 0.65, w: 3.8, h: 0.38,
      fontSize: 11, color: C.gray,
      fontFace: "Calibri", margin: 0,
    });
  });

  // Fase 5: Design Compositor
  card(s, 6.65, 1.45, 6.2, 5.45, "0A0A1A");
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.65, y: 1.45, w: 6.2, h: 0.06,
    fill: { color: C.phase5 }, line: { color: C.phase5 },
  });
  s.addText("FASE 5  —  DESIGN COMPOSITOR", {
    x: 6.8, y: 1.57, w: 5.9, h: 0.38,
    fontSize: 14, bold: true, color: C.phase5,
    fontFace: "Calibri", charSpacing: 2, margin: 0,
  });

  const ds = [
    { title: "Camada 1: Imagem de fundo", desc: "Background gerado pelo Nano Banana 2 — redimensionado para 1080×1350px (Instagram 4:5)" },
    { title: "Camada 2: Gradiente escuro", desc: "Overlay calculado matematicamente (exponencial) do terço médio ao rodapé — garante legibilidade do texto" },
    { title: "Camada 3: Watermark", desc: "\"Afonteoculta\" — pixel exato, top-left e top-right, fonte Inter Regular 30pt, opacidade 78%" },
    { title: "Camada 4: Tipografia", desc: "Título: Franklin Gothic Pro-Heavy 60pt\nCorpo: Inter Regular 32pt\nHierarquia fixa em todos os slides" },
    { title: "Card border (card layout)", desc: "Borda dourada rounded-rectangle com raio 18px. Máscara de recorte com cantos arredondados" },
    { title: "Output final", desc: "JPEG qualidade 95 — tamanho médio 280–450KB. Pronto para upload no Instagram/Meta" },
  ];

  ds.forEach((d, di) => {
    s.addText(d.title, {
      x: 6.85, y: 2.05 + di * 0.82, w: 5.85, h: 0.3,
      fontSize: 11.5, bold: true, color: C.phase5,
      fontFace: "Calibri", margin: 0,
    });
    s.addText(d.desc, {
      x: 6.85, y: 2.35 + di * 0.82, w: 5.85, h: 0.4,
      fontSize: 10.5, color: C.gray,
      fontFace: "Calibri", margin: 0,
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — RESULTADOS E ESCALA
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  addGoldBar(s);
  slideTitle(s, "O que este sistema entrega na prática");
  slideSubtitle(s, "Comparação direta entre o modelo tradicional e o pipeline de agentes");

  // Métricas grandes
  const metrics = [
    { num: "< 20min", label: "por carrossel completo\n(zero → arte final)", color: C.phase1 },
    { num: "> 90%", label: "taxa de aprovação\nna primeira rodada", color: C.approved },
    { num: "8 slides", label: "com imagem + texto\npixel-perfect por lote", color: C.phase4 },
    { num: "∞", label: "escalabilidade\nde produção", color: C.phase3 },
  ];

  metrics.forEach((m, i) => {
    const x = 0.45 + i * 3.15;
    card(s, x, 1.4, 2.85, 2.2, "0D0D1A");
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.4, w: 2.85, h: 0.07,
      fill: { color: m.color }, line: { color: m.color },
    });
    s.addText(m.num, {
      x: x + 0.1, y: 1.55, w: 2.65, h: 0.85,
      fontSize: 36, bold: true, color: m.color,
      fontFace: "Calibri", align: "center", margin: 0,
    });
    s.addText(m.label, {
      x: x + 0.1, y: 2.42, w: 2.65, h: 0.85,
      fontSize: 11, color: C.gray,
      fontFace: "Calibri", align: "center", margin: 0,
    });
  });

  // Tabela comparativa
  const rows = [
    ["", "Modelo Tradicional", "Pipeline de Agentes"],
    ["Tempo por carrossel", "6–12 horas", "< 20 minutos"],
    ["Consistência visual", "Varia por profissional", "Pixel-perfect em todos"],
    ["Copy + imagem alinhadas", "Processo separado", "Derivadas da mesma fonte"],
    ["Escalabilidade", "Linear (1 recurso = 1 output)", "Paralelo ilimitado"],
    ["Custo marginal", "R$200–500 por carrossel", "< R$1,00 de API"],
    ["Aprovação humana", "Em cada detalhe", "Apenas nos gates estratégicos"],
  ];

  const colWidths = [3.0, 3.5, 3.5];
  const tableData = rows.map((row, ri) =>
    row.map((cell, ci) => ({
      text: cell,
      options: {
        bold: ri === 0 || ci === 0,
        color: ri === 0 ? "000000" : (ci === 2 && ri > 0 ? C.approved : C.gray),
        fill: { color: ri === 0 ? C.phase1 : (ri % 2 === 0 ? "0D0D18" : "111120") },
        fontSize: ri === 0 ? 11 : 11,
        fontFace: "Calibri",
        align: ci === 0 ? "left" : "center",
      }
    }))
  );

  s.addTable(tableData, {
    x: 0.45, y: 3.82, w: 10.0, h: 3.25,
    colW: colWidths,
    border: { pt: 0.5, color: C.grayDim },
    rowH: 0.45,
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — SOP: COMO O TIME OPERA
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  addGoldBar(s);
  slideTitle(s, "SOP: Como o Time Opera este Sistema");
  slideSubtitle(s, "Procedimento padrão — quem faz o quê e quando em cada carrossel");

  const sop = [
    { step: "01", who: "ESTRATEGISTA", time: "5 min", action: "Define tema, avatar e bolha A/B do carrossel", color: C.phase1 },
    { step: "02", who: "SISTEMA (AI)", time: "2 min", action: "Copy Squad gera arqueologia do prospect + Big Idea + 8 slides completos", color: C.gray },
    { step: "03", who: "ESTRATEGISTA", time: "3 min", action: "Gate 1: Revisa copy, aprova ou solicita ajuste de slide específico", color: C.phase2 },
    { step: "04", who: "SISTEMA (AI)", time: "2 min", action: "Prompt Engineer cria os 8 prompts visuais + decisão de layout por slide", color: C.gray },
    { step: "05", who: "ESTRATEGISTA", time: "2 min", action: "Gate 2: Valida prompts — imagem adequada, coerente com copy, sem risco", color: C.phase2 },
    { step: "06", who: "SISTEMA (AI)", time: "8–12 min", action: "Nano Banana 2 gera 8 imagens + Design Compositor compõe slides finais", color: C.gray },
    { step: "07", who: "GESTOR", time: "3 min", action: "Revisão final das artes, download da pasta e agendamento no Meta", color: C.phase5 },
  ];

  sop.forEach((st, i) => {
    const y = 1.48 + i * 0.82;
    // Linha background alternada
    if (i % 2 === 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.45, y, w: 12.4, h: 0.78,
        fill: { color: "0C0C18" }, line: { color: "0C0C18" },
      });
    }
    // Step number
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.45, y: y + 0.12, w: 0.48, h: 0.48,
      fill: { color: st.color }, line: { color: st.color },
    });
    s.addText(st.step, {
      x: 0.45, y: y + 0.15, w: 0.48, h: 0.42,
      fontSize: 15, bold: true, color: "000000",
      fontFace: "Calibri", align: "center", margin: 0,
    });
    // WHO
    s.addText(st.who, {
      x: 1.05, y: y + 0.1, w: 2.1, h: 0.35,
      fontSize: 10, bold: true, color: st.color,
      fontFace: "Calibri", charSpacing: 1, margin: 0,
    });
    // TIME
    s.addText(st.time, {
      x: 1.05, y: y + 0.44, w: 2.1, h: 0.3,
      fontSize: 10, color: C.grayDim,
      fontFace: "Calibri", margin: 0,
    });
    // ACTION
    s.addText(st.action, {
      x: 3.2, y: y + 0.17, w: 9.5, h: 0.48,
      fontSize: 12, color: C.white,
      fontFace: "Calibri", margin: 0,
    });
  });

  // Total
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 7.08, w: 12.4, h: 0.0,
    line: { color: C.gold, width: 0.5 },
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — PRÓXIMOS PASSOS E EXPANSÃO
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bgDark(s);
  addGoldBar(s);
  slideTitle(s, "O que este sistema pode se tornar");
  slideSubtitle(s, "A arquitetura atual suporta expansão imediata — sem reconstruir do zero");

  const expansions = [
    { icon: "📱", title: "Stories & Reels", desc: "Mesmo pipeline adaptado para 9:16. O Prompt Engineer instrui por formato. Design Compositor ajusta canvas.", status: "Próximo" },
    { icon: "🎯", title: "Anúncios Meta Ads", desc: "Copy Squad → Ad Squad (variações de headline e body para testes A/B). Geração de 5–10 criativos por campanha.", status: "Próximo" },
    { icon: "📧", title: "Sequência de Email", desc: "Adaptação do Oráculo para email: welcome → nurture → conversão. Mesmo processo, mesmo nível de qualidade.", status: "Planejado" },
    { icon: "🎨", title: "Multi-marca", desc: "O sistema aceita troca de paleta, fonte e watermark. Um pipeline → múltiplos clientes com identidade separada.", status: "Disponível" },
    { icon: "📊", title: "Analytics Loop", desc: "Integrar dados de engajamento do Instagram ao Copy Squad: o que performou alimenta o próximo carrossel.", status: "Futuro" },
    { icon: "🤖", title: "Agendamento Auto", desc: "Conexão com Buffer/Meta API para publicação automática com horário otimizado por algorítmo de melhor janela.", status: "Futuro" },
  ];

  expansions.forEach((e, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.45 + col * 4.22;
    const y = 1.55 + row * 2.7;
    const statusColors = { "Próximo": C.phase1, "Planejado": C.phase4, "Disponível": C.approved, "Futuro": C.phase3 };
    const sc = statusColors[e.status];
    card(s, x, y, 3.9, 2.4, "0D0D1A");
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 3.9, h: 0.06,
      fill: { color: sc }, line: { color: sc },
    });
    s.addText(e.icon + "  " + e.title, {
      x: x + 0.2, y: y + 0.15, w: 3.5, h: 0.45,
      fontSize: 14, bold: true, color: C.white,
      fontFace: "Calibri", margin: 0,
    });
    s.addText(e.desc, {
      x: x + 0.2, y: y + 0.68, w: 3.5, h: 1.2,
      fontSize: 11, color: C.gray, fontFace: "Calibri", margin: 0,
    });
    s.addText(e.status, {
      x: x + 0.2, y: y + 1.95, w: 3.5, h: 0.32,
      fontSize: 10, bold: true, color: sc,
      fontFace: "Calibri", charSpacing: 2, margin: 0,
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — FECHAMENTO
// ════════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Barra gold esquerda
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 7.5,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  // Linha dourada superior
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 2.6, w: 12.2, h: 0.04,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  s.addText("A vantagem não é ter IA.\nÉ ter o sistema certo\noperando a IA certa.", {
    x: 0.55, y: 2.75, w: 11, h: 2.4,
    fontSize: 40, bold: true, color: C.white,
    fontFace: "Calibri", charSpacing: 1,
  });

  // Linha dourada inferior
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 5.2, w: 12.2, h: 0.04,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  s.addText("Enquanto outros criam um post por dia, o sistema cria um carrossel em 20 minutos.", {
    x: 0.55, y: 5.35, w: 10, h: 0.55,
    fontSize: 16, color: C.gray, fontFace: "Calibri",
  });

  s.addText("FONTE OCULTA  ·  SISTEMA DE CONTEÚDO COM IA", {
    x: 0.55, y: 6.75, w: 10, h: 0.38,
    fontSize: 12, bold: true, color: C.goldDim,
    fontFace: "Calibri", charSpacing: 3,
  });
}

// ── Save ────────────────────────────────────────────────────────────────────────
const OUT = "C:/Users/julia/Desktop/Pipeline-Conteudo-IA-FonteOculta.pptx";
pres.writeFile({ fileName: OUT }).then(() => {
  console.log("OK: " + OUT);
}).catch(e => {
  console.error("ERRO:", e.message);
  process.exit(1);
});
