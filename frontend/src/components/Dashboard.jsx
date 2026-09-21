import React, { useState, useEffect } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import PipelineModal from './PipelineModal';
import { customFetch } from '../utils/customFetch';
import DashboardStats from './Dashboard/DashboardStats';
import DashboardFilters from './Dashboard/DashboardFilters';
import CarouselCard from './Dashboard/CarouselCard';
import DashboardPagination from './Dashboard/DashboardPagination';
import DashboardModals from './Dashboard/DashboardModals';

export default function Dashboard({
  allCarousels,
  stats,
  filterStatus,
  setFilterStatus,
  onOpenLightbox,
  onOpenEditModal,
  onLoadCarousels,
  onLoadStats,
  showToast,
  onOpenHistoryModal,
  onLoadChatHistory,
  imageVersion
}) {
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [retryTargetId, setRetryTargetId] = useState(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedDetailsCarousel, setSelectedDetailsCarousel] = useState(null);
  const [selectedPipelineCarousel, setSelectedPipelineCarousel] = useState(null);
  const [isCaptionMaximized, setIsCaptionMaximized] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const [editedCaption, setEditedCaption] = useState('');
  const [isSavingCaption, setIsSavingCaption] = useState(false);

  const [copiedError, setCopiedError] = useState(false);
  const [confirmPublishCarousel, setConfirmPublishCarousel] = useState(null);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [publishResultModal, setPublishResultModal] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [schedulingId, setSchedulingId] = useState(null);

  // Trava scroll do body quando qualquer modal estiver aberto
  const anyModalOpen = !!selectedDetailsCarousel || !!selectedPipelineCarousel || isBulkDeleteModalOpen || !!deleteTargetId || !!retryTargetId || isCaptionMaximized || !!confirmPublishCarousel || !!publishResultModal;
  useScrollLock(anyModalOpen);

  // Reseta seleção ao mudar o filtro
  useEffect(() => {
    setSelectedIds([]);
  }, [filterStatus]);

  const handleOpenCaptionModal = (carousel) => {
    setSelectedDetailsCarousel(carousel);
    setEditedCaption(carousel.caption_full || carousel.caption || '');
    setIsCaptionMaximized(true);
  };

  const handleSaveCaption = async () => {
    if (!selectedDetailsCarousel) return;
    setIsSavingCaption(true);
    try {
      const res = await customFetch(`/api/carousels/${selectedDetailsCarousel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editedCaption,
          caption_full: editedCaption
        })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        showToast('Legenda atualizada com sucesso!', 'success');
        setSelectedDetailsCarousel(prev => prev ? { ...prev, caption: editedCaption, caption_full: editedCaption } : null);
        if (typeof onLoadCarousels === 'function') onLoadCarousels();
        setIsCaptionMaximized(false);
      } else {
        showToast(data.error || 'Erro ao salvar legenda.', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão ao salvar legenda.', 'error');
    } finally {
      setIsSavingCaption(false);
    }
  };

  const handleRetryGeneration = async (carouselId) => {
    if (retryingId) return;
    setRetryingId(carouselId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/carousels/${carouselId}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Erro ao iniciar retentativa', 'error');
        setRetryingId(null);
        return;
      }
      showToast('🔄 Retentativa iniciada! Acompanhe no chat do carrossel.', 'success');
      setTimeout(() => { onLoadCarousels(); onLoadStats(); setRetryingId(null); }, 3000);
    } catch (e) {
      showToast('Erro de conexão ao tentar recriar', 'error');
      setRetryingId(null);
    }
  };

  const handlePageSizeChange = (val) => {
    setPageSize(Number(val));
    setCurrentPage(1);
  };

  const handleTogglePin = async (carouselId, currentPinState) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('fo_token');
      const res = await fetch(`/api/carousels/${carouselId}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ isPinned: !currentPinState })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(!currentPinState ? '📌 Carrossel fixado no topo!' : 'Carrossel desfixado do topo.');
        if (onLoadCarousels) onLoadCarousels();
      } else {
        showToast(data.error || 'Erro ao alternar fixação do carrossel.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão ao fixar carrossel.', 'error');
    }
  };

  // Filter & Pagination
  const filtered = allCarousels.filter(c => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'rascunho') {
      return c.status === 'rascunho' || c.status === 'generating';
    }
    return c.status === filterStatus;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
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

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize));
  const pageStartIndex = (currentPage - 1) * pageSize;
  const paginated = sortedFiltered.slice(pageStartIndex, pageStartIndex + pageSize);

  const toggleExpand = (id) => {
    setExpandedCards(prev => (prev[id] ? {} : { [id]: true }));
  };

  const handleSelectCard = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filtered.map(c => c.id);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleStatusChange = async (carouselId, status) => {
    try {
      const res = await customFetch(`/api/carousels/${carouselId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Status atualizado para: ${status.toUpperCase()}`);
        onLoadCarousels();
      }
    } catch (e) {
      showToast('Erro ao atualizar status.');
    }
  };

  const handlePublish = (carousel) => {
    setIsScheduleMode(false);
    const defaultDate = new Date(Date.now() + 3600 * 1000);
    const tzOffset = defaultDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(defaultDate.getTime() - tzOffset).toISOString().slice(0, 16);
    setScheduledDateTime(localISOTime);
    setConfirmPublishCarousel(carousel);
  };

  const executePublish = async () => {
    if (!confirmPublishCarousel) return;
    const carouselId = confirmPublishCarousel.id;
    const carouselTitle = confirmPublishCarousel.title;

    let unixTimestamp = null;
    if (isScheduleMode) {
      if (!scheduledDateTime) {
        showToast('Selecione a data e hora do agendamento.', 'error');
        return;
      }
      const targetMs = new Date(scheduledDateTime).getTime();
      const nowMs = Date.now();
      const minMs = nowMs + 15 * 60 * 1000;
      const maxMs = nowMs + 75 * 24 * 3600 * 1000;

      if (targetMs < minMs) {
        showToast('A Meta exige que o agendamento seja com no mínimo 15 minutos de antecedência.', 'error');
        return;
      }
      if (targetMs > maxMs) {
        showToast('O agendamento não pode exceder 75 dias no futuro.', 'error');
        return;
      }
      unixTimestamp = Math.floor(targetMs / 1000);
    }

    setConfirmPublishCarousel(null);
    setPublishingId(carouselId);
    if (isScheduleMode) setSchedulingId(carouselId);
    showToast(isScheduleMode ? '⏳ Agendando postagem no Instagram...' : '⏳ Iniciando publicação no Instagram...', 'info');

    try {
      if (!isScheduleMode) {
        await customFetch(`/api/carousels/${carouselId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'publicando' })
        }).catch(() => {});
        onLoadCarousels();
      }

      const res = await customFetch(`/api/carousels/${carouselId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(unixTimestamp ? { scheduled_publish_time: unixTimestamp } : {})
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(isScheduleMode ? '✓ Carrossel agendado com sucesso no Instagram!' : '✓ Publicado com sucesso no Instagram!', 'success');
        setPublishResultModal({
          success: true,
          isScheduled: isScheduleMode,
          scheduledDate: scheduledDateTime,
          carouselId,
          title: carouselTitle,
          log: data.log || '',
          postId: data.carousel?.instagramMediaId || ''
        });
        if (!isScheduleMode) {
          await customFetch(`/api/carousels/${carouselId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'publicado' })
          }).catch(() => {});
        }
        await onLoadCarousels();
      } else {
        const errorMsg = data.error || data.detail || (typeof data === 'string' ? data : 'Erro desconhecido ao tentar conectar ao Instagram.');
        showToast(isScheduleMode ? `Erro ao agendar no Instagram.` : `Erro ao publicar no Instagram.`, 'error');
        setPublishResultModal({
          success: false,
          carouselId,
          title: carouselTitle,
          error: errorMsg,
          log: data.log || ''
        });
        onLoadCarousels();
      }
    } catch (e) {
      showToast('Erro ao conectar com o servidor.', 'error');
      setPublishResultModal({
        success: false,
        carouselId,
        title: carouselTitle,
        error: e.message || 'Erro de conexão com o servidor. Verifique a internet e tente novamente.'
      });
    } finally {
      setPublishingId(null);
      setSchedulingId(null);
    }
  };

  const handleDownloadZip = async (carouselId) => {
    showToast('Preparando download do ZIP...');
    try {
      const res = await fetch(`/api/carousels/${carouselId}/download-zip`);
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `carrossel-${carouselId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('✓ ZIP baixado com sucesso!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('Erro ao baixar ZIP: ' + (err.error || 'sem slides'));
      }
    } catch (e) {
      showToast('Erro de conexão ao baixar ZIP.');
    }
  };

  const confirmDeleteIndividual = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/carousels/${deleteTargetId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Carrossel excluído com sucesso.');
        setSelectedIds(prev => prev.filter(x => x !== deleteTargetId));
        setDeleteTargetId(null);
        onLoadCarousels();
        if (onLoadStats) onLoadStats();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || err.detail || 'Erro ao excluir carrossel.');
      }
    } catch (e) {
      showToast('Erro de conexão ao excluir carrossel.');
    }
  };

  const confirmDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/carousels/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        showToast(`${selectedIds.length} carrosséis excluídos.`);
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
        onLoadCarousels();
        if (onLoadStats) onLoadStats();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || err.detail || 'Erro ao excluir carrosséis.');
      }
    } catch (e) {
      showToast('Erro de conexão ao excluir carrosséis.');
    }
  };

  const allFilteredIds = filtered.map(c => c.id);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      <DashboardStats stats={stats} />

      <div className="section" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'flex-start' }}>
          <DashboardFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            setCurrentPage={setCurrentPage}
            filteredCount={filtered.length}
            isAllSelected={isAllSelected}
            selectedCount={selectedIds.length}
            onSelectAll={handleSelectAll}
            onOpenBulkDeleteModal={() => setIsBulkDeleteModalOpen(true)}
          />

          <div className="carousel-grid">
            {paginated.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">⏳</div>
                <div className="empty-text">Nenhum carrossel encontrado.</div>
              </div>
            ) : (
              paginated.map(c => (
                <CarouselCard
                  key={c.id}
                  carousel={c}
                  isExpanded={expandedCards[c.id]}
                  isSelected={selectedIds.includes(c.id)}
                  imageVersion={imageVersion}
                  retryingId={retryingId}
                  publishingId={publishingId}
                  schedulingId={schedulingId}
                  onToggleExpand={toggleExpand}
                  onSelectCard={handleSelectCard}
                  onTogglePin={handleTogglePin}
                  onOpenLightbox={onOpenLightbox}
                  onOpenEditModal={onOpenEditModal}
                  onOpenCaptionModal={handleOpenCaptionModal}
                  onStatusChange={handleStatusChange}
                  onLoadChatHistory={onLoadChatHistory}
                  onRetryGeneration={setRetryTargetId}
                  onOpenPipeline={setSelectedPipelineCarousel}
                  onOpenDetails={setSelectedDetailsCarousel}
                  onPublish={handlePublish}
                  onDownloadZip={handleDownloadZip}
                  onDeleteTarget={setDeleteTargetId}
                />
              ))
            )}
          </div>
        </div>

        <DashboardPagination
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
        />
      </div>

      <DashboardModals
        deleteTargetId={deleteTargetId}
        setDeleteTargetId={setDeleteTargetId}
        confirmDeleteIndividual={confirmDeleteIndividual}
        isBulkDeleteModalOpen={isBulkDeleteModalOpen}
        setIsBulkDeleteModalOpen={setIsBulkDeleteModalOpen}
        selectedCount={selectedIds.length}
        confirmDeleteBulk={confirmDeleteBulk}
        retryTargetId={retryTargetId}
        setRetryTargetId={setRetryTargetId}
        confirmRetry={handleRetryGeneration}
        selectedDetailsCarousel={selectedDetailsCarousel}
        setSelectedDetailsCarousel={setSelectedDetailsCarousel}
        handleOpenCaptionModal={handleOpenCaptionModal}
        isCaptionMaximized={isCaptionMaximized}
        setIsCaptionMaximized={setIsCaptionMaximized}
        editedCaption={editedCaption}
        setEditedCaption={setEditedCaption}
        handleSaveCaption={handleSaveCaption}
        isSavingCaption={isSavingCaption}
        confirmPublishCarousel={confirmPublishCarousel}
        setConfirmPublishCarousel={setConfirmPublishCarousel}
        isScheduleMode={isScheduleMode}
        setIsScheduleMode={setIsScheduleMode}
        scheduledDateTime={scheduledDateTime}
        setScheduledDateTime={setScheduledDateTime}
        executePublish={executePublish}
        publishResultModal={publishResultModal}
        setPublishResultModal={setPublishResultModal}
        copiedError={copiedError}
        setCopiedError={setCopiedError}
        showToast={showToast}
      />

      {/* Pipeline Modal */}
      {selectedPipelineCarousel && (
        <PipelineModal
          carousel={selectedPipelineCarousel}
          onClose={() => setSelectedPipelineCarousel(null)}
        />
      )}
    </div>
  );
}
