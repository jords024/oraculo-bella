import React, { useState, useEffect } from 'react';
import { customFetch } from '../utils/customFetch';
import ConfirmModal from './LogsViewer/ConfirmModal';
import LogsPasteModal from './LogsViewer/LogsPasteModal';
import LogsFilterBar from './LogsViewer/LogsFilterBar';
import LogsTable from './LogsViewer/LogsTable';

export default function LogsViewer({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [rawLogs, setRawLogs] = useState([]);
  const [totalLines, setTotalLines] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [activeQuickFilters, setActiveQuickFilters] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal para colar manualmente
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [manualLogs, setManualLogs] = useState('');

  // Modal de confirmação customizado
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', description: '', confirmLabel: 'Confirmar', danger: true, onConfirm: null });

  const openConfirm = ({ title, description, confirmLabel = 'Confirmar', danger = true, onConfirm }) => {
    setConfirmModal({ isOpen: true, title, description, confirmLabel, danger, onConfirm });
  };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const loadLogs = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (selectedDate) {
        queryParams.push(`date=${selectedDate}`);
      }
      if (searchText) {
        queryParams.push(`search=${encodeURIComponent(searchText)}`);
      }
      const queryStr = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
      const res = await customFetch(`/api/logs${queryStr}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.logs || [];
        setTotalLines(data.totalLines || 0);
        setAvailableDates(data.availableDates || []);
        setRawLogs(list);
        
        if (data.selectedDate) {
          setSelectedDate(data.selectedDate);
        }
      }
    } catch (e) {
      showToast('Erro ao carregar logs do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  useEffect(() => {
    let list = [...rawLogs];

    // 1. Filtro de Nível
    if (selectedLevel !== 'all') {
      list = list.filter(l => l.level === selectedLevel);
    }

    // 2. Filtros rápidos múltiplos (OR entre as tags selecionadas)
    if (activeQuickFilters.length > 0) {
      list = list.filter(l => l.tag && activeQuickFilters.some(tag => tag.toUpperCase() === l.tag.toUpperCase()));
    }

    // 3. Filtro de horário local (front-end)
    if (timeFrom || timeTo) {
      list = list.filter(l => {
        if (!l.datetime) return false;
        const timePart = l.datetime.split(' ')[1];
        if (!timePart) return false;
        if (timeFrom && timePart < timeFrom) return false;
        if (timeTo && timePart > timeTo) return false;
        return true;
      });
    }

    setLogs(list);
  }, [rawLogs, selectedLevel, activeQuickFilters, timeFrom, timeTo]);

  const handleDeleteLines = (ids) => {
    openConfirm({
      title: 'Excluir linha(s) de log',
      description: `Tem certeza que deseja excluir ${ids.length} linha(s) de log? Esta ação não pode ser desfeita.`,
      confirmLabel: `Excluir ${ids.length} linha(s)`,
      danger: true,
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await customFetch('/api/logs/delete-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
          });
          if (res.ok) {
            showToast('Linhas de log excluídas com sucesso.');
            setSelectedLines(prev => prev.filter(id => !ids.includes(id)));
            loadLogs();
          }
        } catch (err) {
          showToast('Erro ao excluir linhas de log.');
        }
      }
    });
  };

  const handleClearServerLogs = () => {
    openConfirm({
      title: 'Apagar todos os logs',
      description: 'Esta ação irá APAGAR permanentemente todos os logs no servidor. Esta ação não pode ser desfeita.',
      confirmLabel: 'Apagar tudo',
      danger: true,
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await customFetch('/api/logs', { method: 'DELETE' });
          if (res.ok) {
            showToast('Logs limpos com sucesso no servidor.');
            setLogs([]);
            setTotalLines(0);
          }
        } catch (err) {
          showToast('Erro ao limpar logs.');
        }
      }
    });
  };

  const handleCopyLogs = () => {
    const selectedList = logs.filter(l => selectedLines.includes(l.id));
    const listToCopy = selectedList.length > 0 ? selectedList : logs;
    const text = listToCopy.map(l => `${l.datetime} [${l.level}] [${l.tag}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast(`✓ ${listToCopy.length} linhas copiadas para a área de transferência.`);
  };

  const handleDownloadLogs = () => {
    const selectedList = logs.filter(l => selectedLines.includes(l.id));
    const listToDownload = selectedList.length > 0 ? selectedList : logs;
    const text = listToDownload.map(l => `${l.datetime} [${l.level}] [${l.tag}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${selectedDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePasteManually = () => {
    if (!manualLogs.trim()) return;
    const rawLines = manualLogs.split('\n').filter(Boolean);
    const parsed = rawLines.map((line, idx) => {
      const parts = line.split(' - ');
      if (parts.length >= 4) {
        return { id: idx + 1, datetime: parts[0], tag: parts[1], level: parts[2], message: parts.slice(3).join(' - ') };
      }
      return { id: idx + 1, datetime: new Date().toLocaleTimeString(), tag: 'MANUAL', level: 'INFO', message: line };
    });
    setLogs(parsed);
    setTotalLines(parsed.length);
    setIsPasteModalOpen(false);
    showToast('Logs colados manualmente carregados!');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLines(logs.map(l => l.id));
    } else {
      setSelectedLines([]);
    }
  };

  const handleSelectLine = (id) => {
    setSelectedLines(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchText('');
    setTimeFrom('');
    setTimeTo('');
    setSelectedLevel('all');
    setActiveQuickFilters([]);
    loadLogs();
    showToast('Filtros limpos.');
  };

  return (
    <div className="section-logs" style={{ padding: '24px', color: '#e4e4e7' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Visualizador de Logs</h2>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: '#22c55e', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>
            ✓ {logs.length} linhas — pag. 1/1
          </div>
        </div>
      </div>

      {/* Main filters bar */}
      <LogsFilterBar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableDates={availableDates}
        loadLogs={loadLogs}
        totalLines={totalLines}
        setIsPasteModalOpen={setIsPasteModalOpen}
        handleClearFilters={handleClearFilters}
        handleClearServerLogs={handleClearServerLogs}
        activeQuickFilters={activeQuickFilters}
        setActiveQuickFilters={setActiveQuickFilters}
        timeFrom={timeFrom}
        setTimeFrom={setTimeFrom}
        timeTo={timeTo}
        setTimeTo={setTimeTo}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        rawLogs={rawLogs}
      />

      {/* Logs Table Box */}
      <LogsTable
        logs={logs}
        totalLines={totalLines}
        selectedDate={selectedDate}
        selectedLines={selectedLines}
        handleDeleteLines={handleDeleteLines}
        handleCopyLogs={handleCopyLogs}
        handleDownloadLogs={handleDownloadLogs}
        handleSelectAll={handleSelectAll}
        handleSelectLine={handleSelectLine}
        loading={loading}
      />

      {/* Modal para colar logs manualmente */}
      <LogsPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        manualLogs={manualLogs}
        setManualLogs={setManualLogs}
        handlePasteManually={handlePasteManually}
      />

      {/* Modal de confirmação customizado */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        danger={confirmModal.danger}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
