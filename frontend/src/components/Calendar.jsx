import React, { useState, useEffect } from 'react';

export default function Calendar({ allCarousels, onLoadCarousels, showToast, imageVersion }) {
  const [currentCalDate, setCurrentCalDate] = useState(new Date());
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedCarouselId, setSelectedCarouselId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [saving, setSaving] = useState(false);

  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const openScheduleModal = (carouselId = null, dateStr = null) => {
    const pendingsList = allCarousels.filter(c => c.status === 'agendado');
    const targetId = carouselId || (pendingsList.length > 0 ? pendingsList[0].id : '');
    setSelectedCarouselId(targetId);

    if (targetId) {
      const c = allCarousels.find(x => x.id === targetId);
      if (c) {
        populateModalDateTime(c, dateStr);
      }
    } else {
      setScheduleDate(dateStr || new Date().toISOString().split('T')[0]);
      setScheduleTime('09:00');
    }
    setScheduleModalOpen(true);
  };

  const populateModalDateTime = (c, defaultDateStr = null) => {
    if (c.scheduledTimestamp) {
      const d = new Date(c.scheduledTimestamp * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      setScheduleDate(`${yyyy}-${mm}-${dd}`);
      setScheduleTime(`${hh}:${min}`);
    } else if (c.scheduledAt) {
      const d = new Date(c.scheduledAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      setScheduleDate(`${yyyy}-${mm}-${dd}`);
      setScheduleTime(`${hh}:${min}`);
    } else {
      setScheduleDate(c.scheduledDate || defaultDateStr || new Date().toISOString().split('T')[0]);
      setScheduleTime((c.scheduledTime || '09h00').replace('h', ':'));
    }
  };

  const handleSelectCarouselInModal = (carouselId) => {
    setSelectedCarouselId(carouselId);
    const c = allCarousels.find(x => x.id === carouselId);
    if (c) {
      populateModalDateTime(c);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedCarouselId || !scheduleDate || !scheduleTime) {
      alert("Preencha todos os campos!");
      return;
    }
    setSaving(true);
    const timeFormatted = scheduleTime.replace(':', 'h');
    
    // Calcula o novo Timestamp Unix e ISO string baseado nos inputs do usuário
    const targetDateObj = new Date(`${scheduleDate}T${scheduleTime}:00`);
    const newTimestamp = !isNaN(targetDateObj.getTime()) ? Math.floor(targetDateObj.getTime() / 1000) : null;
    const newIsoDate = !isNaN(targetDateObj.getTime()) ? targetDateObj.toISOString() : null;

    try {
      const res = await fetch(`/api/carousels/${selectedCarouselId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scheduledDate: scheduleDate, 
          scheduledTime: timeFormatted,
          scheduledTimestamp: newTimestamp,
          scheduledAt: newIsoDate,
          status: 'agendado' 
        })
      });
      if (res.ok) {
        showToast('Agendamento atualizado com sucesso!');
        setScheduleModalOpen(false);
        onLoadCarousels();
      }
    } catch (e) {
      alert('Erro ao agendar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers para extrair data/hora local de cada sistema de agendamento ──────

  /** Retorna a data local "YYYY-MM-DD" de um carrossel, independente do método de agendamento */
  const getScheduledLocalDate = (c) => {
    // Sistema novo: agendamento via botão "Agendar no Instagram" (usa scheduledTimestamp ou scheduledAt)
    if (c.scheduledTimestamp) {
      const d = new Date(c.scheduledTimestamp * 1000);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (c.scheduledAt) {
      const d = new Date(c.scheduledAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    // Sistema legado: agendamento via modal do calendário (usa scheduledDate)
    return c.scheduledDate || null;
  };

  /** Retorna o horário formatado "HH:MM" para exibição no calendário */
  const getScheduledLocalTime = (c) => {
    if (c.scheduledTimestamp) {
      const d = new Date(c.scheduledTimestamp * 1000);
      return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
    }
    if (c.scheduledAt) {
      const d = new Date(c.scheduledAt);
      return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return (c.scheduledTime || '00h00');
  };

  // Days slots — usa grid-column-start no primeiro dia para evitar células vazias
  const days = [];
  const startCol = firstDay.getDay(); // 0=Dom ... 6=Sáb

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const scheduled = allCarousels.filter(c => c.status !== 'publicado' && getScheduledLocalDate(c) === dayStr);
    const isToday = new Date().toISOString().split('T')[0] === dayStr;

    days.push(
      <div
        className={`cal-day ${isToday ? 'today' : ''}`}
        key={i}
        style={i === 1 && startCol > 0 ? { gridColumnStart: startCol + 1 } : undefined}
      >
        <div className="cal-day-num">{i}</div>
        <div className="cal-events">
          {scheduled.map(c => (
            <div className="cal-event" key={c.id} onClick={() => openScheduleModal(c.id)}>
              <span className="cal-event-time">{getScheduledLocalTime(c)}</span>
              <span className="cal-event-title" title={c.title}>{c.title}</span>
            </div>
          ))}
        </div>
        <button className="cal-add-btn" onClick={() => openScheduleModal(null, dayStr)}>+ agendar</button>
      </div>
    );
  }

  const pendings = allCarousels.filter(c => c.status === 'agendado');

  return (
    <div>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">CALENDÁRIO DE PUBLICAÇÃO</div>
          <div className="oraculo-subtitle">Organize os carrosséis agendados nos horários de publicação (09h, 13h, 20h)</div>
        </div>
      </div>

      <div className="section">
        <div className="cal-wrap">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => setCurrentCalDate(new Date(year, month - 1, 1))}>‹ Anterior</button>
            <div className="cal-month">{`${monthNames[month]} ${year}`}</div>
            <button className="cal-nav-btn" onClick={() => setCurrentCalDate(new Date(year, month + 1, 1))}>Próximo ›</button>
          </div>
          <div className="cal-weekdays">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(w => <div className="cal-weekday" key={w}>{w}</div>)}
          </div>
          <div className="cal-grid">
            {days}
          </div>
        </div>
      </div>

      {scheduleModalOpen && (
        <div className="form-modal open">
          <div className="form-box" style={{ maxWidth: '550px' }}>
            <div className="form-title">Editar Agendamento do Carrossel</div>
            <div className="form-group">
              <label className="form-label">Carrosséis Agendados (Clique para selecionar e alterar o horário)</label>
              <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendings.length === 0 ? (
                  <div style={{ color: 'var(--text-3)', fontSize: '12px' }}>Nenhum carrossel agendado no momento</div>
                ) : (
                  pendings.map(c => (
                    <div
                      key={c.id}
                      className="sch-item"
                      onClick={() => handleSelectCarouselInModal(c.id)}
                      style={{
                        display: 'flex', gap: '10px', padding: '8px',
                        border: '1px solid',
                        borderColor: selectedCarouselId === c.id ? 'var(--gold)' : 'var(--border)',
                        background: selectedCarouselId === c.id ? 'rgba(201,168,76,0.1)' : 'var(--surface2)',
                        borderRadius: '6px', cursor: 'pointer', alignItems: 'center'
                      }}
                    >
                      {c.slides && c.slides.length > 0 ? (
                        <img src={`/api/carousels/${c.id}/image/${c.slides[0]}?v=${imageVersion}`} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>Sem Img</div>
                      )}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text)', lineHeight: 1.2, marginBottom: '4px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{c.status.toUpperCase()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Data</label>
                <input type="date" className="form-input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Horário</label>
                <input type="time" className="form-input" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-outline" onClick={() => setScheduleModalOpen(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={handleSaveSchedule} disabled={saving}>
                {saving ? 'Agendando...' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
