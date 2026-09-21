import { useState, useEffect } from 'react';
import { customFetch } from '../utils/customFetch';
import { parseCarouselText } from '../utils/carouselParser';

export function useCarouselsData({ showToast, setActiveTab }) {
  const [allCarousels, setAllCarousels] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [imageVersion, setImageVersion] = useState(Date.now());

  const loadCarousels = async () => {
    try {
      const res = await customFetch('/api/carousels');
      const data = await res.json();
      if (res.ok) {
        setAllCarousels(data);
        setImageVersion(Date.now());
        return data;
      }
    } catch (e) {
      showToast?.('Erro ao carregar carrosséis.');
    }
    return [];
  };

  const loadStats = async () => {
    try {
      const res = await customFetch('/api/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (e) {
      showToast?.('Erro ao carregar estatísticas.');
    }
  };

  // A fila também precisa manter a tela atualizando. Antes, um item em
  // `queued` podia ficar visualmente parado até que outra ação recarregasse a
  // lista, dando a impressão de que o botão não tinha funcionado.
  useEffect(() => {
    const hasActiveGeneration = allCarousels.some(c => ['queued', 'generating'].includes(c.status));
    if (!hasActiveGeneration) return;
    const interval = setInterval(() => {
      loadCarousels();
    }, 5000);
    return () => clearInterval(interval);
  }, [allCarousels]);

  const handleCreateCarousel = async (payload) => {
    try {
      const res = await customFetch('/api/carousels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast?.('Carrossel criado com sucesso!');
        loadCarousels();
        loadStats();
      }
    } catch (e) {
      showToast?.('Erro ao criar carrossel.');
    }
  };

  const handleStartGeneration = async (carouselTextOrObj, carouselId = null, extraOptions = null) => {
    let rawText = '';
    let opts = {};
    let passedSlides = null;

    if (typeof carouselTextOrObj === 'string') {
      rawText = carouselTextOrObj;
      opts = extraOptions || {};
      passedSlides = Array.isArray(opts.slides) ? opts.slides : null;
    } else if (typeof carouselTextOrObj === 'object' && carouselTextOrObj !== null) {
      rawText = carouselTextOrObj.rawText || carouselTextOrObj.content || '';
      opts = { ...carouselTextOrObj, ...(extraOptions || {}) };
      passedSlides = carouselTextOrObj.slides;
    }

    const payload = parseCarouselText(rawText, opts);
    if ((!payload.slides || payload.slides.length === 0) && Array.isArray(passedSlides) && passedSlides.length > 0) {
      payload.slides = passedSlides;
    }

    if (!payload.slides || payload.slides.length === 0) {
      showToast?.('⚠️ Não foi possível extrair os slides deste roteiro.');
      return { ok: false };
    }

    if (carouselId || opts.id) {
      payload.id = carouselId || opts.id;
    }
    if (opts.preset) {
      payload.preset = opts.preset;
    }
    if (opts.format) {
      payload.format = opts.format;
    }

    try {
      showToast?.('🎨 Enviando carrossel de Bella Dalcin para a esteira de geração...');
      const res = await customFetch('/api/criador/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        showToast?.('✦ Carrossel enviado para a esteira de criação!');
        // Mostra o card imediatamente; a leitura seguinte completa os dados.
        setAllCarousels(prev => {
          if (prev.some(item => item.id === result.id)) return prev;
          return [{
            id: result.id,
            title: payload.title || 'Novo carrossel',
            theme: payload.theme || '',
            status: result.status || 'queued',
            totalSlides: payload.slides.length,
            slides: [],
            createdAt: new Date().toISOString(),
            format: payload.format,
            preset: payload.preset
          }, ...prev];
        });
        if (typeof setActiveTab === 'function') {
          setActiveTab('carrosseis');
        }
        await loadCarousels();
        loadStats();
        return { ok: true, id: result.id };
      } else {
        const err = await res.json().catch(() => ({}));
        showToast?.(`Erro na geração: ${err.error || 'Falha ao enfileirar'}`);
        return { ok: false, error: err.error };
      }
    } catch (e) {
      showToast?.(`Erro ao iniciar pipeline de geração: ${e.message || 'falha de conexão'}`);
      return { ok: false, error: e.message };
    }
  };

  const handleStartMockGeneration = async (carouselText, carouselId = null, extraOptions = null) => {
    const payload = parseCarouselText(carouselText, extraOptions);
    if (payload.slides.length === 0) {
      alert('Não consegui extrair slides do carrossel!');
      return;
    }

    if (carouselId) {
      payload.id = carouselId;
    }
    if (extraOptions?.preset) {
      payload.preset = extraOptions.preset;
    }
    if (extraOptions?.format) {
      payload.format = extraOptions.format;
    }

    try {
      const res = await customFetch('/api/escala/criar-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast?.('⚡ Pipeline de geração rápida (mock) concluído!');
        setActiveTab?.('carrosseis');
      } else {
        const err = await res.json();
        showToast?.(`Erro ao criar design rápido: ${err.error || err.detail}`);
      }
    } catch (e) {
      showToast?.('Erro ao iniciar pipeline rápido.');
    }
  };

  return {
    allCarousels,
    setAllCarousels,
    stats,
    setStats,
    filterStatus,
    setFilterStatus,
    imageVersion,
    setImageVersion,
    loadCarousels,
    loadStats,
    handleCreateCarousel,
    handleStartGeneration,
    handleStartMockGeneration
  };
}
