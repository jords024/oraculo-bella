import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FinanceiroStats from './FinanceiroStats';
import FinanceiroBreakdown from './FinanceiroBreakdown';
import FinanceiroFilters from './FinanceiroFilters';
import FinanceiroTable from './FinanceiroTable';
import FinanceiroTransactionsTable from './FinanceiroTransactionsTable';
import DashboardPagination from '../Dashboard/DashboardPagination';
import CarouselDetailsModal from '../Dashboard/modals/CarouselDetailsModal';

export default function Financeiro({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('carousels');
  const [data, setData] = useState({
    summary: null,
    categoriesBreakdown: null,
    transactions: [],
    providers: [],
    byStatus: {},
    topThemes: [],
    carousels: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Paginação para Carrosséis (padrão: 20 por página)
  const [carouselsPage, setCarouselsPage] = useState(1);
  const [carouselsPageSize, setCarouselsPageSize] = useState('20');

  // Paginação para Extrato de Gastos (padrão: 20 por página)
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPageSize, setTransactionsPageSize] = useState('20');

  const [selectedDetailsCarousel, setSelectedDetailsCarousel] = useState(null);

  const loadFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('fo_token');
      const res = await fetch('/api/financial/summary', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Falha ao carregar dados financeiros');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      showToast && showToast('❌ Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // Resetar para a primeira página ao alterar os filtros
  useEffect(() => {
    setCarouselsPage(1);
  }, [searchTerm, selectedProvider, selectedStatus, sortBy]);

  // Filtragem e Ordenação de Carrosséis
  const filteredCarousels = useMemo(() => {
    let list = Array.isArray(data.carousels) ? [...data.carousels] : [];

    // Busca textual
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.theme?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q)
      );
    }

    // Filtro por provedor
    if (selectedProvider !== 'all') {
      list = list.filter((c) => (c.imageProvider || 'gpt-image-2') === selectedProvider);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      list = list.filter((c) => (c.status || '').toLowerCase() === selectedStatus.toLowerCase());
    }

    // Ordenação
    list.sort((a, b) => {
      if (sortBy === 'cost_desc') return (b.costBrl || 0) - (a.costBrl || 0);
      if (sortBy === 'cost_asc') return (a.costBrl || 0) - (b.costBrl || 0);
      if (sortBy === 'slides_desc') return (b.totalSlides || 0) - (a.totalSlides || 0);
      if (sortBy === 'saved_desc') return (b.savedBrl || 0) - (a.savedBrl || 0);
      // Padrão: mais recentes
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return list;
  }, [data.carousels, searchTerm, selectedProvider, selectedStatus, sortBy]);

  // Total de páginas e fatia paginada de Carrosséis
  const totalCarouselsPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCarousels.length / Number(carouselsPageSize)));
  }, [filteredCarousels.length, carouselsPageSize]);

  const paginatedCarousels = useMemo(() => {
    const size = Number(carouselsPageSize);
    const start = (carouselsPage - 1) * size;
    return filteredCarousels.slice(start, start + size);
  }, [filteredCarousels, carouselsPage, carouselsPageSize]);

  // Total de páginas e fatia paginada de Transações
  const totalTransactionsPages = useMemo(() => {
    const total = data.transactions?.length || 0;
    return Math.max(1, Math.ceil(total / Number(transactionsPageSize)));
  }, [data.transactions, transactionsPageSize]);

  const paginatedTransactions = useMemo(() => {
    const list = Array.isArray(data.transactions) ? data.transactions : [];
    const size = Number(transactionsPageSize);
    const start = (transactionsPage - 1) * size;
    return list.slice(start, start + size);
  }, [data.transactions, transactionsPage, transactionsPageSize]);

  return (
    <div className="financeiro-wrapper">
      {/* Cabeçalho */}
      <div className="financeiro-header-row">
        <div className="financeiro-title-group">
          <h2>
            <span>💰</span> Gestão Financeira & Custos em Tempo Real
          </h2>
          <p>
            Acompanhe em tempo real os custos acumulados de carrosséis, recriações, imagens avulsas e prompts de IA.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="financeiro-rate-badge">
            <span>💵 Cotação Base:</span>
            <strong>1 USD = R$ {Number(data.summary?.usdRate || 5.00).toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadFinancialData}
            title="Recarregar dados"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px' }}
          >
            🔄 {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais (KPIs) */}
      <FinanceiroStats summary={data.summary} categoriesBreakdown={data.categoriesBreakdown} />

      {/* Gráficos e Distribuição por Provedores */}
      <FinanceiroBreakdown
        providers={data.providers}
        summary={data.summary}
        topThemes={data.topThemes}
      />

      {/* Abas de Visualização */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginTop: '10px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('carousels')}
          style={{
            background: activeTab === 'carousels' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'carousels' ? '#38bdf8' : 'var(--text-3)',
            border: activeTab === 'carousels' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🖼️ Carrosséis ({data.carousels?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          style={{
            background: activeTab === 'transactions' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
            color: activeTab === 'transactions' ? '#22c55e' : 'var(--text-3)',
            border: activeTab === 'transactions' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🧾 Extrato de Gastos em Tempo Real ({data.transactions?.length || 0})
        </button>
      </div>

      {activeTab === 'carousels' ? (
        <>
          {/* Filtros e Busca */}
          <FinanceiroFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            providers={data.providers}
            totalCount={data.carousels?.length || 0}
            filteredCount={filteredCarousels.length}
          />

          {/* Tabela de Carrosséis Paginada */}
          <FinanceiroTable
            carousels={paginatedCarousels}
            onOpenDetails={(carousel) => setSelectedDetailsCarousel(carousel)}
          />

          {/* Barra de Paginação de Carrosséis */}
          <DashboardPagination
            pageSize={carouselsPageSize}
            onPageSizeChange={(newSize) => {
              setCarouselsPageSize(newSize);
              setCarouselsPage(1);
            }}
            currentPage={carouselsPage}
            totalPages={totalCarouselsPages}
            onPageChange={setCarouselsPage}
            totalItems={filteredCarousels.length}
          />
        </>
      ) : (
        <>
          {/* Tabela de Extrato de Gastos em Tempo Real Paginada */}
          <FinanceiroTransactionsTable transactions={paginatedTransactions} />

          {/* Barra de Paginação de Transações */}
          <DashboardPagination
            pageSize={transactionsPageSize}
            onPageSizeChange={(newSize) => {
              setTransactionsPageSize(newSize);
              setTransactionsPage(1);
            }}
            currentPage={transactionsPage}
            totalPages={totalTransactionsPages}
            onPageChange={setTransactionsPage}
            totalItems={data.transactions?.length || 0}
          />
        </>
      )}

      {/* Modal de Detalhes do Carrossel */}
      {selectedDetailsCarousel && (
        <CarouselDetailsModal
          selectedDetailsCarousel={selectedDetailsCarousel}
          setSelectedDetailsCarousel={setSelectedDetailsCarousel}
          handleOpenCaptionModal={() => {}}
        />
      )}
    </div>
  );
}
