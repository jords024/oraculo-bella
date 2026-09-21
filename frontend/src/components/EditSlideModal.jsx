import { useState, useEffect, useRef } from 'react';
import { customFetch } from '../utils/customFetch';
import { useScrollLock } from '../hooks/useScrollLock';
import { PRESET_DEFAULTS, getDefaultPositions } from './EditSlideModal/editSlideConstants';
import EditSlideLoadingOverlay from './EditSlideModal/EditSlideLoadingOverlay';
import EditSlideHeader from './EditSlideModal/EditSlideHeader';
import EditSlideImageTab from './EditSlideModal/EditSlideImageTab';
import EditSlidePreview from './EditSlideModal/EditSlidePreview';
import SlideStudio from './EditSlideModal/SlideStudio';

const getDefaultLogoText = () => {
  try {
    const branding = JSON.parse(localStorage.getItem('fo_branding') || '{}');
    if (branding.logoText) return branding.logoText;
  } catch {
    return '';
  }
  return '';
};

export default function EditSlideModal({
  isOpen,
  onClose,
  onSave,
  carouselId,
  filename,
  onChangeFilename,
  slides = [],
  showToast,
  onOpenLightbox
}) {
  const [activeTab, setActiveTab] = useState('text');
  const [slideMeta, setSlideMeta] = useState({ 
    title: '', 
    body: '', 
    prompt: '', 
    layout: 'fullbleed',
    title_y: '',
    body_y: '',
    watermark_pos: 'top_left',
    watermark_x: '',
    watermark_y: '',
    watermark_text: getDefaultLogoText(),
    title_px: 76,
    body_px: 40,
    preset: 'sagrado',
    reference_ids: [],
    reference_images: []
  });
  const [saving, setSaving] = useState(false);
  const [loadingAction, setLoadingAction] = useState('recompose');
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [previewImgUrl, setPreviewImgUrl] = useState('');
  const [draggingElement, setDraggingElement] = useState(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (isOpen && carouselId && filename) {
      const token = encodeURIComponent(localStorage.getItem('fo_token') || '');
      setPreviewImgUrl(`/api/carousels/${carouselId}/image/${filename}?token=${token}&t=${cacheBuster}`);
    }
  }, [isOpen, carouselId, filename, cacheBuster]);

  useScrollLock(isOpen);

  const handleImageError = () => {
    const token = encodeURIComponent(localStorage.getItem('fo_token') || '');
    setPreviewImgUrl(`/api/carousels/${carouselId}/image/${filename}?token=${token}&t=${cacheBuster}`);
  };

  const currentPreset = slideMeta.preset || 'sagrado';
  const defaultSizes = PRESET_DEFAULTS[currentPreset] || PRESET_DEFAULTS.sagrado;
  const { defaultTitleY, defaultBodyY } = getDefaultPositions(slideMeta.layout);

  const handleDragStart = (e, element) => {
    e.preventDefault();
    if (!previewRef.current) return;
    setDraggingElement(element);
    
    const rect = previewRef.current.getBoundingClientRect();
    const scale = 1080 / 336;
    
    const currentRealY = element === 'title' 
      ? (slideMeta.title_y !== '' && slideMeta.title_y !== undefined && slideMeta.title_y !== null ? Number(slideMeta.title_y) : defaultTitleY)
      : (slideMeta.body_y !== '' && slideMeta.body_y !== undefined && slideMeta.body_y !== null ? Number(slideMeta.body_y) : defaultBodyY);
    const currentPreviewY = currentRealY / scale;

    const clickYInPreview = e.clientY - rect.top;
    const offsetY = clickYInPreview - currentPreviewY;

    const elementHeight = e.currentTarget.offsetHeight || 0;
    const elementRealHeight = Math.round(elementHeight * scale);
    const maxRealY = Math.max(0, 1350 - elementRealHeight);

    const handleMouseMove = (moveEvent) => {
      const relativeY = (moveEvent.clientY - rect.top) - offsetY;
      const relativeX = moveEvent.clientX - rect.left;
      
      const clampedY = Math.max(0, Math.min(420, relativeY));
      const clampedX = Math.max(0, Math.min(336, relativeX));
      
      let realY = Math.round(clampedY * scale);
      const realX = Math.round(clampedX * scale);

      if (element === 'title' || element === 'body') {
        realY = Math.min(maxRealY, realY);
      }

      setSlideMeta(prev => {
        const next = { ...prev };
        if (element === 'title') {
          next.title_y = realY;
        } else if (element === 'body') {
          next.body_y = realY;
        } else if (element === 'watermark') {
          next.watermark_pos = 'custom';
          next.watermark_x = realX;
          next.watermark_y = realY;
        }
        return next;
      });
    };

    const handleMouseUp = () => {
      setDraggingElement(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (isOpen && carouselId && filename) {
      loadSlideMeta();
    }
  }, [isOpen, carouselId, filename]);

  const loadSlideMeta = async () => {
    try {
      const res = await customFetch(`/api/carousels/${carouselId}/slide/${filename}/meta`);
      if (res.ok) {
        const data = await res.json();
        const defaultPrompt = data.prompt || (data.title
          ? `Cinematic dark esoteric illustration, dramatic volumetric light, deep emotional atmosphere. Abstract visual metaphor for: ${data.title}`
          : `Cinematic dark esoteric illustration, dramatic volumetric light, deep emotional atmosphere.`);

        const presetKey = data.preset || 'sagrado';
        const presetSizes = PRESET_DEFAULTS[presetKey] || PRESET_DEFAULTS.sagrado;
        const defaultLogo = getDefaultLogoText();

        setSlideMeta({
          title: data.title || '',
          body: data.body || '',
          prompt: defaultPrompt,
          layout: data.layout || 'fullbleed',
          title_y: data.title_y !== undefined && data.title_y !== null ? data.title_y : '',
          body_y: data.body_y !== undefined && data.body_y !== null ? data.body_y : '',
          watermark_pos: data.watermark_pos || 'top_left',
          watermark_x: data.watermark_x !== undefined && data.watermark_x !== null ? data.watermark_x : '',
          watermark_y: data.watermark_y !== undefined && data.watermark_y !== null ? data.watermark_y : '',
          watermark_text: (data.watermark_text !== undefined && data.watermark_text !== null && String(data.watermark_text).trim() !== '') ? data.watermark_text : defaultLogo,
          title_px: (data.title_px !== undefined && data.title_px !== null && String(data.title_px).trim() !== '') ? data.title_px : presetSizes.title,
          body_px: (data.body_px !== undefined && data.body_px !== null && String(data.body_px).trim() !== '') ? data.body_px : presetSizes.body,
          preset: presetKey,
          reference_ids: data.reference_ids || [],
          reference_images: data.reference_images || []
        });
      }
    } catch (e) {
      showToast('Erro ao carregar metadados do slide.');
    }
  };

  const handleRecompose = async (silent = false, overrides = null) => {
    if (!silent) setLoadingAction('recompose');
    setSaving(true);
    const effectiveTitleY = slideMeta.title_y !== '' && slideMeta.title_y !== undefined && slideMeta.title_y !== null ? Number(slideMeta.title_y) : defaultTitleY;
    const effectiveBodyY = slideMeta.body_y !== '' && slideMeta.body_y !== undefined && slideMeta.body_y !== null ? Number(slideMeta.body_y) : defaultBodyY;

    const payloadToSend = {
      ...slideMeta,
      ...(overrides || {}),
      title_y: effectiveTitleY,
      body_y: effectiveBodyY
    };

    if (overrides) {
      payloadToSend.title_y = overrides.title_y ?? effectiveTitleY;
      payloadToSend.body_y = overrides.body_y ?? effectiveBodyY;
    }

    try {
      const res = await customFetch(`/api/carousels/${carouselId}/slide/${filename}/recompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSend)
      });
      const data = await res.json();
      if (data.ok) {
        setSlideMeta(prev => ({
          ...prev,
          title_y: effectiveTitleY,
          body_y: effectiveBodyY
        }));
        if (!silent) showToast('Slide recomposto com sucesso!', 'success');
        setCacheBuster(Date.now());
        if (typeof onSave === 'function') onSave();
        return true;
      } else {
        alert('Erro ao recompor slide: ' + (data.error || 'desconhecido'));
        return false;
      }
    } catch (e) {
      showToast('Erro ao recompor slide.', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleVisualizar = async () => {
    setLoadingAction('visualizar');
    await handleRecompose(true);
    const currentIndex = slides.findIndex(s => (typeof s === 'string' ? s : s.filename) === filename);
    onClose();
    if (onOpenLightbox) {
      setTimeout(() => {
        onOpenLightbox(carouselId, slides, currentIndex >= 0 ? currentIndex : 0);
      }, 50);
    }
  };

  const handleRegen = async () => {
    setLoadingAction('regen');
    setSaving(true);
    try {
      const res = await customFetch(`/api/carousels/${carouselId}/slide/${filename}/regen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slideMeta)
      });
      const data = await res.json();
      if (data.ok) {
        showToast('Imagem gerada e slide recomposto!', 'success');
        setCacheBuster(Date.now());
        if (typeof onSave === 'function') onSave();
      } else {
        alert('Erro: ' + (data.error || 'desconhecido'));
      }
    } catch (e) {
      showToast('Erro ao gerar nova imagem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentSlideIndex = slides && slides.length > 0
    ? slides.findIndex(s => (typeof s === 'string' ? s : s.filename) === filename)
    : -1;
  const slideDisplayNum = currentSlideIndex >= 0 ? currentSlideIndex + 1 : (filename ? (filename.match(/\d+/) || ['?'])[0] : '?');

  if (activeTab === 'text') {
    return (
      <>
        <EditSlideLoadingOverlay saving={saving} loadingAction={loadingAction} slideDisplayNum={slideDisplayNum} filename={filename} />
        <SlideStudio
          carouselId={carouselId}
          slides={slides}
          initialFilename={filename}
          cacheBuster={cacheBuster}
          showToast={showToast}
          onClose={onClose}
          onSaved={onSave}
          onActivatePage={onChangeFilename}
          onRegenerate={(pageFilename) => {
            if (pageFilename && pageFilename !== filename) onChangeFilename(pageFilename);
            setActiveTab('image');
          }}
        />
      </>
    );
  }

  return (
    <div className="edit-modal open" id="edit-modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.85)', zIndex: 1000, cursor: draggingElement ? 'grabbing' : 'default' }}>
      
      {/* Overlay de Loading Centralizado */}
      <EditSlideLoadingOverlay
        saving={saving}
        loadingAction={loadingAction}
        slideDisplayNum={slideDisplayNum}
        filename={filename}
      />

      <div className="edit-box" style={{ maxWidth: '1100px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)', borderRadius: '12px', overflow: 'hidden' }}>
        <EditSlideHeader
          filename={filename}
          slides={slides}
          onChangeFilename={onChangeFilename}
          onOpenLightbox={onOpenLightbox}
          onClose={onClose}
          handleVisualizar={handleVisualizar}
          saving={saving}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', padding: '24px', overflow: 'hidden', flex: 1 }}>
          
          {/* Coluna Esquerda: Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingRight: '8px' }}>
            <div className="edit-tabs">
              <button 
                type="button"
                className={`edit-tab ${activeTab === 'text' ? 'active' : ''}`} 
                onClick={() => setActiveTab('text')}
              >
                <span>←</span> Voltar ao Estúdio
              </button>
              <button 
                type="button"
                className={`edit-tab ${activeTab === 'image' ? 'active' : ''}`} 
                onClick={() => setActiveTab('image')}
              >
                <span>🎨</span> Recriar Imagem
              </button>
            </div>

            <EditSlideImageTab
              slideMeta={slideMeta}
              setSlideMeta={setSlideMeta}
              saving={saving}
              onClose={onClose}
              handleRegen={handleRegen}
              showToast={showToast}
            />
          </div>

          {/* Coluna Direita: Renderização / Preview com Simulador */}
          <EditSlidePreview
            previewRef={previewRef}
            carouselId={carouselId}
            filename={filename}
            previewImgUrl={previewImgUrl}
            handleImageError={handleImageError}
            activeTab={activeTab}
            slideMeta={slideMeta}
            defaultSizes={defaultSizes}
            handleDragStart={handleDragStart}
            draggingElement={draggingElement}
          />

        </div>
      </div>
    </div>
  );
}
