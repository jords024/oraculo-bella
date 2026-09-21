import React from 'react';

export default function FinanceiroFilters({
  searchTerm,
  setSearchTerm,
  selectedProvider,
  setSelectedProvider,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  providers = [],
  totalCount,
  filteredCount
}) {
  return (
    <div className="financeiro-filters-box">
      <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="financeiro-search-input"
          placeholder="🔍 Buscar por título, tema ou ID do carrossel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="financeiro-select"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
        >
          <option value="all">Todos os Provedores</option>
          <option value="gpt-image-2">OpenAI GPT Image 2</option>
          <option value="dall-e-3">OpenAI DALL-E 3</option>
          <option value="fal">Flux Schnell (via Fal)</option>
          <option value="gemini">Google Imagen 3</option>
          <option value="gpt-image-1-mini">GPT Image 1 Mini</option>
          <option value="dall-e-2">OpenAI DALL-E 2</option>
        </select>

        <select
          className="financeiro-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">Todos os Status</option>
          <option value="aprovado">Aprovado</option>
          <option value="pronto">Pronto</option>
          <option value="publicado">Publicado</option>
          <option value="rascunho">Rascunho</option>
          <option value="generating">Gerando</option>
        </select>

        <select
          className="financeiro-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Mais Recentes</option>
          <option value="cost_desc">Maior Custo (R$)</option>
          <option value="cost_asc">Menor Custo (R$)</option>
          <option value="slides_desc">Mais Slides</option>
          <option value="saved_desc">Maior Economia</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
          Exibindo <strong>{filteredCount}</strong> de {totalCount} carrosséis
        </span>
        {(searchTerm || selectedProvider !== 'all' || selectedStatus !== 'all' || sortBy !== 'recent') && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedProvider('all');
              setSelectedStatus('all');
              setSortBy('recent');
            }}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
