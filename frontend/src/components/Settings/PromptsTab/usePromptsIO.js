import { useRef } from 'react';

export function usePromptsIO({ prompts, showToast }) {
  const importInputRef = useRef(null);

  const handleExport = async () => {
    try {
      if (showToast) showToast('Gerando exportação de todos os prompts...');
      const res = await fetch('/api/settings/prompts', { credentials: 'include' });
      const data = await res.json();
      const allPrompts = data.prompts || prompts;

      const exportData = allPrompts.map(p => ({
        id: p.id,
        name: p.name,
        content: p.content || ''
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oraculo-prompts-todos-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (showToast) showToast(`✓ ${exportData.length} prompt(s) exportado(s) com sucesso!`);
    } catch (err) {
      if (showToast) showToast('Erro ao exportar prompts: ' + err.message);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('Formato inválido: esperado um array de prompts.');
        let count = 0;
        if (showToast) showToast(`Importando ${parsed.length} prompt(s)...`);
        for (const entry of parsed) {
          if (!entry.id || entry.content === undefined) continue;
          await fetch('/api/settings/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: entry.id, content: entry.content }),
            credentials: 'include'
          });
          if (entry.name) {
            await fetch('/api/settings/prompts/rename', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: entry.id, name: entry.name }),
              credentials: 'include'
            });
          }
          count++;
        }
        if (showToast) showToast(`✓ ${count} prompt(s) importado(s) e salvos com sucesso! Recarregando...`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        if (showToast) showToast('Erro ao importar: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return {
    importInputRef,
    handleExport,
    handleImport
  };
}
