# Oráculo Bella — Plataforma e Estúdio de Conteúdo Inteligente

O **Oráculo Bella** é um sistema completo voltado para criação, geração, curadoria e automação de conteúdo multimídia (carrosséis, posts, reels e materiais visuais) com inteligência artificial generativa, pipelines automatizados de renderização de slides e gestão com persistência robusta.

---

## 🚀 Visão Geral da Arquitetura

O ecossistema é dividido em três camadas principais:

```
├── backend/                  # Servidor de API, agentes de IA, renderizadores e banco
├── frontend/                 # Interface Web interativa (React 18 + Vite)
└── docker/                   # Arquivos de orquestração Docker, Docker Compose e Swarm
```

### 1. Backend (`/backend`)
- **Node.js 22 (ESM) + Express**: Gerencia autenticação JWT, usuários, filas de carrosséis, histórico de geração, biblioteca de mídia e SSE (Server-Sent Events) para acompanhamento em tempo real.
- **Python 3 + Pillow + NumPy**: Pipeline de renderização gráfica precisa para composição de tipografia, molduras, backgrounds e slides visuais em alta resolução.
- **Modelos e Provedores de IA**:
  - Integração com OpenAI (geração de copy e imagens via GPT / DALL-E).
  - Google Gemini API (geração de imagens e análise visual).
  - Anthropic Claude (redação estratégica e personas de conteúdo).
- **Banco de Dados Relacional**:
  - PostgreSQL 16 nativo para persistência de usuários, tokens, histórico, custos de API e configurações de branding.
- **Armazenamento de Mídia (S3-Compatible)**:
  - Compatibilidade com Backblaze B2 e MinIO para uploads e links permanentes de carrosséis.

### 2. Frontend (`/frontend`)
- Construído com **React 18** e **Vite**.
- Interface moderna, responsiva, com tema escuro (Dark Luxury) desenhado especificamente para estúdios criativos.
- Painel para edição de texto, ajuste visual de slides, visualização em tempo real de carrosséis, monitoramento de filas e gestão de usuários/senhas.

### 3. Conteinerização & Infraestrutura (`/docker`)
- **Desenvolvimento Local (`docker-compose.yml`)**:
  - Orquestra `oraculo-db` (PostgreSQL 16), `oraculo-backend` e `oraculo-frontend`.
  - Configuração de volumes persistentes e redes isoladas.
- **Produção no Docker Swarm (`docker-compose-producao.yml`)**:
  - Preparado para cluster com **Traefik** e certificado automático **Let's Encrypt** (SSL/HTTPS).
  - Conexão direta com a rede externa `network_swarm_public` integrando o banco e o storage já existentes no servidor.
  - Imagens publicadas no Docker Hub:
    - `aryalvesfernandes/oraculo-bella:backend-1.0.0`
    - `aryalvesfernandes/oraculo-bella:frontend-1.0.0`

---

## 🛠️ Como Executar o Projeto Localmente com Docker

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jords024/oraculo-bella.git
   cd oraculo-bella
   ```

2. **Configure as Variáveis de Ambiente:**
   Copie o exemplo para o backend:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Preencha suas credenciais de IA (OpenAI, Gemini), chaves JWT e banco de dados.*

3. **Suba os Containers:**
   ```bash
   cd docker
   docker compose up -d
   ```

4. **Acesse as Aplicações:**
   - **Frontend (Interface Web)**: [http://localhost:5177](http://localhost:5177)
   - **Backend API**: [http://localhost:3131](http://localhost:3131)
   - **PostgreSQL**: `localhost:5432`

---

## 🧪 Testes Unitários

O projeto conta com suite de testes automatizados com Node Test Runner para assegurar estabilidade, consistência nas imagens Docker, segurança criptográfica e conectividade externa:

```bash
cd backend
node --test tests/test_docker_config.test.js
node --test tests/test_crypto.js
node --test tests/test_b2_connection.test.js
```

---

## 📦 Deploy em Produção (Docker Swarm)

Para fazer o deploy em um servidor gerenciado por Docker Swarm com Traefik:

1. Assegure a existência da rede pública e volumes no manager:
   ```bash
   docker network create --driver overlay --attachable network_swarm_public
   docker volume create oraculo_backend_storage
   docker volume create oraculo_backend_logs
   ```

2. Efetue o deploy da stack:
   ```bash
   cd docker
   docker stack deploy -c docker-compose-producao.yml oraculo-bella
   ```
