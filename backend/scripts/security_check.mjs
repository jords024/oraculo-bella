#!/usr/bin/env node
/**
 * security_check.mjs — Automação de Verificação de Vulnerabilidades e Segredos
 * 
 * Executada automaticamente antes de qualquer 'git push' (via .git/hooks/pre-push)
 * e também disponível manualmente via npm run security:audit.
 * 
 * Analisa:
 * 1. Vulnerabilidades de dependências no backend (npm audit)
 * 2. Vulnerabilidades de dependências no frontend (npm audit)
 * 3. Varredura de segredos e chaves de API expostas em arquivos commitáveis
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// Cores ANSI para o terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  bgRed: '\x1b[41m\x1b[37m'
};

console.log(`\n${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}${colors.bold} 🛡️  AUTOMAÇÃO DE SEGURANÇA — ORÁCULO BELLA (PRÉ-PUSH)           ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}\n`);

let hasVulnerabilities = false;
const issuesList = [];

/**
 * Executa auditoria do npm em um diretório e retorna relatório padronizado
 */
export function runNpmAudit(targetDir, label) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return { target: label, total: 0, vulnerabilities: [] };
  }

  let auditRaw = '';
  try {
    auditRaw = execSync('npm audit --json', {
      cwd: targetDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });
  } catch (err) {
    // npm audit retorna código 1 se encontrar vulnerabilidades
    auditRaw = err.stdout || '{}';
  }

  try {
    const data = JSON.parse(auditRaw);
    const vulns = [];
    const entries = data.vulnerabilities || {};

    for (const [pkgName, item] of Object.entries(entries)) {
      vulns.push({
        package: pkgName,
        severity: item.severity || 'unknown',
        range: item.range || 'N/A',
        isDirect: !!item.isDirect,
        via: Array.isArray(item.via) ? item.via.map(v => typeof v === 'string' ? v : v.title || v.name).join(', ') : ''
      });
    }

    return {
      target: label,
      total: vulns.length,
      critical: vulns.filter(v => v.severity === 'critical').length,
      high: vulns.filter(v => v.severity === 'high').length,
      moderate: vulns.filter(v => v.severity === 'moderate').length,
      low: vulns.filter(v => v.severity === 'low').length,
      list: vulns
    };
  } catch (parseErr) {
    return { target: label, total: 0, list: [], parseError: parseErr.message };
  }
}

/**
 * Varre arquivos do projeto em busca de possíveis chaves e segredos em texto puro
 */
export function checkHardcodedSecrets(rootDir) {
  const secretPatterns = [
    { name: 'OpenAI API Key Real', regex: /sk-proj-[a-zA-Z0-9_\-]{40,}/ },
    { name: 'Brevo API Key Real', regex: /xkeysib-[a-zA-Z0-9]{60,}/ },
    { name: 'Private Key PEM', regex: /-----BEGIN (RSA )?PRIVATE KEY-----/ }
  ];

  const violations = [];
  let trackedFiles = [];

  try {
    const stdout = execSync('git ls-files', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    trackedFiles = stdout.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    // Se git não estiver disponível, faz fallback
    trackedFiles = [];
  }

  for (const relPath of trackedFiles) {
    // Ignora .env de exemplo, arquivos de teste e binários
    if (
      relPath.endsWith('.example') ||
      relPath.includes('test_') ||
      relPath.includes('.test.') ||
      relPath.endsWith('.png') ||
      relPath.endsWith('.jpg') ||
      relPath.endsWith('.ico') ||
      relPath.endsWith('.lock')
    ) {
      continue;
    }

    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of secretPatterns) {
        if (pattern.regex.test(content)) {
          violations.push({
            file: relPath,
            type: pattern.name
          });
        }
      }
    } catch (e) {
      // Ignora arquivos binários ou inacessíveis
    }
  }

  return violations;
}

function getFilesRecursive(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          results = results.concat(getFilesRecursive(fullPath));
        }
      } else {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

// ── Execução das Análises ───────────────────────────────────────────────────

export function runSecurityAudit({ exitOnError = true, silent = false } = {}) {
  let hasVulnerabilities = false;

  if (!silent) {
    console.log(`\n${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold} 🛡️  AUTOMAÇÃO DE SEGURANÇA — ORÁCULO BELLA (PRÉ-PUSH)           ${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.bold}🔍 [1/3] Auditando dependências do BACKEND...${colors.reset}`);
  }
  const backendAudit = runNpmAudit(path.join(projectRoot, 'backend'), 'Backend');

  if (!silent) {
    console.log(`${colors.bold}🔍 [2/3] Auditando dependências do FRONTEND...${colors.reset}`);
  }
  const frontendAudit = runNpmAudit(path.join(projectRoot, 'frontend'), 'Frontend');

  if (!silent) {
    console.log(`${colors.bold}🔍 [3/3] Verificando segredos e chaves expostas no código...${colors.reset}`);
  }
  const secretViolations = checkHardcodedSecrets(projectRoot);

  // ── Exibição dos Resultados ─────────────────────────────────────────────────

  if (!silent) {
    console.log(`\n${colors.bold}📊 RESUMO DA AUDITORIA:${colors.reset}`);

    // Relatório Backend
    if (backendAudit.total > 0) {
      hasVulnerabilities = true;
      console.log(`\n  ${colors.red}${colors.bold}❌ BACKEND:${colors.reset} Encontradas ${colors.red}${backendAudit.total} vulnerabilidades${colors.reset} ` +
                  `(${backendAudit.critical} críticas, ${backendAudit.high} altas, ${backendAudit.moderate} moderadas, ${backendAudit.low} baixas)`);
      backendAudit.list.forEach(v => {
        const sevColor = v.severity === 'critical' || v.severity === 'high' ? colors.red : colors.yellow;
        console.log(`     • [${sevColor}${v.severity.toUpperCase()}${colors.reset}] Pacote: ${colors.bold}${v.package}${colors.reset} (versões: ${v.range}) — ${v.via || 'Dependência transitiva'}`);
      });
    } else {
      console.log(`  ${colors.green}✅ BACKEND:${colors.reset} Nenhuma vulnerabilidade detectada.`);
    }

    // Relatório Frontend
    if (frontendAudit.total > 0) {
      hasVulnerabilities = true;
      console.log(`\n  ${colors.red}${colors.bold}❌ FRONTEND:${colors.reset} Encontradas ${colors.red}${frontendAudit.total} vulnerabilidades${colors.reset} ` +
                  `(${frontendAudit.critical} críticas, ${frontendAudit.high} altas, ${frontendAudit.moderate} moderadas, ${frontendAudit.low} baixas)`);
      frontendAudit.list.forEach(v => {
        const sevColor = v.severity === 'critical' || v.severity === 'high' ? colors.red : colors.yellow;
        console.log(`     • [${sevColor}${v.severity.toUpperCase()}${colors.reset}] Pacote: ${colors.bold}${v.package}${colors.reset} (versões: ${v.range}) — ${v.via || 'Dependência transitiva'}`);
      });
    } else {
      console.log(`  ${colors.green}✅ FRONTEND:${colors.reset} Nenhuma vulnerabilidade detectada.`);
    }

    // Relatório Segredos
    if (secretViolations.length > 0) {
      hasVulnerabilities = true;
      console.log(`\n  ${colors.red}${colors.bold}🚨 SEGREDOS DETECTADOS NO CÓDIGO:${colors.reset}`);
      secretViolations.forEach(s => {
        console.log(`     • ${colors.red}${s.type}${colors.reset} encontrado em: ${colors.bold}${s.file}${colors.reset}`);
      });
    } else {
      console.log(`  ${colors.green}✅ SEGREDOS:${colors.reset} Nenhum segredo ou token exposto em arquivos rastreados.`);
    }

    console.log('\n──────────────────────────────────────────────────────────────────');
  } else {
    if (backendAudit.total > 0 || frontendAudit.total > 0 || secretViolations.length > 0) {
      hasVulnerabilities = true;
    }
  }

  const result = {
    hasVulnerabilities,
    backendAudit,
    frontendAudit,
    secretViolations
  };

  if (hasVulnerabilities) {
    if (!silent) {
      console.error(`\n${colors.bgRed} 🛑 ENVIO BLOQUEADO PELO SISTEMA DE SEGURANÇA! ${colors.reset}\n`);
      console.error(`${colors.red}${colors.bold}Foram encontradas vulnerabilidades ou problemas que precisam ser revisados antes de subir para o GitHub.${colors.reset}`);
      console.error(`\n${colors.yellow}Dica de correção de dependências:${colors.reset}`);
      console.error(`  1. No backend:  cd backend  && npm audit fix`);
      console.error(`  2. No frontend: cd frontend && npm audit fix\n`);
    }
    if (exitOnError) {
      process.exit(1);
    }
  } else {
    if (!silent) {
      console.log(`\n${colors.green}${colors.bold}✨ Tudo verificado e seguro! Autorizando envio ao GitHub...${colors.reset}\n`);
    }
    if (exitOnError) {
      process.exit(0);
    }
  }

  return result;
}

// Executa apenas quando chamado diretamente via CLI (node security_check.mjs)
const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectExecution) {
  runSecurityAudit({ exitOnError: true, silent: false });
}

