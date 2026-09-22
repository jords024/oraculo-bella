# Oráculo Bella — Guia Docker

Este diretório contém a infraestrutura conteinerizada para execução local ou em produção do Oráculo Bella.

## Serviços Inclusos:
1. **db (PostgreSQL 16)**: Banco de dados relacional com volume persistente e healthcheck.
2. **backend**: Servidor Node.js integrado com Python 3, Pillow e dependências para os agentes de IA.
3. **frontend**: Interface React com Vite conectada à API do backend.

---

## Como Rodar:

1. Entre na pasta `docker`:
   ```bash
   cd docker
   ```

2. (Opcional) Copie o arquivo de variáveis de ambiente e configure suas chaves de API:
   ```bash
   cp .env.docker.example .env
   ```

3. Suba os containers com o Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. Acesse os serviços:
   - **Frontend**: [http://localhost:5177](http://localhost:5177) (ou porta customizada via `FRONTEND_PORT`)
   - **Backend API**: [http://localhost:3131](http://localhost:3131)
   - **PostgreSQL**: `localhost:5432`

---

## Comandos Úteis:

- Ver status dos containers:
  ```bash
  docker compose ps
  ```

- Ver logs em tempo real:
  ```bash
  docker compose logs -f backend
  ```

- Parar os serviços:
  ```bash
  docker compose down
  ```

- Parar e remover dados persistentes (reseta o banco):
  ```bash
  docker compose down -v
  ```

---

## Deploy em Produção (Docker Swarm + Traefik)

O arquivo `docker-compose-producao.yml` está configurado para deploy em cluster Docker Swarm com Traefik e rede externa `network_swarm_public`.

1. Garanta que a rede externa exista no nó manager do Swarm:
   ```bash
   docker network create --driver overlay --attachable network_swarm_public
   ```

2. Crie os volumes externos da aplicação se ainda não existirem:
   ```bash
   docker volume create oraculo_backend_storage
   docker volume create oraculo_backend_logs
   ```

3. Faça o deploy da stack:
   ```bash
   docker stack deploy -c docker-compose-producao.yml oraculo-bella
   ```

