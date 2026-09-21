import React, { useState } from 'react';

// Remove 'px' para exibir só o número no input
const pxToNum = (val, fallback = '') => String(val || '').replace('px', '').replace('pt', '').trim() || fallback;

export default function BrandingTab({
  brandingData,
  setBrandingData
}) {
  const [activeCategory, setActiveCategory] = useState('logo'); // 'logo', 'textos', 'preview', 'todos'

  return (
    <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Navegação por Sub-abas de Identidade Visual */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'logo' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('logo')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          🏷️ Logomarca & Cabeçalho
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'textos' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('textos')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          ✍️ Textos do Carrossel
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'preview' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('preview')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          👁️ Painel de Demonstração
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'todos' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('todos')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          📋 Ver Todas
        </button>
      </div>

      {(activeCategory === 'logo' || activeCategory === 'todos') && (
        <div className="key-group">
          <div className="key-group-title">Logomarca & Cabeçalho</div>

          <div className="key-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
            <div className="key-label" style={{ marginBottom: '4px' }}>Nome da Empresa (Título da Aba & Sidebar)</div>
            <input
              className="key-input"
              type="text"
              value={brandingData.companyName || ''}
              onChange={(e) => setBrandingData(prev => ({ ...prev, companyName: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px' }}
              placeholder="Ex: FONTE OCULTA"
            />
          </div>
          
          <div className="key-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
            <div className="key-label" style={{ marginBottom: '4px' }}>Texto da Logomarca</div>
            <input
              className="key-input"
              type="text"
              value={brandingData.logoText}
              onChange={(e) => setBrandingData(prev => ({ ...prev, logoText: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px' }}
              placeholder="Ex: FONTE OCULTA"
            />
          </div>

          <div className="key-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
            <div className="key-label" style={{ marginBottom: '4px' }}>Subtítulo da Logomarca</div>
            <input
              className="key-input"
              type="text"
              value={brandingData.logoSub}
              onChange={(e) => setBrandingData(prev => ({ ...prev, logoSub: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px' }}
              placeholder="Ex: Produção"
            />
          </div>

          <div className="key-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="key-label">Tamanho da Fonte (Logo)</div>
              <input
                className="key-input"
                type="number"
                min="1"
                max="200"
                value={pxToNum(brandingData.logoSize, '13')}
                onChange={(e) => setBrandingData(prev => ({ ...prev, logoSize: e.target.value ? `${e.target.value}px` : '' }))}
                placeholder="13"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="key-label">Cor do Texto (Logo)</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={brandingData.logoColor && brandingData.logoColor.startsWith('#') ? brandingData.logoColor : '#ffffff'}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, logoColor: e.target.value }))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
                <input
                  className="key-input"
                  type="text"
                  value={brandingData.logoColor}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, logoColor: e.target.value }))}
                  style={{ flex: 1 }}
                  placeholder="Ex: #ffffff"
                />
              </div>
            </div>
          </div>

          <div className="key-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', marginTop: '8px' }}>
            <div className="key-label" style={{ marginBottom: '4px' }}>Posição da Logomarca (Nos Slides)</div>
            <select
              className="key-input"
              value={brandingData.logoPosition || 'left'}
              onChange={(e) => setBrandingData(prev => ({ ...prev, logoPosition: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="left" style={{ background: '#1c1c1e', color: '#ffffff' }}>Esquerda Superior</option>
              <option value="right" style={{ background: '#1c1c1e', color: '#ffffff' }}>Direita Superior</option>
            </select>
          </div>
        </div>
      )}

      {(activeCategory === 'textos' || activeCategory === 'todos') && (
        <div className="key-group">
          <div className="key-group-title">Textos do Carrossel (Slides & Visualização)</div>

          {/* Linha 1: Tamanhos */}
          <div className="key-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="key-label">Tamanho do Título (Slides)</div>
              <input
                className="key-input"
                type="number"
                min="1"
                max="200"
                value={pxToNum(brandingData.titleTextSize, '40')}
                onChange={(e) => setBrandingData(prev => ({ ...prev, titleTextSize: e.target.value ? `${e.target.value}px` : '' }))}
                placeholder="40"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="key-label">Tamanho do Corpo (Slides)</div>
              <input
                className="key-input"
                type="number"
                min="1"
                max="200"
                value={pxToNum(brandingData.bodyTextSize, '24')}
                onChange={(e) => setBrandingData(prev => ({ ...prev, bodyTextSize: e.target.value ? `${e.target.value}px` : '' }))}
                placeholder="24"
              />
            </div>
          </div>

          {/* Linha 2: Cores */}
          <div className="key-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="key-label">Cor do Título</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={(brandingData.titleTextColor || '#ffffff').startsWith('#') ? (brandingData.titleTextColor || '#ffffff') : '#ffffff'}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, titleTextColor: e.target.value }))}
                  style={{ background: 'transparent', border: 'none', width: '40px', height: '40px', cursor: 'pointer', padding: 0 }}
                />
                <input
                  className="key-input"
                  type="text"
                  value={brandingData.titleTextColor || '#ffffff'}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, titleTextColor: e.target.value }))}
                  style={{ flex: 1 }}
                  placeholder="Ex: #ffffff"
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="key-label">Cor do Corpo</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={(brandingData.bodyTextColor || brandingData.carouselTextColor || '#e4e4e7').startsWith('#') ? (brandingData.bodyTextColor || brandingData.carouselTextColor || '#e4e4e7') : '#e4e4e7'}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, bodyTextColor: e.target.value }))}
                  style={{ background: 'transparent', border: 'none', width: '40px', height: '40px', cursor: 'pointer', padding: 0 }}
                />
                <input
                  className="key-input"
                  type="text"
                  value={brandingData.bodyTextColor || brandingData.carouselTextColor || '#e4e4e7'}
                  onChange={(e) => setBrandingData(prev => ({ ...prev, bodyTextColor: e.target.value }))}
                  style={{ flex: 1 }}
                  placeholder="Ex: #e4e4e7"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeCategory === 'preview' || activeCategory === 'todos') && (
        <div className="key-group">
          <div className="key-group-title">Painel de Demonstração (Fundo Preto)</div>
          <div className="settings-group-sub">Visualize em tempo real como o título e o corpo ficarão nos slides gerados</div>
          <div style={{
            background: '#000000',
            padding: '32px 24px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            gap: '0px',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}>
            {/* Logo (canto superior esquerdo ou direito) */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: (brandingData.logoPosition || 'left') === 'left' ? '16px' : 'auto',
              right: (brandingData.logoPosition || 'left') === 'right' ? '16px' : 'auto',
              fontSize: brandingData.logoSize ? (brandingData.logoSize.trim().match(/^\d+$/) ? `${brandingData.logoSize.trim()}px` : brandingData.logoSize) : '13px',
              color: brandingData.logoColor || '#ffffff',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              {brandingData.logoText || '@FONTEOCULTA'}
            </div>
            {/* Numeração (canto oposto à logo) */}
            <div style={{
              position: 'absolute',
              top: '14px',
              right: (brandingData.logoPosition || 'left') === 'left' ? '16px' : 'auto',
              left: (brandingData.logoPosition || 'left') === 'right' ? '16px' : 'auto',
              fontSize: brandingData.logoSize ? (brandingData.logoSize.trim().match(/^\d+$/) ? `${brandingData.logoSize.trim()}px` : brandingData.logoSize) : '13px',
              color: brandingData.logoColor || '#ffffff',
              fontWeight: 'bold',
            }}>
              1/10
            </div>
            {/* Título */}
            <div style={{
              fontSize: brandingData.titleTextSize ? (brandingData.titleTextSize.trim().match(/^\d+$/) ? `${brandingData.titleTextSize.trim()}px` : brandingData.titleTextSize) : '40px',
              color: brandingData.titleTextColor || '#ffffff',
              fontWeight: 'bold',
              textAlign: 'center',
              maxWidth: '85%',
              lineHeight: '1.3',
              marginBottom: '14px',
            }}>
              Título do Slide de Exemplo
            </div>
            {/* Corpo */}
            <div style={{
              fontSize: brandingData.bodyTextSize ? (brandingData.bodyTextSize.trim().match(/^\d+$/) ? `${brandingData.bodyTextSize.trim()}px` : brandingData.bodyTextSize) : '24px',
              color: brandingData.bodyTextColor || brandingData.carouselTextColor || '#e4e4e7',
              fontWeight: '400',
              textAlign: 'center',
              maxWidth: '80%',
              lineHeight: '1.5',
              wordBreak: 'break-word',
            }}>
              Este é o corpo do slide. Aqui fica o texto principal com a cor e tamanho do corpo configurados.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

