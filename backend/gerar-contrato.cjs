const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer, LevelFormat, VerticalAlign
} = require('docx');
const fs = require('fs');

// ── CORES E ESTILOS ──────────────────────────────────────────────
const AZUL       = "1A3A6B";
const AZUL_LIGHT = "E8EEF8";
const CINZA      = "555555";
const BORDA = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDA_AZUL = { style: BorderStyle.SINGLE, size: 4, color: AZUL };
const SEM_BORDA  = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

const borders_table = { top: BORDA, bottom: BORDA, left: BORDA, right: BORDA };
const borders_header = { top: SEM_BORDA, bottom: BORDA_AZUL, left: SEM_BORDA, right: SEM_BORDA };

// ── HELPERS ──────────────────────────────────────────────────────
const p = (children, opts = {}) => new Paragraph({ children, ...opts });
const t = (text, opts = {}) => new TextRun({ text, font: "Arial", size: 22, color: CINZA, ...opts });
const tBold = (text, opts = {}) => t(text, { bold: true, ...opts });
const tBranco = () => t("");

const pVazio = () => p([t("")]);

const titulo = (text) => p([
  new TextRun({ text, font: "Arial", size: 26, bold: true, color: AZUL })
], {
  spacing: { before: 360, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: AZUL, space: 4 } }
});

const secao = (num, text) => p([
  new TextRun({ text: `${num}. ${text}`, font: "Arial", size: 24, bold: true, color: AZUL })
], { spacing: { before: 320, after: 120 } });

const subSecao = (text) => p([
  new TextRun({ text, font: "Arial", size: 22, bold: true, color: "2E2E2E" })
], { spacing: { before: 200, after: 80 } });

const corpo = (text) => p([t(text)], {
  spacing: { before: 80, after: 80 },
  alignment: AlignmentType.JUSTIFIED
});

const corpoBold = (text) => p([tBold(text)], {
  spacing: { before: 80, after: 80 },
  alignment: AlignmentType.JUSTIFIED
});

const item = (text) => new Paragraph({
  children: [t(text)],
  numbering: { reference: "bullets", level: 0 },
  spacing: { before: 60, after: 60 },
  alignment: AlignmentType.JUSTIFIED
});

const linha_assinatura = (label) => [
  p([t("_".repeat(72))], { spacing: { before: 400, after: 60 } }),
  p([t(label)], { spacing: { before: 0, after: 4 } }),
];

// ── TABELA DE PARTES ─────────────────────────────────────────────
const tabelaPartes = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [4620, 4740],
  rows: [
    // Header
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA_AZUL, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          shading: { fill: AZUL_LIGHT, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          width: { size: 4620, type: WidthType.DXA },
          children: [p([new TextRun({ text: "CONTRATANTE", font: "Arial", size: 22, bold: true, color: AZUL })])]
        }),
        new TableCell({
          borders: { top: BORDA_AZUL, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          shading: { fill: AZUL_LIGHT, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          width: { size: 4740, type: WidthType.DXA },
          children: [p([new TextRun({ text: "CONTRATADO", font: "Arial", size: 22, bold: true, color: AZUL })])]
        }),
      ]
    }),
    // Dados
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          margins: { top: 120, bottom: 140, left: 160, right: 160 },
          width: { size: 4620, type: WidthType.DXA },
          children: [
            p([tBold("HAU CACAU SUPERALIMENTOS LTDA")], { spacing: { before: 0, after: 60 } }),
            p([t("CNPJ: 54.857.294/0001-73")], { spacing: { before: 0, after: 60 } }),
            p([t("Rua Cel. Massot, 233, Apto 201")], { spacing: { before: 0, after: 60 } }),
            p([t("Bairro Tristeza – Porto Alegre/RS")], { spacing: { before: 0, after: 60 } }),
            p([t("CEP: 91.910-530")], { spacing: { before: 0, after: 60 } }),
            p([t("Representante: Bruno José Marques da Silva")], { spacing: { before: 0, after: 60 } }),
            p([t("CPF: 355.806.948-06")], { spacing: { before: 0, after: 0 } }),
          ]
        }),
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          margins: { top: 120, bottom: 140, left: 160, right: 160 },
          width: { size: 4740, type: WidthType.DXA },
          children: [
            p([tBold("BRUNO JORD\u00C3O RODRIGUES DE OLIVEIRA")], { spacing: { before: 0, after: 60 } }),
            p([t("CNPJ: 43.330.350/4000-19")], { spacing: { before: 0, after: 60 } }),
            p([t("Rua Jos\u00E9 Zorzenon, 520")], { spacing: { before: 0, after: 60 } }),
            p([t("Bairro Ribeir\u00E2nia")], { spacing: { before: 0, after: 60 } }),
            p([t("Doravante denominado PRESTADOR DE SERVI\u00C7OS")], { spacing: { before: 0, after: 0 } }),
          ]
        }),
      ]
    }),
  ]
});

// ── TABELA DE ENTREGÁVEIS ────────────────────────────────────────
const tabelaEntregaveis = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3400, 5960],
  rows: [
    // header row
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA_AZUL, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          shading: { fill: AZUL_LIGHT, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          children: [p([new TextRun({ text: "ENTREGÁVEL", font: "Arial", size: 21, bold: true, color: AZUL })])]
        }),
        new TableCell({
          borders: { top: BORDA_AZUL, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          shading: { fill: AZUL_LIGHT, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([new TextRun({ text: "DESCRI\u00C7\u00C3O", font: "Arial", size: 21, bold: true, color: AZUL })])]
        }),
      ]
    }),
    // Row 1
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          shading: { fill: "F7F9FC", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [p([tBold("Or\u00E1culo de Conte\u00FAdo")])]
        }),
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([t("Acesso ao sistema por 6 (seis) meses completos, com capacidade de gera\u00E7\u00E3o e publica\u00E7\u00E3o di\u00E1ria de conte\u00FAdo. O volume de publica\u00E7\u00F5es est\u00E1 diretamente relacionado ao custo de API de gera\u00E7\u00E3o de imagens suportado pelo Contratante — quanto maior o investimento em API, maior a cadencia di\u00E1ria de conte\u00FAdo gerado.")], { alignment: AlignmentType.JUSTIFIED })]
        }),
      ]
    }),
    // Row 2
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [p([tBold("Acompanhamento Estrat\u00E9gico (3 meses)")])]
        }),
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([t("Durante os 3 (tr\u00EAs) primeiros meses de vig\u00EAncia, o Prestador realizar\u00E1 1 (um) encontro a cada 15 (quinze) dias com o Contratante, totalizando at\u00E9 6 (seis) sess\u00F5es. Cada encontro ter\u00E1 dura\u00E7\u00E3o m\u00EDnima de 45 minutos, com foco em alinhamento do sistema, an\u00E1lise de m\u00E9tricas e proje\u00E7\u00F5es de crescimento.")], { alignment: AlignmentType.JUSTIFIED })]
        }),
      ]
    }),
    // Row 3
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          shading: { fill: "F7F9FC", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [p([tBold("Curadoria de Funil e Estrat\u00E9gia")])]
        }),
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([t("O Prestador dedicar\u00E1 aten\u00E7\u00E3o \u00E0 organiza\u00E7\u00E3o das ideias e \u00E0 defini\u00E7\u00E3o do funil de conte\u00FAdo mais adequado ao posicionamento do Contratante, garantindo que cada publica\u00E7\u00E3o gerada esteja alinhada \u00E0 proposta comercial da marca e orientada para convers\u00E3o.")], { alignment: AlignmentType.JUSTIFIED })]
        }),
      ]
    }),
    // Row 4
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [p([tBold("Conte\u00FAdo de Alta Perfura\u00E7\u00E3o de Bolha")])]
        }),
        new TableCell({
          borders: { top: BORDA, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([t("Os conte\u00FAdos produzidos pelo Oráculo de Conte\u00FAdo s\u00E3o estruturados para furar a bolha do algoritmo e atrair novos p\u00FAblicos qualificados de forma org\u00E2nica — reduzindo a depend\u00EAncia de tr\u00E1fego pago e aumentando a visibilidade, a autoridade e as vendas da marca.")], { alignment: AlignmentType.JUSTIFIED })]
        }),
      ]
    }),
  ]
});

// ── TABELA PAGAMENTO (valor em branco) ───────────────────────────
const tabelaPagamento = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3400, 5960],
  rows: [
    new TableRow({
      children: [
        new TableCell({
          borders: { top: BORDA_AZUL, bottom: BORDA, left: SEM_BORDA, right: BORDA },
          shading: { fill: AZUL_LIGHT, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          children: [p([new TextRun({ text: "ITEM", font: "Arial", size: 21, bold: true, color: AZUL })])]
        }),
        new TableCell({
          borders: { top: BORDA_AZUL, bottom: BORDA, left: BORDA, right: SEM_BORDA },
          shading: { fill: AZUL_LIGHT, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([new TextRun({ text: "VALOR", font: "Arial", size: 21, bold: true, color: AZUL })])]
        }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: borders_table,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          children: [p([t("Valor Total do Contrato")])]
        }),
        new TableCell({
          borders: borders_table,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([tBold("R$ 4.500,00 (quatro mil e quinhentos reais)")])]
        }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: borders_table,
          shading: { fill: "F7F9FC", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          children: [p([t("1\u00AA Parcela (Entrada)")])]
        }),
        new TableCell({
          borders: borders_table,
          shading: { fill: "F7F9FC", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([tBold("R$ 1.800,00"), t(" — devida na assinatura deste contrato")])]
        }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: borders_table,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          children: [p([t("2\u00AA Parcela")])]
        }),
        new TableCell({
          borders: borders_table,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([tBold("R$ 2.700,00"), t(" — devida em _____ / _____ / 2025")])]
        }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: borders_table,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 3400, type: WidthType.DXA },
          children: [p([t("Custo de API (por conta do Contratante)")])]
        }),
        new TableCell({
          borders: borders_table,
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          width: { size: 5960, type: WidthType.DXA },
          children: [p([t("Pago diretamente pelo Contratante conforme uso — n\u00E3o incluso no valor acima")])]
        }),
      ]
    }),
  ]
});

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTO
// ═══════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: CINZA } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "CONTRATO DE PRESTA\u00C7\u00C3O DE SERVI\u00C7OS", font: "Arial", size: 18, bold: true, color: AZUL }),
              new TextRun({ text: "\tOr\u00E1culo de Conte\u00FAdo", font: "Arial", size: 18, color: "888888" }),
            ],
            tabStops: [{ type: "right", position: 8646 }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: AZUL, space: 4 } },
            spacing: { after: 60 }
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Hau Cacau Superalimentos Ltda  \u2022  Bruno Jord\u00E3o Rodrigues de Oliveira  \u2022  P\u00E1gina ", font: "Arial", size: 17, color: "888888" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 17, color: "888888" }),
            ],
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
            spacing: { before: 60 }
          })
        ]
      })
    },
    children: [

      // ── CABEÇALHO DO DOCUMENTO ──────────────────────────────────
      p([new TextRun({ text: "CONTRATO DE PRESTA\u00C7\u00C3O DE SERVI\u00C7OS", font: "Arial", size: 36, bold: true, color: AZUL })], {
        alignment: AlignmentType.CENTER, spacing: { before: 160, after: 80 }
      }),
      p([new TextRun({ text: "Or\u00E1culo de Conte\u00FAdo — Sistema Inteligente de Conte\u00FAdo Digital", font: "Arial", size: 24, color: "555555", italics: true })], {
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }
      }),
      p([new TextRun({ text: "Data de celebra\u00E7\u00E3o: _____ / _____ / 2025", font: "Arial", size: 21, color: "888888" })], {
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 320 }
      }),

      // ── IDENTIFICAÇÃO DAS PARTES ────────────────────────────────
      titulo("IDENTIFICA\u00C7\u00C3O DAS PARTES"),
      corpo("As partes abaixo identificadas celebram o presente Contrato de Presta\u00E7\u00E3o de Servi\u00E7os, que se reger\u00E1 pelas cl\u00E1usulas e condi\u00E7\u00F5es a seguir estabelecidas:"),
      pVazio(),
      tabelaPartes,
      pVazio(),

      // ── 1. OBJETO ────────────────────────────────────────────────
      secao("1", "DO OBJETO"),
      corpo("O presente contrato tem por objeto a presta\u00E7\u00E3o, pelo CONTRATADO, de servi\u00E7os de implementa\u00E7\u00E3o, opera\u00E7\u00E3o e acompanhamento do sistema denominado \u201COr\u00E1culo de Conte\u00FAdo\u201D, voltado \u00E0 produ\u00E7\u00E3o e publica\u00E7\u00E3o automatizada de conte\u00FAdo digital para as redes sociais do CONTRATANTE."),
      corpo("O objetivo central desta parceria \u00E9 eliminar o problema de tra\u00E7\u00E3o digital, ampliar a visibilidade org\u00E2nica da marca HAU CACAU SUPERALIMENTOS e gerar demanda qualificada de forma constante e inteligente, por meio de conte\u00FAdos que perfuram o algoritmo e constroem autoridade no mercado."),

      // ── 2. ENTREGÁVEIS ───────────────────────────────────────────
      secao("2", "DOS ENTREGÁVEIS"),
      corpo("Os servi\u00E7os contratados compreendem os seguintes entregáveis:"),
      pVazio(),
      tabelaEntregaveis,
      pVazio(),
      corpo("Observa\u00E7\u00E3o importante sobre o custo de API: o sistema Or\u00E1culo de Conte\u00FAdo utiliza APIs externas de gera\u00E7\u00E3o de imagem (como Midjourney, Leonardo.ai, DALL-E ou similar). Esses custos s\u00E3o de exclusiva responsabilidade do CONTRATANTE, cobrados diretamente pelas plataformas fornecedoras, e n\u00E3o est\u00E3o inclu\u00EDdos na remunera\u00E7\u00E3o do CONTRATADO. O volume di\u00E1rio de conte\u00FAdo gerado \u00E9 diretamente proporcional ao investimento que o CONTRATANTE decidir sustentar nessas plataformas."),

      // ── 3. VIGÊNCIA ──────────────────────────────────────────────
      secao("3", "DA VIG\u00CANCIA"),
      corpo("Este contrato entra em vigor na data de sua assinatura e ter\u00E1 dura\u00E7\u00E3o de 6 (seis) meses, podendo ser renovado de comum acordo entre as partes mediante simples manifesta\u00E7\u00E3o por escrito (mensagem, e-mail ou documento) at\u00E9 15 dias antes do t\u00E9rmino do prazo vigente."),
      item("M\u00EAs 1 ao 3: Sistema ativo + acompanhamento quinzenal (1 encontro a cada 15 dias — 6 sess\u00F5es no total)"),
      item("M\u00EAs 4 ao 6: Sistema ativo com suporte mensal e disponibilidade por canais digitais"),

      // ── 4. OBRIGAÇÕES DO CONTRATADO ──────────────────────────────
      secao("4", "DAS OBRIGA\u00C7\u00F5ES DO CONTRATADO"),
      corpo("S\u00E3o obriga\u00E7\u00F5es do CONTRATADO:"),
      item("Entregar e manter o sistema Or\u00E1culo de Conte\u00FAdo ativo e funcional durante todo o per\u00EDodo de vig\u00EAncia"),
      item("Realizar os encontros de acompanhamento quinzenais (a cada 15 dias) previstos nos 3 primeiros meses, com agenda combinada com anteced\u00EAncia m\u00EDnima de 48 horas"),
      item("Auxiliar na defini\u00E7\u00E3o e curadoria do funil de conte\u00FAdo mais adequado \u00E0 proposta e ao p\u00FAblico da marca"),
      item("Comunicar com anteced\u00EAncia qualquer altera\u00E7\u00E3o t\u00E9cnica relevante no sistema que possa afetar as publica\u00E7\u00F5es"),
      item("Manter sigilo sobre as informa\u00E7\u00F5es estrat\u00E9gicas do CONTRATANTE"),

      // ── 5. OBRIGAÇÕES DO CONTRATANTE ─────────────────────────────
      secao("5", "DAS OBRIGA\u00C7\u00F5ES DO CONTRATANTE"),
      corpo("S\u00E3o obriga\u00E7\u00F5es do CONTRATANTE:"),
      item("Efetuar o pagamento conforme acordado na Cl\u00E1usula 6"),
      item("Arcar com os custos de API das plataformas de gera\u00E7\u00E3o de imagem contratadas por conta pr\u00F3pria"),
      item("Participar dos encontros de alinhamento com presen\u00E7a e engajamento ativo"),
      item("Fornecer ao CONTRATADO as informa\u00E7\u00F5es necess\u00E1rias sobre a marca (identidade visual, tom de voz, produtos, p\u00FAblico-alvo) para calibra\u00E7\u00E3o do sistema"),
      item("Conceder os acessos necess\u00E1rios \u00E0s plataformas de publica\u00E7\u00E3o (Instagram, etc.)"),

      // ── 6. REMUNERAÇÃO ───────────────────────────────────────────
      secao("6", "DA REMUNERA\u00C7\u00C3O"),
      corpo("Pelo conjunto de servi\u00E7os descritos neste contrato, o CONTRATANTE pagar\u00E1 ao CONTRATADO:"),
      pVazio(),
      tabelaPagamento,
      pVazio(),
      corpo("Todos os valores s\u00E3o acordados livremente entre as partes. Em caso de atraso no pagamento superior a 10 (dez) dias, o CONTRATANTE dever\u00E1 notificar o CONTRATADO para que as partes alinhem nova data, preservando o esp\u00EDrito colaborativo desta parceria."),

      // ── 7. RESCISÃO ──────────────────────────────────────────────
      secao("7", "DA RESCIS\u00C3O"),
      corpo("Este contrato foi constru\u00EDdo sobre uma rela\u00E7\u00E3o de confian\u00E7a m\u00FAtua. Diante disso, a rescis\u00E3o segue crit\u00E9rios simples:"),
      item("Qualquer das partes poder\u00E1 encerrar o contrato com aviso pr\u00E9vio de 15 (quinze) dias, por escrito"),
      item("N\u00E3o h\u00E1 multa rescis\u00F3ria para nenhuma das partes"),
      item("Em caso de rescis\u00E3o, o CONTRATADO garantir\u00E1 ao CONTRATANTE acesso ao sistema e suporte por todo o per\u00EDodo de aviso pr\u00E9vio pago"),
      item("Valores j\u00E1 pagos e servi\u00E7os j\u00E1 prestados n\u00E3o s\u00E3o passíveis de reembolso"),
      corpo("O objetivo de ambas as partes \u00E9 que esta rela\u00E7\u00E3o cres\u00E7a e se renove. A cl\u00E1usula de rescis\u00E3o existe apenas para garantir seguran\u00E7a — n\u00E3o para criar barreiras."),

      // ── 8. CONFIDENCIALIDADE ─────────────────────────────────────
      secao("8", "DA CONFIDENCIALIDADE"),
      corpo("Ambas as partes comprometem-se a manter sigilo sobre todas as informa\u00E7\u00F5es estrat\u00E9gicas, financeiras e operacionais trocadas no \u00E2mbito desta rela\u00E7\u00E3o. Essa obriga\u00E7\u00E3o permanece v\u00E1lida ap\u00F3s o t\u00E9rmino deste contrato pelo prazo de 12 (doze) meses."),

      // ── 9. DISPOSIÇÕES GERAIS ────────────────────────────────────
      secao("9", "DISPOSI\u00C7\u00D5ES GERAIS"),
      item("Este contrato n\u00E3o gera v\u00EDnculo empregatício entre as partes"),
      item("Altera\u00E7\u00F5es neste contrato s\u00F3 ter\u00E3o validade se formalizadas por escrito e assinadas por ambas as partes"),
      item("Fica eleito o foro da comarca de Porto Alegre/RS para dirimir quaisquer d\u00FAvidas ou lit\u00EDgios decorrentes deste instrumento, com renúncia expressa a qualquer outro"),
      item("As partes declaram que leram, compreenderam e concordam integralmente com os termos deste contrato"),

      // ── ASSINATURAS ──────────────────────────────────────────────
      pVazio(),
      pVazio(),
      p([new TextRun({ text: "Porto Alegre/RS, _____ de __________________ de 2025.", font: "Arial", size: 21, color: "444444" })], {
        alignment: AlignmentType.CENTER, spacing: { before: 200, after: 400 }
      }),

      // Assinaturas lado a lado via tabela
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4380, 4980],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: SEM_BORDA, bottom: SEM_BORDA, left: SEM_BORDA, right: SEM_BORDA },
                margins: { top: 0, bottom: 0, left: 0, right: 240 },
                width: { size: 4380, type: WidthType.DXA },
                children: [
                  p([t("_".repeat(52))], { spacing: { before: 560, after: 80 } }),
                  p([tBold("HAU CACAU SUPERALIMENTOS LTDA")], { spacing: { before: 0, after: 40 } }),
                  p([t("Bruno Jos\u00E9 Marques da Silva")], { spacing: { before: 0, after: 40 } }),
                  p([t("CPF: 355.806.948-06")], { spacing: { before: 0, after: 0 } }),
                  p([t("CONTRATANTE")], { spacing: { before: 40, after: 0 } }),
                ]
              }),
              new TableCell({
                borders: { top: SEM_BORDA, bottom: SEM_BORDA, left: SEM_BORDA, right: SEM_BORDA },
                margins: { top: 0, bottom: 0, left: 240, right: 0 },
                width: { size: 4980, type: WidthType.DXA },
                children: [
                  p([t("_".repeat(52))], { spacing: { before: 560, after: 80 } }),
                  p([tBold("BRUNO JORD\u00C3O RODRIGUES DE OLIVEIRA")], { spacing: { before: 0, after: 40 } }),
                  p([t("CNPJ: 43.330.350/4000-19")], { spacing: { before: 0, after: 40 } }),
                  p([t("CONTRATADO / PRESTADOR DE SERVI\u00C7OS")], { spacing: { before: 40, after: 0 } }),
                ]
              }),
            ]
          })
        ]
      }),

      // Testemunhas
      pVazio(),
      pVazio(),
      p([new TextRun({ text: "TESTEMUNHAS:", font: "Arial", size: 20, bold: true, color: "888888" })], { spacing: { before: 200, after: 0 } }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4380, 4980],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: SEM_BORDA, bottom: SEM_BORDA, left: SEM_BORDA, right: SEM_BORDA },
                margins: { top: 0, bottom: 0, left: 0, right: 240 },
                width: { size: 4380, type: WidthType.DXA },
                children: [
                  p([t("_".repeat(52))], { spacing: { before: 400, after: 80 } }),
                  p([t("Nome: _______________________________")], { spacing: { before: 0, after: 40 } }),
                  p([t("CPF: ________________________________")], { spacing: { before: 0, after: 0 } }),
                ]
              }),
              new TableCell({
                borders: { top: SEM_BORDA, bottom: SEM_BORDA, left: SEM_BORDA, right: SEM_BORDA },
                margins: { top: 0, bottom: 0, left: 240, right: 0 },
                width: { size: 4980, type: WidthType.DXA },
                children: [
                  p([t("_".repeat(52))], { spacing: { before: 400, after: 80 } }),
                  p([t("Nome: _______________________________")], { spacing: { before: 0, after: 40 } }),
                  p([t("CPF: ________________________________")], { spacing: { before: 0, after: 0 } }),
                ]
              }),
            ]
          })
        ]
      }),

    ]
  }]
});

// ── GERAR ARQUIVO ────────────────────────────────────────────────
const outputPath = "C:/Users/julia/nano-banana-mcp/CONTRATO-Hau-Cacau-Oraculo-v2.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("OK: " + outputPath);
}).catch(err => {
  console.error("ERRO:", err.message);
});
