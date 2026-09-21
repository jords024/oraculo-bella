import React from 'react';
import Dashboard from './Dashboard';
import Oraculo from './Oraculo';
import Criador from './Criador';
import ReelsCloner from './ReelsCloner';
import Calendar from './Calendar';
import Biblioteca from './Biblioteca';
import Financeiro from './Financeiro';
import Settings from './Settings';
import VideoFactory from './VideoFactory';
import Radar from './Radar';
import UsersManagement from './UsersManagement';
import BackupManagement from './BackupManagement';
import InProgressPage from './InProgressPage';

export default function AppTabRouter({
  activeTab,
  setActiveTab,
  currentUser,
  allCarousels,
  stats,
  filterStatus,
  setFilterStatus,
  imageVersion,
  handleOpenLightbox,
  setEditCarouselId,
  setEditFilename,
  setEditModalOpen,
  loadCarousels,
  loadBranding,
  showToast,
  setHistoryCarouselId,
  setHistoryModalOpen,
  setCriadorInitialMessages,
  setCriadorReadOnly,
  setNewModalDefaults,
  setNewModalOpen,
  handleStartGeneration,
  handleStartMockGeneration,
  shouldAddFormMessage,
  setShouldAddFormMessage,
  criadorInitialMessages,
  criadorReadOnly
}) {
  if (currentUser?.permissions?.[activeTab] === 'em_breve') {
    return <InProgressPage activeTab={activeTab} currentUser={currentUser} />;
  }

  return (
    <>
      {activeTab === 'carrosseis' && (
        <Dashboard
          allCarousels={allCarousels}
          stats={stats}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          currentUser={currentUser}
          imageVersion={imageVersion}
          onOpenLightbox={handleOpenLightbox}
          onOpenEditModal={(id, filename) => {
            setEditCarouselId(id);
            setEditFilename(filename);
            setEditModalOpen(true);
          }}
          onLoadCarousels={loadCarousels}
          showToast={showToast}
          onOpenHistoryModal={(id) => {
            setHistoryCarouselId(id);
            setHistoryModalOpen(true);
          }}
          onLoadChatHistory={(chatHistory) => {
            setCriadorInitialMessages(chatHistory);
            setCriadorReadOnly(true);
            setActiveTab('criador');
          }}
        />
      )}

      {activeTab === 'calendario' && (
        <Calendar
          allCarousels={allCarousels}
          onLoadCarousels={loadCarousels}
          showToast={showToast}
          imageVersion={imageVersion}
        />
      )}

      {activeTab === 'biblioteca' && (
        <Biblioteca showToast={showToast} />
      )}

      {activeTab === 'financeiro' && (
        <Financeiro showToast={showToast} />
      )}

      {activeTab === 'reels' && (
        <ReelsCloner
          onOpenNewModal={(defaults) => {
            setNewModalDefaults(defaults);
            setNewModalOpen(true);
          }}
          showToast={showToast}
        />
      )}

      {activeTab === 'oraculo' && <Oraculo showToast={showToast} />}
      {activeTab === 'radar' && <Radar showToast={showToast} />}
      {activeTab === 'fabrica' && <VideoFactory />}
      
      {activeTab === 'criador' && (
        <Criador
          onStartGeneration={handleStartGeneration}
          showToast={showToast}
          shouldAddFormMessage={shouldAddFormMessage}
          clearAddFormMessage={() => setShouldAddFormMessage(false)}
          initialMessages={criadorInitialMessages}
          clearInitialMessages={() => setCriadorInitialMessages(null)}
          isReadOnly={criadorReadOnly}
        />
      )}

      {activeTab === 'configuracoes' && (
        <Settings showToast={showToast} onLoadBranding={loadBranding} currentUser={currentUser} />
      )}

      {activeTab === 'users' && <UsersManagement showToast={showToast} />}
      {activeTab === 'backups' && <BackupManagement showToast={showToast} />}
      
      {activeTab === 'escala' && (
        <Criador
          onStartGeneration={handleStartMockGeneration}
          showToast={showToast}
          shouldAddFormMessage={shouldAddFormMessage}
          clearAddFormMessage={() => setShouldAddFormMessage(false)}
          initialMessages={criadorInitialMessages}
          clearInitialMessages={() => setCriadorInitialMessages(null)}
          isReadOnly={criadorReadOnly}
          isMockFlow={true}
        />
      )}
    </>
  );
}
