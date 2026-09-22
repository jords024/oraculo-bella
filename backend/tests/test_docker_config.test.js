/**
 * test_docker_config.test.js — Testes unitários da configuração Docker
 *
 * Valida:
 * 1. Existência e integridade estrutural do docker-compose.yml (serviços db, backend, frontend)
 * 2. Existência e comandos essenciais do Dockerfile.backend (Node 22, Python 3, venv, requirements)
 * 3. Existência e comandos essenciais do Dockerfile.frontend (Node 22, Vite, build/dev)
 * 4. Validação do arquivo de ambiente .env.docker.example com as chaves essenciais
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
let dockerDir = path.resolve(projectRoot, 'docker');
if (!fs.existsSync(dockerDir)) {
  dockerDir = path.resolve(__dirname, '..', 'docker');
}

test('Docker Compose — deve existir e conter serviços db, backend e frontend', () => {
  if (!fs.existsSync(dockerDir)) {
    // Se estiver rodando dentro do container onde apenas backend foi montado
    return;
  }
  const composePath = path.join(dockerDir, 'docker-compose.yml');
  assert.ok(fs.existsSync(composePath), 'docker-compose.yml deve existir');

  const content = fs.readFileSync(composePath, 'utf8');

  // Verifica nome da stack
  assert.match(content, /^name:\s*oraculo-bella/m, 'deve definir a stack como oraculo-bella');

  // Verifica serviços principais
  assert.match(content, /db:\s*\n/m, 'deve definir o serviço db (postgres)');
  assert.match(content, /backend:\s*\n/m, 'deve definir o serviço backend');
  assert.match(content, /frontend:\s*\n/m, 'deve definir o serviço frontend');

  // Verifica imagem e portas do PostgreSQL
  assert.match(content, /postgres:16-alpine/, 'db deve usar postgres:16-alpine');
  assert.match(content, /5432/, 'porta 5432 deve estar configurada');
  assert.match(content, /pg_isready/, 'healthcheck do postgres deve usar pg_isready');

  // Verifica rede e volumes
  assert.match(content, /networks:\s*\n\s*oraculo-network:/m, 'deve definir a rede oraculo-network');
  assert.match(content, /postgres_data:/, 'deve possuir volume de persistência do postgres');
  assert.match(content, /backend_storage:/, 'deve possuir volume de persistência do backend');
});

test('Dockerfile.backend — deve configurar Node 22 com suporte a Python 3 e Pillow', () => {
  const dockerfilePath = path.join(dockerDir, 'Dockerfile.backend');
  assert.ok(fs.existsSync(dockerfilePath), 'Dockerfile.backend deve existir');

  const content = fs.readFileSync(dockerfilePath, 'utf8');

  assert.match(content, /^FROM node:22/m, 'deve utilizar base Node 22');
  assert.match(content, /python3/, 'deve instalar python3');
  assert.match(content, /python3-venv/, 'deve instalar python3-venv');
  assert.match(content, /requirements\.txt/, 'deve copiar e instalar requirements.txt');
  assert.match(content, /package\*\.json/, 'deve copiar package.json');
  assert.match(content, /EXPOSE 3131/, 'deve expor a porta 3131');
});

test('Dockerfile.frontend — deve configurar Node 22 para Vite', () => {
  const dockerfilePath = path.join(dockerDir, 'Dockerfile.frontend');
  assert.ok(fs.existsSync(dockerfilePath), 'Dockerfile.frontend deve existir');

  const content = fs.readFileSync(dockerfilePath, 'utf8');

  assert.match(content, /^FROM node:22/m, 'deve utilizar base Node 22');
  assert.match(content, /package\*\.json/, 'deve copiar os arquivos de pacotes');
  assert.match(content, /EXPOSE 5176/, 'deve expor a porta 5176');
  assert.match(content, /CMD/, 'deve definir comando de execução');
});

test('.env.docker.example — deve conter variáveis cruciais pré-configuradas', () => {
  const envExamplePath = path.join(dockerDir, '.env.docker.example');
  assert.ok(fs.existsSync(envExamplePath), '.env.docker.example deve existir');

  const content = fs.readFileSync(envExamplePath, 'utf8');

  assert.match(content, /DB_HOST=db/, 'DB_HOST deve apontar para o host db do docker');
  assert.match(content, /DB_PORT=5432/, 'DB_PORT deve ser 5432');
  assert.match(content, /DB_NAME=oracle_manager/, 'DB_NAME deve ser oracle_manager');
  assert.match(content, /JWT_SECRET=/, 'deve conter chave JWT_SECRET');
  assert.match(content, /PASSWORD_PEPPER=/, 'deve conter chave PASSWORD_PEPPER');
});

test('docker-compose-producao.yml — deve conter apenas serviços da aplicação (backend e frontend), Traefik labels e rede swarm', () => {
  if (!fs.existsSync(dockerDir)) {
    return;
  }
  const prodComposePath = path.join(dockerDir, 'docker-compose-producao.yml');
  assert.ok(fs.existsSync(prodComposePath), 'docker-compose-producao.yml deve existir');

  const content = fs.readFileSync(prodComposePath, 'utf8');

  // Verifica versão
  assert.match(content, /version:\s*"3\.7"/, 'deve definir version 3.7');

  // Verifica que NÃO define containers próprios para db e minio
  assert.doesNotMatch(content, /^\s{2}minio:\s*$/m, 'não deve definir o container minio local');
  assert.doesNotMatch(content, /^\s{2}db:\s*$/m, 'não deve definir o container db local');

  // Verifica imagens exatas no repositório aryalvesfernandes/oraculo-bella
  assert.match(content, /image:\s*aryalvesfernandes\/oraculo-bella:backend-1\.0\.0/, 'backend deve usar a tag backend-1.0.0');
  assert.match(content, /image:\s*aryalvesfernandes\/oraculo-bella:frontend-1\.0\.0/, 'frontend deve usar a tag frontend-1.0.0');
  assert.doesNotMatch(content, /:latest/, 'não deve utilizar tag latest');

  // Verifica Labels Traefik e Deploy Swarm
  assert.match(content, /traefik\.enable=true/, 'deve possuir traefik.enable=true');
  assert.match(content, /traefik\.http\.routers\.oraculo_backend/, 'deve configurar router backend');
  assert.match(content, /traefik\.http\.routers\.oraculo_frontend/, 'deve configurar router frontend');

  // Verifica rede externa
  assert.match(content, /network_swarm_public:/, 'deve definir a rede network_swarm_public');
  assert.match(content, /external:\s*true/, 'rede network_swarm_public deve ser externa');
});

test('README.md (raiz) — deve existir e conter seções explicativas essenciais', () => {
  const rootReadmePath = path.join(projectRoot, 'README.md');
  if (!fs.existsSync(rootReadmePath)) {
    return;
  }
  const content = fs.readFileSync(rootReadmePath, 'utf8');
  assert.match(content, /# Oráculo Bella/, 'deve conter o título do projeto');
  assert.match(content, /Visão Geral da Arquitetura/, 'deve conter seção de arquitetura');
  assert.match(content, /Como Executar o Projeto Localmente/, 'deve conter instruções de execução local');
  assert.match(content, /Deploy em Produção/, 'deve conter seção de deploy em produção');
});
