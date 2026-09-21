import React, { useState } from 'react';
import ImageCard from './ImageCard';
import AssistantDrawer from './AssistantDrawer';
import BibliotecaTopbar from './BibliotecaTopbar';
import BibliotecaBatchBanner from './BibliotecaBatchBanner';
import DashboardPagination from '../Dashboard/DashboardPagination';
import BibliotecaModals from './BibliotecaModals';
import CancelGenerationModal from './CancelGenerationModal';
import { useBibliotecaData } from './useBibliotecaData';
import { useBibliotecaChat } from './useBibliotecaChat';
import '../../css/biblioteca.css';

export default function Biblioteca({ showToast }) {
  const {
    images,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedSource,
    setSelectedSource,
    selectedModel,
    setSelectedModel,
    availableModels,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    loading,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    selectedReferences,
    setSelectedReferences,
    selectedForBatch,
    setSelectedForBatch,
    loadLibrary,
    handleToggleSelect,
    handleAddReference,
    handleRemoveReference,
    handleToggleBatchSelect,
    handleSelectAllBatch
  } = useBibliotecaData({ showToast });

  const {
    messages,
    generatedImages,
    generating,
    showCancelModal,
    onRequestCancel,
    onConfirmCancel,
    onCloseCancelModal,
    itemToSave,
    setItemToSave,
    savingItem,
    handleSendMessage,
    handleClearChat,
    handleConfirmSaveGenerated
  } = useBibliotecaChat({ showToast, loadLibrary });

  // Assistente Lateral
  const [assistantOpen, setAssistantOpen] = useState(true);

  // Estados dos Modais
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedImageForDetails, setSelectedImageForDetails] = useState(null);
  const [lightboxModalOpen, setLightboxModalOpen] = useState(false);
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState(null);

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('fo_token');
      const res = await fetch(`/api/library/${imageToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        if (showToast) showToast('🗑️ Imagem excluída com sucesso!');
        setSelectedReferences(prev => prev.filter(r => r.id !== imageToDelete.id));
        setSelectedForBatch(prev => prev.filter(id => id !== imageToDelete.id));
        loadLibrary();
        setDeleteModalOpen(false);
        setImageToDelete(null);
      } else {
        if (showToast) showToast('Erro ao excluir imagem.');
      }
    } catch {
      if (showToast) showToast('Erro de conexão ao excluir.');
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedForBatch.length === 0) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('fo_token');
      const res = await fetch('/api/library/delete-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids: selectedForBatch })
      });

      const data = await res.json();
      if (res.ok) {
        if (showToast) showToast(`🗑️ ${data.count || selectedForBatch.length} imagens excluídas com sucesso!`);
        setSelectedReferences(prev => prev.filter(r => !selectedForBatch.includes(r.id)));
        setSelectedForBatch([]);
        setBatchDeleteModalOpen(false);
        loadLibrary();
      } else {
        if (showToast) showToast(`Erro ao excluir imagens: ${data.error || 'Falha no servidor'}`);
      }
    } catch {
      if (showToast) showToast('Erro de conexão ao excluir imagens em lote.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(images.length / pageSize) || 1;
  const displayedImages = images.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="biblioteca-container">
      <div className="biblioteca-main-layout">
        {/* ── Galeria da Esquerda ── */}
        <section className="biblioteca-gallery-area">
          <BibliotecaTopbar
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
              loadLibrary(selectedCategory, val, sortOrder, selectedSource, selectedModel);
            }}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setCurrentPage(1);
              loadLibrary(cat, searchQuery, sortOrder, selectedSource, selectedModel);
            }}
            selectedSource={selectedSource}
            onSourceChange={(src) => {
              setSelectedSource(src);
              setCurrentPage(1);
              loadLibrary(selectedCategory, searchQuery, sortOrder, src, selectedModel);
            }}
            models={availableModels}
            selectedModel={selectedModel}
            onModelChange={(mod) => {
              setSelectedModel(mod);
              setCurrentPage(1);
              loadLibrary(selectedCategory, searchQuery, sortOrder, selectedSource, mod);
            }}
            sortOrder={sortOrder}
            onSortOrderChange={(sort) => {
              setSortOrder(sort);
              setCurrentPage(1);
              loadLibrary(selectedCategory, searchQuery, sort, selectedSource, selectedModel);
            }}
            totalImages={images.length}
            selectedCount={selectedForBatch.length}
            onToggleSelectAll={handleSelectAllBatch}
            onOpenUpload={() => setUploadModalOpen(true)}
          />

          <BibliotecaBatchBanner
            selectedCount={selectedForBatch.length}
            totalCount={images.length}
            onSelectAll={handleSelectAllBatch}
            onClearSelection={() => setSelectedForBatch([])}
            onOpenBatchDelete={() => setBatchDeleteModalOpen(true)}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gold, #c9a84c)' }}>
              Carregando biblioteca...
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-3, #a1a1aa)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '6px' }}>Nenhuma imagem encontrada</h3>
              <p style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto 20px auto' }}>
                Faça upload de fotos, personagens, fundos e referências de estilo para usar em suas criações.
              </p>
              <button className="btn btn-gold" onClick={() => setUploadModalOpen(true)}>
                + Fazer Primeiro Upload
              </button>
            </div>
          ) : (
            <>
              <div className="biblioteca-grid">
                {displayedImages.map(img => (
                  <ImageCard
                    key={img.id}
                    image={img}
                    isReference={selectedReferences.some(r => r.id === img.id)}
                    isBatchSelected={selectedForBatch.includes(img.id)}
                    onToggleReference={(image) => handleToggleSelect(image, () => setAssistantOpen(true))}
                    onToggleBatchSelect={handleToggleBatchSelect}
                    onPreview={(img) => {
                      setSelectedImageForLightbox(img);
                      setLightboxModalOpen(true);
                    }}
                    onEdit={(img) => {
                      setSelectedImageForDetails(img);
                      setDetailsModalOpen(true);
                    }}
                    onDelete={(img) => {
                      setImageToDelete(img);
                      setDeleteModalOpen(true);
                    }}
                    showToast={showToast}
                  />
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <DashboardPagination
                  pageSize={pageSize}
                  onPageSizeChange={(newSize) => {
                    setPageSize(Number(newSize));
                    setCurrentPage(1);
                  }}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                  totalItems={images.length}
                />
              </div>
            </>
          )}
        </section>

        {/* ── Assistente de Criação IA (Lado Direito) ── */}
        <AssistantDrawer
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          selectedReferences={selectedReferences}
          onRemoveReference={handleRemoveReference}
          onAddReference={(image) => handleAddReference(image, () => setAssistantOpen(true))}
          allImages={images}
          messages={messages}
          generatedImages={generatedImages}
          onSendMessage={(prompt) => handleSendMessage(prompt, selectedReferences)}
          onClearChat={handleClearChat}
          generating={generating}
          showCancelModal={showCancelModal}
          onRequestCancel={onRequestCancel}
          onConfirmCancel={onConfirmCancel}
          onCloseCancelModal={onCloseCancelModal}
          onSaveToLibrary={(item) => setItemToSave(item)}
          onPreviewImage={(img) => {
            setSelectedImageForLightbox(img);
            setLightboxModalOpen(true);
          }}
          showToast={showToast}
        />
      </div>

      {!assistantOpen && (
        <button
          className="biblioteca-fab-assistant"
          onClick={() => setAssistantOpen(true)}
          title="Abrir Assistente de Criação IA"
          aria-label="Abrir Assistente de Criação IA"
        >
          <span className="fab-assistant-icon">✨</span>
        </button>
      )}

      <BibliotecaModals
        uploadModalOpen={uploadModalOpen}
        setUploadModalOpen={setUploadModalOpen}
        loadLibrary={loadLibrary}
        categories={categories}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        imageToDelete={imageToDelete}
        setImageToDelete={setImageToDelete}
        handleConfirmDelete={handleConfirmDelete}
        batchDeleteModalOpen={batchDeleteModalOpen}
        setBatchDeleteModalOpen={setBatchDeleteModalOpen}
        selectedForBatch={selectedForBatch}
        handleConfirmBatchDelete={handleConfirmBatchDelete}
        deleting={deleting}
        detailsModalOpen={detailsModalOpen}
        setDetailsModalOpen={setDetailsModalOpen}
        selectedImageForDetails={selectedImageForDetails}
        setSelectedImageForDetails={setSelectedImageForDetails}
        lightboxModalOpen={lightboxModalOpen}
        setLightboxModalOpen={setLightboxModalOpen}
        selectedImageForLightbox={selectedImageForLightbox}
        setSelectedImageForLightbox={setSelectedImageForLightbox}
        itemToSave={itemToSave}
        setItemToSave={setItemToSave}
        handleConfirmSaveGenerated={handleConfirmSaveGenerated}
        savingItem={savingItem}
        showToast={showToast}
      />

      <CancelGenerationModal
        isOpen={showCancelModal}
        onClose={onCloseCancelModal}
        onConfirm={onConfirmCancel}
      />
    </div>
  );
}
