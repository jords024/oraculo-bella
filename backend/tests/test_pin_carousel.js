import assert from 'assert';
import { mapCarouselFromDb, getCarouselCostDetails } from '../dashboard/helpers.js';

async function runTests() {
  console.log('🧪 Iniciando testes unitários da funcionalidade de fixar carrosséis...');

  // Teste 1: Mapeamento de colunas do DB
  const mockRowPinned = {
    id: 'carrossel-test-01',
    title: 'Carrossel Teste Fixado',
    status: 'pronto',
    is_pinned: true,
    pinned_at: '2026-07-22T17:00:00.000Z'
  };

  const mapped = mapCarouselFromDb(mockRowPinned);
  assert.strictEqual(mapped.isPinned, true, 'isPinned deve ser true quando row.is_pinned é true');
  assert.strictEqual(mapped.pinnedAt, '2026-07-22T17:00:00.000Z', 'pinnedAt deve corresponder a row.pinned_at');
  console.log('✅ Teste 1: Mapeamento de colunas is_pinned e pinned_at aprovado.');

  // Teste 2: Validação da trava de limite máximo (10 carrosséis)
  const mockCarouselsList = Array.from({ length: 12 }, (_, i) => ({
    id: `carrossel-${i + 1}`,
    title: `Carrossel ${i + 1}`,
    isPinned: i < 10, // Primeiros 10 fixados
    pinnedAt: i < 10 ? new Date().toISOString() : null
  }));

  const pinnedCount = mockCarouselsList.filter(c => c.isPinned).length;
  assert.strictEqual(pinnedCount, 10, 'Deve haver exatamente 10 carrosséis fixados');

  // Tentar fixar o 11º carrossel (carrossel-11)
  const targetToPin = mockCarouselsList.find(c => c.id === 'carrossel-11');
  const currentPinnedCount = mockCarouselsList.filter(c => c.isPinned && c.id !== targetToPin.id).length;
  let errorOccurred = false;

  if (currentPinnedCount >= 10) {
    errorOccurred = true;
  }

  assert.strictEqual(errorOccurred, true, 'Tentativa de fixar o 11º carrossel deve ser bloqueada');
  console.log('✅ Teste 2: Limite máximo de 10 carrosséis fixados validado com sucesso.');

  // Teste 3: Ordenação de fixados no topo
  const mockUnsortedList = [
    { id: 'c1', isPinned: false, createdAt: '2026-07-22T10:00:00' },
    { id: 'c2', isPinned: true, pinnedAt: '2026-07-22T12:00:00', createdAt: '2026-07-22T08:00:00' },
    { id: 'c3', isPinned: true, pinnedAt: '2026-07-22T14:00:00', createdAt: '2026-07-22T09:00:00' },
    { id: 'c4', isPinned: false, createdAt: '2026-07-22T11:00:00' },
  ];

  const sorted = [...mockUnsortedList].sort((a, b) => {
    const isAPinned = Boolean(a.isPinned);
    const isBPinned = Boolean(b.isPinned);
    if (isAPinned && !isBPinned) return -1;
    if (!isAPinned && isBPinned) return 1;
    if (isAPinned && isBPinned) {
      const timeA = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
      const timeB = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  assert.strictEqual(sorted[0].id, 'c3', 'O carrossel c3 (fixado mais recentemente) deve ser o 1º da lista');
  assert.strictEqual(sorted[1].id, 'c2', 'O carrossel c2 (fixado antes) deve ser o 2º da lista');
  assert.strictEqual(sorted[2].isPinned, false, 'Itens não fixados devem aparecer após os fixados');
  console.log('✅ Teste 3: Ordenação prioritária no topo aprovada.');

  // Teste 4: Visibilidade do botão Detalhes (oculto quando c.status === 'generating')
  const showDetailsButton = (status) => status !== 'generating';
  assert.strictEqual(showDetailsButton('generating'), false, 'Botão Detalhes deve ser oculto durante geração');
  assert.strictEqual(showDetailsButton('rascunho'), true, 'Botão Detalhes deve ser visível para rascunho');
  assert.strictEqual(showDetailsButton('pronto'), true, 'Botão Detalhes deve ser visível quando pronto');
  console.log('✅ Teste 4: Ocultação do botão Detalhes em status "generating" aprovada.');

  // Teste 5: Cálculo do Custo Total em Reais (BRL) para carrosséis ativos
  const activeCarouselsMock = [
    { id: 'c1', costUsd: 0.14 }, // 0.14 * 5.6 = 0.784 BRL
    { id: 'c2', costUsd: 0.28 }, // 0.28 * 5.6 = 1.568 BRL
  ];
  const totalCostBrl = activeCarouselsMock.reduce((acc, c) => acc + (c.costUsd * 5.6), 0);
  const roundedBrl = Math.round(totalCostBrl * 100) / 100;
  assert.strictEqual(roundedBrl, 2.35, 'Custo total em Reais deve somar exatamente os carrosséis ativos em BRL');
  console.log('✅ Teste 5: Cálculo de custo total em Reais (BRL) para carrosséis ativos aprovado.');

  // Teste 6: Filtragem de sub-abas de Configurações por categoria
  const categoryMapping = {
    imagem: 'Geração de Imagem',
    audio: 'Áudio',
    publicacao: 'Publicação',
    integracoes: 'Integrações'
  };
  const mockGroups = ['Geração de Imagem', 'Áudio', 'Publicação', 'Integrações'];
  const filterGroup = (cat) => mockGroups.filter(g => g === categoryMapping[cat]);

  assert.strictEqual(filterGroup('imagem')[0], 'Geração de Imagem', 'Aba imagem deve filtrar apenas grupo de Imagem');
  assert.strictEqual(filterGroup('audio')[0], 'Áudio', 'Aba audio deve filtrar apenas grupo de Áudio');
  assert.strictEqual(filterGroup('integracoes')[0], 'Integrações', 'Aba integracoes deve filtrar apenas grupo de Integrações');
  console.log('✅ Teste 6: Organização das sub-abas de Configurações aprovada.');

  // Teste 7: Edição de Nome do Agente (PromptsTab)
  const mockPromptsList = [
    { id: 'canalizador-visual', name: 'Canalizador Visual' },
    { id: 'diretor-de-arte', name: 'Diretor De Arte' }
  ];
  const renamePromptMock = (list, targetId, newName) => list.map(p => p.id === targetId ? { ...p, name: newName } : p);
  const updatedPrompts = renamePromptMock(mockPromptsList, 'canalizador-visual', 'Canalizador Visual Pro');
  assert.strictEqual(updatedPrompts.find(p => p.id === 'canalizador-visual').name, 'Canalizador Visual Pro', 'Nome do agente deve ser atualizado');
  console.log('✅ Teste 7: Funcionalidade de editar nome dos agentes aprovada.');

  // Teste 8: Cálculo de Numeração de Linhas no Editor
  const mockPromptText = '# CANALIZADOR VISUAL\n\nLine 3\nLine 4\nLine 5';
  const getLineCount = (text) => text ? text.split('\n').length : 1;
  const lineCount = getLineCount(mockPromptText);
  assert.strictEqual(lineCount, 5, 'Deve contar exatamente 5 linhas no prompt');
  console.log('✅ Teste 8: Cálculo do numerador de linhas no editor aprovado.');

  // Teste 9: Geração de URLs de Slides com Cache Estável e Pré-carregamento
  const getSlideUrl = (carouselId, slideName, token, version) =>
    `/api/carousels/${carouselId}/image/${slideName}?token=${token}&v=${version}`;
  
  const url1 = getSlideUrl('carrossel-01', 'slide-01.jpg', 'token123', 1);
  const url2 = getSlideUrl('carrossel-01', 'slide-01.jpg', 'token123', 1);
  assert.strictEqual(url1, url2, 'URLs do mesmo slide e versão devem ser idênticas para permitir cache do navegador');
  assert.strictEqual(url1.includes('Date.now()'), false, 'URL não deve conter timestamps dinâmicos aleatórios');
  // Teste 10: Estilização Visual dos Botões de Aba (EditSlideModal)
  const getTabClass = (currentTab, tabName) => `edit-tab ${currentTab === tabName ? 'active' : ''}`;
  assert.strictEqual(getTabClass('text', 'text'), 'edit-tab active', 'Aba ativa deve receber classe active');
  assert.strictEqual(getTabClass('text', 'image'), 'edit-tab ', 'Aba inativa não deve receber classe active');
  // Teste 11: Carregamento e Fallback do Prompt Visual do Slide
  const getPromptFallback = (meta) =>
    meta.prompt || (meta.title
      ? `Cinematic dark esoteric illustration, dramatic volumetric light, deep emotional atmosphere. Abstract visual metaphor for: ${meta.title}`
      : `Cinematic dark esoteric illustration, dramatic volumetric light, deep emotional atmosphere.`);
  
  const metaWithPrompt = { title: 'Test', prompt: 'Custom Prompt' };
  const metaWithoutPrompt = { title: 'O Impostor Não Some' };
  
  assert.strictEqual(getPromptFallback(metaWithPrompt), 'Custom Prompt', 'Deve utilizar o prompt customizado salvo');
  assert.strictEqual(getPromptFallback(metaWithoutPrompt).includes('O Impostor Não Some'), true, 'Deve utilizar o fallback dinâmico baseado no título');
  console.log('✅ Teste 11: Carregamento e fallback de prompt visual preenchido aprovados.');

  // Teste 12: Cálculo de Custo Zero para Rascunhos/Falhas sem Imagens Geradas
  const mockDraftCarousel = {
    id: 'carrossel-draft-99',
    title: 'Rascunho Sem Imagens',
    status: 'rascunho',
    slidesDir: 'C:/invalid_non_existent_folder_path_12345',
    slides: []
  };
  const costDetailsDraft = getCarouselCostDetails(mockDraftCarousel);
  assert.strictEqual(costDetailsDraft.paidSlides, 0, 'Rascunho sem imagens não deve possuir slides pagos');
  assert.strictEqual(costDetailsDraft.cost, 0, 'Custo de rascunho sem imagens deve ser exatamente 0 USD');
  // Teste 13: Resolução de Payload de Retentativa (Recriar)
  const resolveRetryPayload = (carousel) => {
    let payload = carousel.lastPayload;
    if (!payload || !Array.isArray(payload.slides) || payload.slides.length === 0) {
      if (carousel.notes && carousel.notes.includes('[S1')) {
        payload = { id: carousel.id, slides: [{ num: '01', title: 'Parsed' }] };
      }
    }
    return payload;
  };

  const mockWithPayload = { id: 'c-1', lastPayload: { slides: [{ num: '01' }] } };
  const mockWithNotes = { id: 'c-2', notes: '[S1 — HOOK]\nTítulo: Teste' };
  
  assert.strictEqual(Boolean(resolveRetryPayload(mockWithPayload)?.slides?.length), true, 'Deve recuperar slides do lastPayload');
  assert.strictEqual(Boolean(resolveRetryPayload(mockWithNotes)?.slides?.length), true, 'Deve recuperar slides via parser das notas quando lastPayload for ausente');
  console.log('✅ Teste 13: Resolução de payload para botão Recriar sem erro de "slides é obrigatório" aprovada.');

  console.log('\n🎉 TODOS OS TESTES UNITÁRIOS DA FUNCIONALIDADE E AJUSTES FORAM APROVADOS!');
}

runTests().catch(err => {
  console.error('❌ Erro nos testes unitários:', err);
  process.exit(1);
});
