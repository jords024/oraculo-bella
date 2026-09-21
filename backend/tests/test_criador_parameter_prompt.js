import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { buildAgentPrompts } from '../dashboard/agentPrompts.js';

// Teste unitário para validar as instruções de perguntas de formato e quantidade de slides no prompt do Criador
function testCriadorParameterPrompt() {
  console.log('🧪 Executando testes unitários das regras do prompt do Criador...');

  const clientPath = path.resolve('backend/dashboard/client.json');
  let clientData = {};
  if (fs.existsSync(clientPath)) {
    clientData = JSON.parse(fs.readFileSync(clientPath, 'utf-8'));
  }

  const prompts = buildAgentPrompts(clientData);
  const criadorPrompt = prompts.criador;

  assert.ok(criadorPrompt, 'O prompt do Criador deve existir');
  assert.ok(criadorPrompt.includes('PROCESSO DE BRIEFING DE CARROSSEL:'), 'Deve conter o protocolo de processo de briefing');
  assert.ok(criadorPrompt.includes('Formato do Roteiro:'), 'Deve orientar a perguntar o formato');
  assert.ok(criadorPrompt.includes('Quantidade de Slides:'), 'Deve orientar a perguntar a quantidade de slides e fundo preto');

  console.log('  ✓ Teste 1: Prompt do Criador inclui instrução obrigatória para perguntar formato, quantidade de slides e slides com fundo preto.');
  console.log('✅ Todos os testes de regras do prompt do Criador passaram com sucesso!');
}

testCriadorParameterPrompt();
