export const IDEAS_PROMPT = `Sugira 5 ideias de temas e ganchos viscerais para carrosséis de Isabella Dalcin (@isabella.dalcin · Academia Sete), focados em maturidade emocional, saúde integrativa feminina e Método T.A.F.A.

Para cada uma das 5 ideias, formate exatamente assim:
1. Tema: [Nome do tema]
Título: [Gancho visceral do Slide 1]

2. Tema: [Nome do tema]
Título: [Gancho visceral do Slide 1]

Seja direto, sem introduções e sem travessões. Apenas as 5 ideias numeradas.`;

export function parseIdeasFromText(text) {
  if (!text || typeof text !== 'string') return [];
  
  const ideas = [];
  const clean = text.replace(/\r\n/g, '\n');

  // 1. Tentar regex com Tema + Título (com ou sem **)
  const lines = clean.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;

    // Detecta linhas com "Tema: ..." ou "1. Tema: ..." ou "1. **Tema: ...**"
    const themeMatch = l.match(/^(?:(\d+)[.)]\s*)?\*{0,2}Tema:\*{0,2}\s*(.+)/i);
    if (themeMatch) {
      const num = themeMatch[1] || String(ideas.length + 1);
      const rawTheme = themeMatch[2].replace(/\*\*/g, '').trim();

      // Procura a próxima linha com "Título: ..." ou texto de descrição
      let rawTitle = '';
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const titleMatch = nextLine.match(/\*?\*?T[ií]tulo:?\*?\*?\s*(.+)/i);
        if (titleMatch) {
          rawTitle = titleMatch[1].replace(/\*\*/g, '').trim();
        } else if (!nextLine.match(/^(\d+)[\.\)]/) && !nextLine.toLowerCase().startsWith('tema:')) {
          rawTitle = nextLine.replace(/\*\*/g, '').trim();
        }
      }

      if (rawTheme && rawTheme.length > 2 && !rawTheme.toLowerCase().startsWith('escolha')) {
        ideas.push({
          num,
          theme: rawTheme,
          title: rawTitle || rawTheme
        });
      }
    }
  }

  // 2. Fallback para itens numerados (1. ... 2. ...) se não achou com a tag Tema
  if (ideas.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      const numMatch = l.match(/^(\d+)[\.\)]\s*(.+)/);
      if (numMatch) {
        const lineText = numMatch[2].replace(/\*\*/g, '').replace(/^Tema:\s*/i, '').trim();
        if (lineText && !lineText.toLowerCase().startsWith('escolha') && lineText.length > 4) {
          ideas.push({
            num: numMatch[1],
            theme: lineText,
            title: lineText
          });
        }
      }
    }
  }

  return ideas.slice(0, 6);
}

export const TEMPLATES = [
  {
    id: 'bella_essencial',
    label: 'Bella — Essencial',
    badge: '● Essencial',
    format: 'TAFA',
    color: '#B8623E',
    desc: 'Universo esotérico sensível, imagem expressiva em destaque e texto abaixo.',
    icon: '●', shortName: 'Bella Essencial', accentRgb: '184, 98, 62',
    welcomeTitle: 'Uma imagem. Uma ideia. Uma virada.',
    welcomeDescription: 'Uma metáfora psicológica exclusiva para cada conteúdo, com desenvolvimento limpo e pausas elegantes.',
    suggestions: ['A mulher controladora quer descanso', 'Quando ser necessária virou identidade', 'Receber também exige maturidade']
  },
  {
    id: 'bella_editorial_luxo',
    label: 'Bella — Direção Viva',
    badge: '✦ Direção Viva',
    format: 'TAFA',
    color: '#B8623E',
    desc: 'A linguagem visual nasce da copy: colagem, surrealismo, matéria, grafismo ou cinema.',
    icon: '✦', shortName: 'Direção Viva', accentRgb: '184, 98, 62',
    welcomeTitle: 'Cada ideia encontra sua própria forma',
    welcomeDescription: 'Uma direção editorial variável, expressiva e autoral — sem repetir a mesma receita de capa.',
    suggestions: ['O preço de não ser uma mulher difícil', 'O corpo que aprendeu a pedir licença', 'Quando saber muito já não transforma']
  },
  {
    id: 'bella_organico_terracota',
    label: 'Bella — Terracota Orgânico',
    badge: '🌿 Terracota',
    format: 'TAFA',
    color: '#C1784F',
    desc: 'Matéria, raízes e acolhimento em terracota e creme.',
    icon: '◌', shortName: 'Terracota Orgânico', accentRgb: '193, 120, 79',
    welcomeTitle: 'Conteúdo que devolve ao corpo',
    welcomeDescription: 'Texturas naturais, terra e ancestralidade para narrativas de enraizamento e maturidade.',
    suggestions: ['A mulher que sustenta todo mundo', 'Seu corpo não esqueceu de voltar', 'Raízes também precisam de espaço']
  },
  {
    id: 'bella_verde_musgo',
    label: 'Bella — Verde Musgo Botânico',
    badge: '🍃 Botânico',
    format: 'TAFA',
    color: '#5C7A5E',
    desc: 'Botânica, ciclos e cura silenciosa em verde-musgo e creme.',
    icon: '❧', shortName: 'Botânico', accentRgb: '92, 122, 94',
    welcomeTitle: 'Narrativas que crescem por dentro',
    welcomeDescription: 'Luz suave, folhas, raízes e ciclos naturais para conteúdos de cura e integração feminina.',
    suggestions: ['Nem toda pausa é estagnação', 'O ciclo que você insiste em apressar', 'A cura também precisa de inverno']
  },
  {
    id: 'bella_ambar_sagrado',
    label: 'Bella — Âmbar Sagrado',
    badge: '☀️ Âmbar',
    format: 'TAFA',
    color: '#C9973A',
    desc: 'Luz solar filtrada, intimidade e presença em âmbar.',
    icon: '☼', shortName: 'Âmbar Sagrado', accentRgb: '201, 151, 58',
    welcomeTitle: 'Clareza para o que já amadureceu',
    welcomeDescription: 'Calor, silêncio e luz dourada para mensagens de consciência, passagem e integração.',
    suggestions: ['A clareza que chega depois da pressa', 'Você já sabe o que precisa encerrar', 'Nem toda luz precisa fazer barulho']
  }
];

export function getTemplate(templateId) {
  return TEMPLATES.find(template => template.id === templateId) || TEMPLATES[0];
}
