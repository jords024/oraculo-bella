import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REFERENCE_DIR = path.join(__dirname, '..', '..', 'agents', 'visual-references');

function readJson(filename, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(path.join(REFERENCE_DIR, filename), 'utf8')); }
  catch { return fallback; }
}

export function getBellaVisualReferenceContract() {
  const index = readJson('index.json', { arquivos: [], principios_transversais_de_flow: {} });
  const references = (index.arquivos || []).map(filename => readJson(filename, null)).filter(Boolean);
  return {
    library: index.biblioteca || 'bella-visual-flow-references',
    objective: index.objetivo || '',
    flowPrinciples: index.principios_transversais_de_flow || {},
    references: references.map(reference => ({
      id: reference.ref_id,
      role: reference.papel_no_carrossel,
      archetype: reference.layout_arquetipo,
      purpose: reference.papel_no_fluxo,
      reusableParameters: reference.parametros_reaproveitaveis_sem_engessar,
      doNotCopy: reference.nao_copiar_literalmente,
      antiPattern: reference.antipadrao || reference.por_que_falha || null
    }))
  };
}
