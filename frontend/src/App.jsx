import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import InitialLoader from './components/InitialLoader';
import AppModals from './components/AppModals';
import AppTabRouter from './components/AppTabRouter';
import { useAppAuth } from './hooks/useAppAuth';
import { useCarouselsData } from './hooks/useCarouselsData';
import { useGlobalSSE } from './hooks/useGlobalSSE';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (document.referrer && (document.referrer.includes('login.html') || document.referrer.includes('login')) && !sessionStorage.getItem('loginHandled')) {
      sessionStorage.setItem('loginHandled', 'true');
      localStorage.setItem('activeTab', 'carrosseis');
      return 'carrosseis';
    }
    return localStorage.getItem('activeTab') || 'carrosseis';
  });

  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2500);
  }, []);

  const {
    currentUser,
    branding,
    logoutModalOpen,
    setLogoutModalOpen,
    loadCurrentUser,
    loadBranding
  } = useAppAuth();

  const {
    allCarousels,
    stats,
    filterStatus,
    setFilterStatus,
    imageVersion,
    setImageVersion,
    loadCarousels,
    loadStats,
    handleCreateCarousel,
    handleStartGeneration,
    handleStartMockGeneration
  } = useCarouselsData({ showToast, setActiveTab });

  const { liveSession, setLiveSession, setupSSE } = useGlobalSSE({ loadCarousels, loadStats });

  // Estados de navegação e fluxos do criador
  const [shouldAddFormMessage, setShouldAddFormMessage] = useState(false);
  const [criadorInitialMessages, setCriadorInitialMessages] = useState(null);
  const [criadorReadOnly, setCriadorReadOnly] = useState(false);

  // Modais
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newModalDefaults, setNewModalDefaults] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCarouselId, setEditCarouselId] = useState('');
  const [editFilename, setEditFilename] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyCarouselId, setHistoryCarouselId] = useState('');

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxCarouselId, setLightboxCarouselId] = useState('');
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleOpenLightbox = (id, slides, idx) => {
    setLightboxCarouselId(id);
    setLightboxSlides(slides);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  useEffect(() => {
    document.title = "Oraculo";
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    if (activeTab === 'carrosseis') {
      loadCarousels();
      loadStats();
    }
    if (activeTab !== 'criador') {
      setCriadorReadOnly(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const initApp = async () => {
      try {
        await Promise.all([
          loadCurrentUser(),
          loadBranding(),
          loadStats()
        ]);

        const loadedCarousels = await loadCarousels();
        setupSSE();

        if (Array.isArray(loadedCarousels) && loadedCarousels.length > 0) {
          const visibleCarousels = loadedCarousels.slice(0, 20);
          const imagePromises = visibleCarousels
            .filter(c => c.cover || (c.slides && c.slides[0]))
            .map(c => new Promise((resolve) => {
              const img = new Image();
              const coverPath = c.cover || (typeof c.slides[0] === 'string' ? c.slides[0] : c.slides[0]?.filename);
              if (!coverPath) return resolve();
              const token = encodeURIComponent(localStorage.getItem('fo_token') || '');
              img.src = coverPath.startsWith('http') || coverPath.startsWith('/')
                ? coverPath 
                : `/api/carousels/${c.id}/image/${coverPath}?token=${token}`;
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }));

          await Promise.race([
            Promise.all(imagePromises),
            new Promise(resolve => setTimeout(resolve, 1500))
          ]);
        }
      } catch (err) {
        console.error("Erro na inicialização do painel:", err);
      } finally {
        setTimeout(() => setInitialLoading(false), 400);
      }
    };

    initApp();
  }, []);

  const activeEditCarousel = allCarousels.find(x => x.id === editCarouselId);
  const editSlides = activeEditCarousel ? activeEditCarousel.slides : [];

  return (
    <div className="app-shell">
      <InitialLoader loading={initialLoading} branding={branding} />
      
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        branding={branding}
        currentUser={currentUser}
        onNewCarousel={() => {
          setShouldAddFormMessage(true);
          setCriadorReadOnly(false);
          setActiveTab('criador');
        }}
      />

      <div className="main-area">
        <AppTabRouter
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          allCarousels={allCarousels}
          stats={stats}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          imageVersion={imageVersion}
          handleOpenLightbox={handleOpenLightbox}
          setEditCarouselId={setEditCarouselId}
          setEditFilename={setEditFilename}
          setEditModalOpen={setEditModalOpen}
          loadCarousels={loadCarousels}
          loadBranding={loadBranding}
          showToast={showToast}
          setHistoryCarouselId={setHistoryCarouselId}
          setHistoryModalOpen={setHistoryModalOpen}
          setCriadorInitialMessages={setCriadorInitialMessages}
          setCriadorReadOnly={setCriadorReadOnly}
          setNewModalDefaults={setNewModalDefaults}
          setNewModalOpen={setNewModalOpen}
          handleStartGeneration={handleStartGeneration}
          handleStartMockGeneration={handleStartMockGeneration}
          shouldAddFormMessage={shouldAddFormMessage}
          setShouldAddFormMessage={setShouldAddFormMessage}
          criadorInitialMessages={criadorInitialMessages}
          criadorReadOnly={criadorReadOnly}
        />
      </div>

      <AppModals
        lightboxOpen={lightboxOpen} setLightboxOpen={setLightboxOpen}
        lightboxCarouselId={lightboxCarouselId} lightboxSlides={lightboxSlides} lightboxIndex={lightboxIndex}
        setEditCarouselId={setEditCarouselId} setEditFilename={setEditFilename} setEditModalOpen={setEditModalOpen}
        loadCarousels={loadCarousels} showToast={showToast}
        newModalOpen={newModalOpen} setNewModalOpen={setNewModalOpen}
        handleCreateCarousel={handleCreateCarousel} newModalDefaults={newModalDefaults}
        setShouldAddFormMessage={setShouldAddFormMessage} setActiveTab={setActiveTab}
        editModalOpen={editModalOpen} editCarouselId={editCarouselId}
        editFilename={editFilename} editSlides={editSlides}
        setImageVersion={setImageVersion} handleOpenLightbox={handleOpenLightbox}
        liveSession={liveSession} setLiveSession={setLiveSession}
        historyModalOpen={historyModalOpen} setHistoryModalOpen={setHistoryModalOpen}
        historyCarouselId={historyCarouselId} logoutModalOpen={logoutModalOpen}
        setLogoutModalOpen={setLogoutModalOpen} toastShow={toastShow} toastMessage={toastMessage}
      />
    </div>
  );
}
