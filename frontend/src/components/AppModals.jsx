// frontend/src/components/AppModals.jsx — Centralizador de Modais Globais do App
import React from 'react';
import Lightbox from './Lightbox';
import NewCarouselModal from './NewCarouselModal';
import EditSlideModal from './EditSlideModal';
import LiveGenPanel from './LiveGenPanel';
import GenerationHistoryModal from './GenerationHistoryModal';
import LogoutModal from './LogoutModal';

export default function AppModals({
  lightboxOpen,
  setLightboxOpen,
  lightboxCarouselId,
  lightboxSlides,
  lightboxIndex,
  setEditCarouselId,
  setEditFilename,
  setEditModalOpen,
  loadCarousels,
  showToast,
  newModalOpen,
  setNewModalOpen,
  handleCreateCarousel,
  newModalDefaults,
  setShouldAddFormMessage,
  setActiveTab,
  editModalOpen,
  editCarouselId,
  editFilename,
  editSlides,
  setImageVersion,
  handleOpenLightbox,
  liveSession,
  setLiveSession,
  historyModalOpen,
  setHistoryModalOpen,
  historyCarouselId,
  logoutModalOpen,
  setLogoutModalOpen,
  toastShow,
  toastMessage
}) {
  return (
    <>
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => { setLightboxOpen(false); loadCarousels(); }}
        carouselId={lightboxCarouselId}
        slides={lightboxSlides}
        initialIndex={lightboxIndex}
        onOpenEditModal={(id, filename) => {
          setEditCarouselId(id);
          setEditFilename(filename);
          setEditModalOpen(true);
        }}
        showToast={showToast}
      />

      <NewCarouselModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreate={handleCreateCarousel}
        defaults={newModalDefaults}
        onSendToChat={(briefing) => {
          setShouldAddFormMessage(true);
          setActiveTab('criador');
        }}
      />

      <EditSlideModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); loadCarousels(); }}
        onSave={() => { loadCarousels(); setImageVersion(Date.now()); }}
        carouselId={editCarouselId}
        filename={editFilename}
        onChangeFilename={(newFilename) => setEditFilename(newFilename)}
        slides={editSlides}
        showToast={showToast}
        onOpenLightbox={handleOpenLightbox}
      />

      <LiveGenPanel
        liveSession={liveSession}
        setLiveSession={setLiveSession}
        onOpenLightbox={handleOpenLightbox}
      />

      <GenerationHistoryModal
        isOpen={historyModalOpen}
        onClose={() => { setHistoryModalOpen(false); loadCarousels(); }}
        carouselId={historyCarouselId}
      />

      <LogoutModal
        logoutModalOpen={logoutModalOpen}
        setLogoutModalOpen={setLogoutModalOpen}
      />

      <div className={`toast ${toastShow ? 'show' : ''}`} id="toast">
        {toastMessage}
      </div>
    </>
  );
}
