import React, { useState, useEffect, useRef } from 'react';
import BackupStatusCards from './BackupStatusCards';
import BackupConfigForm from './BackupConfigForm';
import BackupList from './BackupList';
import BackupModals from './BackupModals';
import BackupManualActions from './BackupManualActions';

export default function BackupManagement({ showToast }) {
  const [subTab, setSubTab] = useState('history'); // 'history' | 'manual' | 'schedule'

  const [config, setConfig] = useState({
    enabled: false,
    frequency: 'hours',
    interval_val: 6,
    s3_folder: 'backups/',
    retention: 30
  });

  const [backups, setBackups] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Seleção e Exclusão em Massa
  const [selectedBackups, setSelectedBackups] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Paginação e Exibição
  const [displayCount, setDisplayCount] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Modais de Confirmação
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoreFilename, setRestoreFilename] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteFilename, setDeleteFilename] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadConfig();
    loadBackups();
  }, []);

  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/backups/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      showToast('Erro ao carregar configurações de backup.');
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadBackups = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/backups/list');
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (e) {
      showToast('Erro ao carregar lista de backups.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleSaveConfig = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/backups/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        showToast('✓ Configuração de backup salva com sucesso!');
        loadConfig();
      } else {
        showToast('Erro ao salvar configuração.');
      }
    } catch (e) {
      showToast('Erro de rede ao salvar configuração.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualBackup = async () => {
    setActionLoading(true);
    showToast('⚙️ Iniciando backup imediato...');
    try {
      const res = await fetch('/api/backups/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`✓ Backup ${data.filename} gerado com sucesso!`);
        loadBackups();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao gerar backup.');
      }
    } catch (e) {
      showToast('Erro de rede ao gerar backup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionLoading(true);
    showToast('📤 Enviando arquivo de backup para o S3...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/backups/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`✓ Backup ${data.filename} importado com sucesso!`);
        loadBackups();
      } else {
        const data = await res.json();
        showToast(data.error || 'Falha no upload do backup.');
      }
    } catch (err) {
      showToast('Erro de rede ao importar backup.');
    } finally {
      setActionLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmRestore = (filename) => {
    setRestoreFilename(filename);
    setRestoreModalOpen(true);
  };

  const handleRestore = async () => {
    setRestoreModalOpen(false);
    setActionLoading(true);
    showToast(`⚙️ Restaurando banco de dados a partir de ${restoreFilename}...`);
    try {
      const res = await fetch(`/api/backups/restore/${restoreFilename}`, { method: 'POST' });
      if (res.ok) {
        showToast('✓ Banco de dados restaurado com sucesso!');
      } else {
        const data = await res.json();
        showToast(data.error || 'Falha ao restaurar banco de dados.');
      }
    } catch (e) {
      showToast('Erro de rede ao restaurar banco.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (filename) => {
    setDeleteFilename(filename);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleteModalOpen(false);
    setActionLoading(true);
    try {
      const res = await fetch(`/api/backups/${deleteFilename}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Backup excluído do S3.');
        loadBackups();
      } else {
        showToast('Falha ao deletar backup.');
      }
    } catch (e) {
      showToast('Erro de rede ao deletar backup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectToggle = (filename) => {
    setSelectedBackups(prev => 
      prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]
    );
  };

  const handleSelectAllToggle = () => {
    const currentPageFilenames = paginatedBackups.map(b => b.filename);
    const allSelectedOnPage = currentPageFilenames.every(f => selectedBackups.includes(f));

    if (allSelectedOnPage) {
      setSelectedBackups(prev => prev.filter(f => !currentPageFilenames.includes(f)));
    } else {
      setSelectedBackups(prev => {
        const union = new Set([...prev, ...currentPageFilenames]);
        return Array.from(union);
      });
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteModalOpen(false);
    setActionLoading(true);
    showToast(`⚙️ Excluindo ${selectedBackups.length} backup(s)...`);
    try {
      const res = await fetch('/api/backups/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames: selectedBackups })
      });
      if (res.ok) {
        showToast('✓ Backups excluídos com sucesso do S3.');
        setSelectedBackups([]);
        loadBackups();
      } else {
        showToast('Falha ao excluir backups em massa.');
      }
    } catch (e) {
      showToast('Erro de rede ao excluir backups.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getFreqLabel = (freq, count) => {
    const labels = {
      minutes: count === 1 ? 'minuto' : 'minutos',
      hours: count === 1 ? 'hora' : 'horas',
      days: count === 1 ? 'dia' : 'dias'
    };
    return labels[freq] || freq;
  };

  // Paginação
  const totalPages = Math.ceil(backups.length / displayCount) || 1;
  const paginatedBackups = backups.slice((currentPage - 1) * displayCount, currentPage * displayCount);

  // Informações de status dos Cards
  const successBackups = backups.filter(b => b.status === 'success');
  const lastSuccessBackup = successBackups[0];

  const lastBackupFilename = lastSuccessBackup ? lastSuccessBackup.filename : 'Nenhum backup realizado';
  const lastBackupTime = lastSuccessBackup ? new Date(lastSuccessBackup.created_at).toLocaleString('pt-BR') : '';

  let nextBackupTime = 'Agendamento desativado';
  let nextBackupSub = `A cada ${config.interval_val || 6} ${getFreqLabel(config.frequency, config.interval_val || 6)}`;

  if (config.enabled) {
    const lastTime = lastSuccessBackup ? new Date(lastSuccessBackup.created_at) : new Date(config.updated_at || Date.now());
    let intervalMs = 0;
    const value = config.interval_val || 6;
    if (config.frequency === 'minutes') {
      intervalMs = value * 60 * 1000;
    } else if (config.frequency === 'hours') {
      intervalMs = value * 60 * 60 * 1000;
    } else if (config.frequency === 'days') {
      intervalMs = value * 24 * 60 * 60 * 1000;
    }
    const nextDate = new Date(lastTime.getTime() + intervalMs);
    nextBackupTime = nextDate.toLocaleString('pt-BR');
    nextBackupSub = `A cada ${value} ${getFreqLabel(config.frequency, value)}(s)`;
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">BACKUPS DO BANCO</div>
          <div className="oraculo-subtitle">Gerencie backups automáticos, faça downloads e restaure o banco de dados PostgreSQL.</div>
        </div>
      </div>

      {/* Barra de Navegação por Abas */}
      <div
        className="inner-tabs"
        style={{
          display: 'flex',
          gap: '12px',
          margin: '0 16px 20px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}
      >
        <button
          className={`inner-tab-btn ${subTab === 'history' ? 'active' : ''}`}
          onClick={() => setSubTab('history')}
          style={{
            background: subTab === 'history' ? 'rgba(212, 163, 89, 0.12)' : 'rgba(255, 255, 255, 0.02)',
            border: subTab === 'history' ? '1px solid rgba(212, 163, 89, 0.4)' : '1px solid var(--border)',
            color: subTab === 'history' ? 'var(--gold)' : 'var(--text-3)',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: subTab === 'history' ? '0 0 15px rgba(212, 163, 89, 0.15)' : 'none'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>Histórico & Arquivos</span>
          <span
            style={{
              background: subTab === 'history' ? 'var(--gold)' : 'var(--surface-d)',
              color: subTab === 'history' ? '#000' : 'var(--text-3)',
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 7px',
              borderRadius: '12px',
              marginLeft: '4px'
            }}
          >
            {backups.length}
          </span>
        </button>

        <button
          className={`inner-tab-btn ${subTab === 'manual' ? 'active' : ''}`}
          onClick={() => setSubTab('manual')}
          style={{
            background: subTab === 'manual' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255, 255, 255, 0.02)',
            border: subTab === 'manual' ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid var(--border)',
            color: subTab === 'manual' ? 'var(--orange)' : 'var(--text-3)',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: subTab === 'manual' ? '0 0 15px rgba(249, 115, 22, 0.15)' : 'none'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>Backup Manual & Importar</span>
        </button>

        <button
          className={`inner-tab-btn ${subTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setSubTab('schedule')}
          style={{
            background: subTab === 'schedule' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.02)',
            border: subTab === 'schedule' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border)',
            color: subTab === 'schedule' ? '#c084fc' : 'var(--text-3)',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: subTab === 'schedule' ? '0 0 15px rgba(168, 85, 247, 0.15)' : 'none'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Agendamento & Retenção</span>
          {config.enabled && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 6px #22c55e'
              }}
              title="Agendamento Ativo"
            />
          )}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 16px' }}>
        
        {/* Aba 1: Histórico & Arquivos */}
        {subTab === 'history' && (
          <>
            {/* Cards de Status (Último, Próximo e Retenção) */}
            <BackupStatusCards
              lastBackupFilename={lastBackupFilename}
              lastBackupTime={lastBackupTime}
              nextBackupTime={nextBackupTime}
              nextBackupSub={nextBackupSub}
              retention={config.retention}
            />

            {/* Lista de Backups no S3 */}
            <BackupList
              backups={backups}
              loadingList={loadingList}
              paginatedBackups={paginatedBackups}
              selectedBackups={selectedBackups}
              handleSelectAllToggle={handleSelectAllToggle}
              handleSelectToggle={handleSelectToggle}
              formatSize={formatSize}
              confirmRestore={confirmRestore}
              confirmDelete={confirmDelete}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              displayCount={displayCount}
              setDisplayCount={setDisplayCount}
              loadBackups={loadBackups}
              setBulkDeleteModalOpen={setBulkDeleteModalOpen}
            />
          </>
        )}

        {/* Aba 2: Backup Manual & Importar */}
        {subTab === 'manual' && (
          <BackupManualActions
            handleManualBackup={handleManualBackup}
            handleUploadClick={handleUploadClick}
            handleFileChange={handleFileChange}
            fileInputRef={fileInputRef}
            actionLoading={actionLoading}
          />
        )}

        {/* Aba 3: Agendamento & Retenção */}
        {subTab === 'schedule' && (
          <BackupConfigForm
            config={config}
            setConfig={setConfig}
            loadingConfig={loadingConfig}
            actionLoading={actionLoading}
            handleSaveConfig={handleSaveConfig}
            getFreqLabel={getFreqLabel}
          />
        )}

      </div>

      {/* Modais de Confirmação */}
      <BackupModals
        restoreModalOpen={restoreModalOpen}
        setRestoreModalOpen={setRestoreModalOpen}
        restoreFilename={restoreFilename}
        handleRestore={handleRestore}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        deleteFilename={deleteFilename}
        handleDelete={handleDelete}
        bulkDeleteModalOpen={bulkDeleteModalOpen}
        setBulkDeleteModalOpen={setBulkDeleteModalOpen}
        selectedBackups={selectedBackups}
        handleBulkDelete={handleBulkDelete}
        actionLoading={actionLoading}
      />
    </div>
  );
}
