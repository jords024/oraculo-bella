# Deploy em VPS (Ubuntu 22.04 ou 24.04)

Roteiro testado por leitura do código e por instalação do zero num clone limpo (Windows).
Os comandos de Linux abaixo NÃO foram executados em um servidor real: rode com atenção.

## O que precisa estar no servidor
- Node.js 22 ou 24 (o desenvolvimento roda em 24.14), Python 3.10+ com `venv`, Git, Nginx, PostgreSQL.
- 2 GB de RAM ou mais (a composição das imagens usa Pillow) e disco para `storage/`.
- Chaves: `OPENAI_API_KEY` é obrigatória (texto e imagens). RabbitMQ e MinIO/B2 são opcionais.

## 1. Pacotes
```bash
sudo apt update && sudo apt install -y git nginx postgresql python3 python3-venv python3-pip
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2. Código (o repositório é privado)
Use uma chave de deploy somente leitura ou um token do GitHub.
```bash
sudo mkdir -p /app && sudo chown $USER /app
git clone https://github.com/jords024/oraculo-bella.git /app
cd /app/backend
npm ci --omit=dev
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
mkdir -p storage/carousels storage/library logs
```
A pasta pode ser outra que não `/app`: os caminhos de gravação são relativos ao código.

## 3. Banco Postgres (recomendado; o banco embarcado PGlite já corrompeu 5 vezes)
```bash
sudo -u postgres psql -c "CREATE USER oraculo WITH PASSWORD 'TROQUE_ESTA_SENHA';"
sudo -u postgres psql -c "CREATE DATABASE oracle_manager OWNER oraculo;"
```
As tabelas são criadas sozinhas na primeira subida.

## 4. Variáveis de ambiente
```bash
cp .env.example .env && nano .env
```
Obrigatórias em produção: `NODE_ENV=production`, `PORT`, `JWT_SECRET` (longa e aleatória; sem ela o
servidor **encerra**), `PASSWORD_PEPPER`, `DASHBOARD_USER`, `DASHBOARD_PASS` (senha forte),
`OPENAI_API_KEY`, `DB_HOST=localhost`, `DB_PORT=5432`, `DB_USER=oraculo`, `DB_PASSWORD`, `DB_NAME=oracle_manager`,
`CORS_ALLOWED_ORIGINS=https://SEU_DOMINIO`. Gere segredos com `openssl rand -hex 32`.
Nunca coloque o `.env` no Git.

## 5. Subir o sistema
```bash
cd /app/backend
pm2 start ecosystem.config.cjs && pm2 save && pm2 startup     # rode o comando que o pm2 imprimir
pm2 logs oraculo-dashboard --lines 40
```
Confira no log: "PostgreSQL" conectado (e não "PGlite"), "Oráculo Dashboard iniciado".

## 6. Nginx e HTTPS
Copie `deploy/nginx-oraculo.conf.example` para `/etc/nginx/sites-available/oraculo`, troque o domínio e siga
os comandos no fim do arquivo. O `proxy_buffering off` e os timeouts longos são necessários: a geração
usa resposta em fluxo (SSE) e leva minutos. Abra só as portas 22, 80 e 443 (`ufw`); a porta do Node não fica exposta.

## 7. Depois de subir (importante)
1. Entre no dashboard e vá em Configurações, aba de prompts. **Se houver prompts salvos**, eles sobrescrevem os
   arquivos `.md` (inclusive `oraculo-v2.md`, o Oráculo da Bella) e o texto novo não passa a valer.
2. O login de administrador vem só de `DASHBOARD_USER` e `DASHBOARD_PASS` do `.env` (não existe senha padrão no
   código). Em produção o sistema não cria mais o usuário de desenvolvimento `admin@exemplo.com.br`; se o log
   avisar que ele existe, apague-o. `DASHBOARD_PASS2` é opcional (segundo administrador).
3. Teste: peça ideias no Criador e gere um carrossel de 3 lâminas para conferir texto, imagem e download.

## Atualizar depois
```bash
cd /app && git pull && cd backend && npm ci --omit=dev && .venv/bin/pip install -r requirements.txt && pm2 restart oraculo-dashboard
```
Mudanças em `.md` (prompts) valem sem reiniciar. Mudanças em código `.js` pedem `pm2 restart`.
O frontend é servido de `frontend/dist`, que é versionado: se mudar `frontend/src`, rode `npm run build`
na pasta `frontend` e faça commit do `dist` antes.

## Backups
- Banco: `pg_dump -U oraculo oracle_manager | gzip > backup-$(date +%F).sql.gz` (agende no cron).
- Imagens: copie `backend/storage/` (é onde ficam os carrosséis gerados).

## Interruptores úteis
- `ORACULO_MODO_UNICO=0` volta ao pipeline antigo com vários agentes (padrão: 1, só o Oráculo).
- `USE_MOCK_GENERATOR=true` gera sem chamar a OpenAI (teste de fluxo, sem custo).
