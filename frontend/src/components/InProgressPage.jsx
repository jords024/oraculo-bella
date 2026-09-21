import React from 'react';

export default function InProgressPage({ activeTab, currentUser }) {
  const pagePct = currentUser?.permissions?.[`${activeTab}_pct`] !== undefined 
    ? Number(currentUser.permissions[`${activeTab}_pct`]) 
    : 90;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)',
      padding: '40px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '60px 40px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        {/* Glowing Icon Container */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,163,89,0.2) 0%, rgba(212,163,89,0) 70%)',
          border: '1px solid rgba(212, 163, 89, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
          boxShadow: '0 0 20px rgba(212, 163, 89, 0.15)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px var(--gold))' }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '16px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #ffffff 0%, var(--text-2) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Página em Progresso
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '14px',
          color: 'var(--text-3)',
          lineHeight: '1.6',
          marginBottom: '32px',
          maxWidth: '400px'
        }}>
          Esta funcionalidade está sendo preparada com exclusividade para você. Em breve, ela estará totalmente liberada para uso no seu painel!
        </p>

        {/* Progress Indicator */}
        <div style={{ width: '100%', maxWidth: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gold)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em' }}>
            <span>STATUS DO DESENVOLVIMENTO</span>
            <span>{pagePct}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ height: '100%', width: `${pagePct}%`, background: 'linear-gradient(90deg, var(--gold) 0%, #ffc837 100%)', borderRadius: '2px', boxShadow: '0 0 8px var(--gold)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
