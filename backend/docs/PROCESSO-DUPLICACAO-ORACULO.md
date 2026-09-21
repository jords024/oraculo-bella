# O Processo de Duplicação do Oráculo
## Do Onboarding à Entrega — Playbook Completo de White-Label

> **Para:** Engenheiro responsável pela instalação
> **Versão:** 1.0 — Maio 2026
> **Tempo total de entrega:** 5 a 7 dias úteis

---

## VISÃO GERAL DO PRODUTO

O Oráculo não é um software que você instala.
É uma **fábrica de conteúdo com alma** — e a alma precisa ser transplantada, não clonada.

O código é o mesmo para todos os clientes. O que muda é tudo que está dentro dos arquivos de identidade: a voz, os valores, o visual, o inimigo, o produto, a linguagem do público.

Duplicar o Oráculo significa duas coisas distintas:

1. **Migração técnica** — trocar credenciais, configurar APIs, testar publicação
2. **Transplante de identidade** — reescrever os agentes com a alma do novo cliente

A maioria dos processos de SaaS foca apenas no ponto 1.
O que faz esse sistema funcionar é o ponto 2.

Este documento garante que os dois acontecem, na ordem certa, sem pular etapas.

---

## ESTRUTURA DO PROCESSO

```
FASE 0 — PRÉ-VENDA          Qualificação do cliente (antes de vender)
FASE 1 — ONBOARDING         Coleta de tudo que o sistema precisa
FASE 2 — TRANSPLANTE        Reescrever a alma (identidade + voz + visual)
FASE 3 — CALIBRAÇÃO         Primeiro carrossel real, aprovação, ajustes
FASE 4 — INFRAESTRUTURA     Setup técnico, APIs, publicação
FASE 5 — VOLUME INICIAL     Grade editorial + 7 carrosséis prontos
FASE 6 — ENTREGA            Documentação, treinamento, handover
```

---

## FASE 0 — PRÉ-VENDA (antes de fechar)

**Objetivo:** Garantir que o cliente tem o que precisa para o sistema funcionar.

O sistema depende de:
- Uma conta do Instagram profissional ativa (mín. 90 dias)
- Uma página do Facebook vinculada à conta do Instagram
- Uma conta no Meta Business Suite configurada
- Um produto ou serviço claro que justifica o CTA
- Um nicho definido (não aceitar "trabalho com várias coisas")

**Perguntas de qualificação:**

```
1. Você tem uma conta do Instagram profissional ativa?
2. Você já tem uma página do Facebook vinculada?
3. Você já tem acesso ao Meta Business Suite?
4. Qual é o produto principal que o conteúdo vai promover?
5. Qual é o nicho específico (não "meu público são pessoas que querem crescer")?
```

Se o cliente não tiver a estrutura Meta configurada, inclua no escopo ou sinalize como bloqueador antes de vender.

---

## FASE 1 — ONBOARDING (Dias 0-1)

**Objetivo:** Coletar tudo de uma vez, sem ir e vir por mensagem.

**Formato:** Formulário Notion enviado ao cliente. Prazo: 48h para devolver preenchido.

**O que acontece se ele não preencher direito:** Você agenda uma call de 1h para preencher junto. Não deixe para coletar informação parcial.

---

### FORMULÁRIO DE ONBOARDING

*(Usar Notion Form, Typeform ou Google Forms — links abaixo de cada seção)*

---

#### MÓDULO A — CREDENCIAIS TÉCNICAS

> Orientar o cliente a preencher em ambiente seguro.
> Nunca pedir por WhatsApp ou e-mail.
> Usar campo de senha no formulário ou Notion com acesso restrito.

---

**A1 — OpenAI API Key**

```
Sua chave começa com "sk-proj-..."
Como obter:
  1. Acesse: https://platform.openai.com/api-keys
  2. Clique em "Create new secret key"
  3. Nome sugerido: "oraculo-[seu-nome]"
  4. Copie e cole aqui — ela só aparece uma vez

Campo: [                                    ]

Atenção: Acesse também platform.openai.com/settings/billing
e configure um limite mensal de gasto (recomendamos $30/mês inicialmente).
```

---

**A2 — Meta System User Token**

```
Este é o token que nunca expira. NÃO é o token comum do Graph API Explorer.

Como obter:
  1. Acesse: https://business.facebook.com
  2. Configurações → Usuários → Usuários do Sistema
  3. Crie um "Usuário do sistema administrador" se não tiver
  4. Clique em "Gerar token"
  5. Selecione sua página do Facebook E sua conta do Instagram
  6. Permissões obrigatórias:
     ✓ instagram_content_publish
     ✓ instagram_manage_insights
     ✓ pages_read_engagement
  7. Gere e cole aqui

Campo: [                                    ]
```

---

**A3 — IDs da Conta**

```
Instagram Account ID (numérico, não é o @usuario):
  Como encontrar:
  1. Acesse: https://developers.facebook.com/tools/explorer
  2. No campo, digite: me/accounts
  3. Clique em Submit
  4. Encontre sua conta do Instagram no resultado
  5. Copie o "id" numérico

Campo Instagram Account ID: [              ]

Facebook Page ID:
  Mesmo processo acima — o "id" da página do Facebook

Campo Facebook Page ID: [                  ]
```

---

**A4 — ImgBB API Key**

```
Para hospedar as imagens temporariamente (exigido pela Meta API).
Serviço gratuito.

Como obter:
  1. Acesse: https://imgbb.com → crie uma conta gratuita
  2. Vá em: https://api.imgbb.com
  3. Copie sua chave de API

Campo: [                                    ]
```

---

**A5 — ElevenLabs** *(preencher apenas se o escopo inclui Reels com voz)*

```
Para narração e efeitos sonoros dos Reels.

Como obter a API Key:
  1. Acesse: https://elevenlabs.io → faça login
  2. Clique no seu avatar → Profile → API Key
  3. Copie e cole aqui

API Key: [                                  ]

Voice ID (opcional — ajudaremos a escolher):
  1. No ElevenLabs, vá em Voice Library
  2. Ouça as vozes e escolha a que combina com sua marca
  3. Clique na voz → o ID está na URL ou nas informações
  4. Cole aqui (se já tiver uma preferência)

Voice ID: [                                 ]
```

---

**A6 — fal.ai** *(preencher apenas se o escopo inclui Reels com vídeo IA)*

```
Para geração de vídeos cinematográficos (Kling Pro).

Como obter:
  1. Acesse: https://fal.ai → crie uma conta
  2. Vá em: https://fal.ai/dashboard/keys
  3. Crie uma nova chave e cole aqui

Atenção: Antes de rodar, adicione créditos em fal.ai/dashboard/billing
Recomendamos $20 para começar (suficiente para ~60 vídeos de 5s)

API Key: [                                  ]
```

---

#### MÓDULO B — ALMA DA MARCA

> Este módulo é o mais importante.
> Se o cliente preencher de forma superficial, o sistema vai gerar conteúdo genérico.
> Oriente-o a responder com exemplos reais, não com o que "deveria" ser.

---

**B1 — Identidade Básica**

```
Nome da marca/projeto:
Handle do Instagram (@):
Nicho principal (seja específico — não "saúde", mas "saúde hormonal feminina"):
Sub-nicho (ainda mais específico):
Há quanto tempo está no ar essa conta:
Número atual de seguidores:
Taxa de engajamento média (se souber):
```

---

**B2 — O Produto**

```
Nome do produto ou serviço principal:

O que ele faz — descreva como se estivesse explicando para um amigo
(não para um investidor, não para um copywriter — para um amigo):


Formato de entrega (curso, consulta, protocolo, mentoria, DM, produto físico):

Preço (aproximado, para calibrar o peso do CTA):

Como o seguidor acessa — qual é o próximo passo após comentar:

Qual palavra ou frase você usa como CTA
(ex: "COMENTE FONTE", "COMENTE SIM", "COMENTE CURA"):
```

---

**B3 — O Público**

```
Descreva a pessoa que mais engaja no seu conteúdo hoje.
Não o público ideal teórico — a pessoa real que comenta, salva e compra.

Idade aproximada:
Gênero predominante:
O que ela faz da vida (profissão, rotina):

Qual é a MAIOR DOR que ela carrega relacionada ao seu nicho?
(Escreva em 1 frase, como ela diria para um terapeuta):


Qual é o MAIOR DESEJO que ela tem relacionado ao seu nicho?
(O sonho específico, não "ser feliz"):


O que ela TENTA mas não funciona?
(O que ela já comprou, já tentou, já pesquisou, e ainda não resolveu):


Como ela DESCREVE o problema para um amigo?
(Cole aqui literalmente a linguagem que ela usa — palavras reais, gírias, jeito de falar):
```

---

**B4 — O Inimigo**

O conteúdo que mais viraliza nomeia um culpado legítimo.
Não é uma pessoa. É um sistema, uma estrutura, uma crença institucionalizada.

```
Qual sistema, instituição ou estrutura manteve seu público preso nesse problema?
(Ex: "a indústria farmacêutica", "o sistema educacional financeiro", "a medicina convencional", "a religião dogmática"):


Existe algum fato, dado ou evento verificável que prova essa falha?
(Ex: "Em 1971, Nixon declarou guerra às drogas e criminalizou mais de 40 milhões de americanos por dependência química"):


Como você chama esse inimigo no seu conteúdo normalmente?
```

---

**B5 — As Praças de Conteúdo**

O sistema rotaciona entre 5 eixos temáticos para não ficar repetitivo.
Precisamos nomear esses 5 eixos no vocabulário do seu nicho.

```
Exemplo do sistema base (espiritualidade):
  MENTE / CORPO / SISTEMA / ESPÍRITO / ALAVANCA

Para o seu nicho, como seriam esses 5 pilares?
(Pode usar os mesmos, ou renomear para algo que faça sentido para seu público)

Pilar 1 (racional/mental):
Pilar 2 (físico/prático):
Pilar 3 (sistêmico/estrutural):
Pilar 4 (espiritual/profundo):
Pilar 5 (transformação/resultado):
```

---

**B6 — Voz da Marca**

```
Escolha 3 adjetivos que descrevem COMO você fala com seu público:
(não "profissional" — algo mais específico como "direta", "densa", "provocadora", "acolhedora")

1.
2.
3.

Cole aqui um exemplo de texto que VOCÊ escreveu e que mais orgulho te dá:
(Pode ser legenda de post, mensagem, texto de curso — o que importa é você ter escrito)



Cole aqui um texto de OUTRO CRIADOR que tem o tom que você quer:
(Link do post ou o texto em si)


O que você NUNCA diria no seu conteúdo?
(Frases, gírias, expressões que quebrariam sua identidade)


Sua comunicação é mais:
[ ] Técnica e científica (dados, pesquisas, evidências)
[ ] Espiritual e simbólica (metáforas, arquétipos, intuição)
[ ] Equilibrio entre as duas
[ ] Pessoal e narrativa (histórias reais, vulnerabilidade)
```

---

#### MÓDULO C — DNA VISUAL

---

**C1 — Referências Visuais**

```
Cole aqui 3 contas do Instagram cujo VISUAL você admira:
(Não precisa ser do mesmo nicho — o que importa é a estética)

1.
2.
3.

O que especificamente você admira nessas contas?
(Cor, densidade, tipo de imagem, atmosfera):
```

---

**C2 — Paleta e Identidade**

```
Você já tem uma identidade visual definida?
[ ] Sim  [ ] Não, vamos criar juntos

Se sim:
  Cores principais (hex ou descrição):
  Fontes que usa atualmente:
  Logotipo ou arquivo do watermark para os slides: [upload]

Qual palavra descreve a ATMOSFERA que você quer passar visualmente?
(ex: "sagrado", "científico", "sombrio", "luminoso", "minimalista", "denso"):

Estilo visual preferido para as imagens geradas por IA:
[ ] Gravura/Engraving (denso, linhas finas, estilo Doré)
[ ] Pintura a Óleo (Van Gogh, Caravaggio — textura e cor)
[ ] Fotorrealista Místico (parece foto real com elementos sobrenaturais)
[ ] Científico Cinematográfico (azul elétrico, teal, atmosfera fria)
[ ] Sagrado Luminoso (dourado, âmbar, celestial)
[ ] Não tenho preferência — confio na curadoria

Paleta emocional (escolha até 2):
[ ] Violeta/Roxo — mistério, espiritualidade, velamento
[ ] Dourado/Âmbar — revelação, divino, portal
[ ] Teal/Verde-Azul — ciência sagrada, frequência, mecanismo
[ ] Crimson/Vermelho — confronto, ruptura, indignação
[ ] Azul Índigo — cosmos, mente, profundidade
[ ] Verde Escuro — corpo, natureza, biologia, cura
```

---

#### MÓDULO D — CONTEXTO ESTRATÉGICO

```
Por que você está criando conteúdo agora?
(O que você quer que aconteça nos próximos 90 dias):


Qual é o maior obstáculo atual para crescer no Instagram?


Você já trabalhou com algum sistema de automação de conteúdo antes?
[ ] Sim — qual? _______________
[ ] Não

Você vai operar o sistema sozinho ou tem equipe?
[ ] Sozinho
[ ] Com equipe — quantas pessoas: ___

Com que frequência quer publicar?
[ ] 1x por dia
[ ] 2x por dia
[ ] 3x por dia (recomendado)
[ ] Outra:
```

---

## FASE 2 — TRANSPLANTE DE IDENTIDADE (Dias 2-3)

**Objetivo:** Reescrever os 6 arquivos de identidade do sistema com a alma do cliente.

Esta é a fase mais crítica. Não é uma troca de variáveis — é uma reescrita guiada pelas respostas do onboarding.

---

### MAPA DE TRANSPLANTE

Cada resposta do onboarding alimenta um ou mais arquivos do sistema:

| Resposta do Onboarding | Arquivo que muda | O que muda |
|------------------------|-----------------|-----------|
| B6 — Voz da marca | `agents/humanizer.md` | Identidade completa do Humanizer |
| B3 — Público + linguagem real | `agents/humanizer.md` | Exemplos de before/after |
| B4 — O Inimigo | `agents/oraculo-revisor.md` | Critério 3 (Raiva Coletiva) |
| B2 — Produto + CTA | `agents/oraculo-revisor.md` | Critério 4 (Comente X se...) |
| C1+C2 — Visual + paleta | `agents/visual-dna.md` | DNA visual completo |
| C1+C2 — Visual + estilo | `agents/canalizador-visual.md` | Parte 5 (cores por estado) |
| B5 — Praças | `core/agentes/planner.py` | PRACAS + rotação |
| B3 — Tom + público | `core/agentes/copywriter_reels.py` | SYSTEM_PROMPT |
| B3 — Tom + estética | `core/agentes/diretor_de_cena.py` | SYSTEM_PROMPT |
| C2 — Paleta + atmosfera | `core/agentes/diretor_artistico.py` | PRESET_ATMOSPHERE + SLIDE_ENERGY |
| A — Todos | `.env` | Todas as credenciais |
| Tudo | `CLAUDE.md` | Contexto operacional do projeto |

---

### CHECKLIST DE TRANSPLANTE

```
[ ] .env — Preencher com todas as credenciais do Módulo A
[ ] Testar OpenAI: python -c "from openai import OpenAI; print('OK')"
[ ] Testar Meta: curl com META_ACCESS_TOKEN → confirmar resposta 200

[ ] agents/humanizer.md
    - Reescrever seção "O que a voz É" com os 3 adjetivos do cliente (B6)
    - Reescrever seção "O que NÃO é" com anti-padrões do nicho
    - Criar 2 exemplos de before/after com linguagem REAL do público (B3)
    - Confirmar com cliente: "isso soa como você?"

[ ] agents/oraculo-revisor.md
    - Critério 3: reescrever inimigo com dados do cliente (B4)
    - Critério 4: reescrever "Comente [PALAVRA] se..." com dor específica (B3)
    - Exemplos: substituir exemplos de espiritualidade por exemplos do nicho

[ ] agents/visual-dna.md
    - Paleta: substituir violeta/teal/ouro pelas cores do cliente (C2)
    - Referências artísticas: substituir Doré/Grey pelo estilo do cliente (C1)
    - "O que NUNCA aparece": revisar com o cliente

[ ] agents/canalizador-visual.md
    - Parte 5 (tabela de cor × estado emocional): reconstruir com paleta do cliente
    - Parte 6 (referências por estado): substituir pelas referências do cliente

[ ] core/agentes/diretor_artistico.py
    - PRESET_ATMOSPHERE: reescrever para o estilo visual do cliente
    - SLIDE_ENERGY: recalibrar energia por estado emocional para o nicho
    - watermark: mudar para @conta_do_cliente

[ ] core/agentes/copywriter_reels.py
    - SYSTEM_PROMPT: reescrever com nicho, tom, vocabulário do cliente

[ ] core/agentes/diretor_de_cena.py
    - SYSTEM_PROMPT: reescrever com regras visuais do estilo do cliente

[ ] core/agentes/planner.py
    - PRACAS: substituir pelos 5 pilares do cliente (B5)

[ ] CLAUDE.md
    - Atualizar com: nome do projeto, nicho, produto, CTA, praças, handle
```

---

## FASE 3 — CALIBRAÇÃO (Dia 3)

**Objetivo:** Gerar o primeiro carrossel real e validar com o cliente antes de escalar.

---

### COMO RODAR A CALIBRAÇÃO

**Passo 1 — Escolher o tema de calibração**

Não use um tema difícil ou polêmico para o primeiro teste.
Use um tema que você já sabe que funciona para o nicho.

Critérios para tema de calibração:
- Relacionado à Praça mais forte do cliente
- Conectado à dor principal do público (B3)
- Sem risco de sensibilidade ou controvérsia
- Algo que o cliente consiga avaliar facilmente

**Passo 2 — Rodar geração**

```bash
# Criar o arquivo do carrossel
# python carrossel-[slug-do-tema].py
```

**Passo 3 — Enviar para aprovação**

Enviar os 10 slides como PDF ou imagens para o cliente avaliar com base em:

```
ROTEIRO DE FEEDBACK (enviar ao cliente junto com os slides)

Para cada slide, me diga:
1. O texto soa como VOCÊ falaria? (sim/não + sugestão se não)
2. A imagem combina com o tema do slide? (sim/não)
3. A estética geral parece com a sua marca? (sim/não + o que mudaria)

Para o conjunto:
4. O arco emocional te emocionou ou ativou algo? (sim/não)
5. O CTA do último slide te faria comentar? (sim/não + por quê)
6. Alguém que você conhece publicaria isso na conta deles?
```

**Passo 4 — Ajustes**

Com base no feedback:

| Feedback | Onde ajustar |
|---------|-------------|
| "Texto não soa como eu" | `agents/humanizer.md` — refinar voz |
| "Imagem muito genérica" | `agents/visual-dna.md` + `diretor_artistico.py` |
| "Paleta não combina" | `agents/canalizador-visual.md` + preset |
| "CTA fraco" | `agents/oraculo-revisor.md` Critério 4 |
| "Arco não convenceu" | `agents/oraculo-revisor.md` Critério 2 |

**Máximo 2 rodadas de ajuste.** Se na segunda ainda não estiver aprovado, agendar call de 30min com o cliente para entender o que ele imagina na cabeça versus o que está saindo.

---

## FASE 4 — INFRAESTRUTURA TÉCNICA (Dia 3-4)

**Objetivo:** Setup completo do ambiente de produção.

---

### CHECKLIST DE SETUP

**Ambiente**
```
[ ] Python 3.10+ instalado
[ ] Node.js 18+ instalado
[ ] pip install -r requirements.txt
[ ] npm install (na pasta dashboard/)
[ ] .env preenchido e testado
```

**APIs — Teste de Conexão**
```
[ ] OpenAI: python scripts/test_openai.py
[ ] Meta: python scripts/test_meta.py
[ ] ImgBB: python scripts/test_imgbb.py
[ ] ElevenLabs (se Reels): python scripts/test_elevenlabs.py
[ ] fal.ai (se Reels): python scripts/test_falai.py
```

**Dashboard**
```
[ ] node dashboard/server.js → http://localhost:3131
[ ] Dashboard abre sem erro
[ ] Aba "Carrosséis" aparece vazia (nenhum ainda)
[ ] Aba "Oráculo" aparece (pode estar vazia)
```

**Publicação — Teste Completo**
```
[ ] Gerar 1 carrossel completo (10 slides)
[ ] Confirmar slides salvos em Desktop/carrossel-[slug]/
[ ] Abrir dashboard → carrossel aparece na lista
[ ] Clicar em "INSTAGRAM" → confirmar que publicação inicia
[ ] Confirmar que ImgBB recebeu as imagens (verificar no painel ImgBB)
[ ] Confirmar que Meta API criou os containers (sem erro 400)
[ ] Confirmar publicação no Instagram
[ ] Post visível no perfil: SIM/NÃO
```

**Se a publicação falhar:**
```
Erro 400 da Meta API → Token sem permissões corretas (rever Fase 1 — A2)
Erro ImgBB → Chave errada ou imagem > 32MB
Erro "FINISHED not reached" → Aguardar mais tempo (pode demorar até 5min)
Post não aparece → Verificar se conta está em modo profissional
```

---

## FASE 5 — VOLUME INICIAL (Dias 4-5)

**Objetivo:** Entregar o cliente pronto para operar na primeira semana.

---

### O QUE PRECISA ESTAR PRONTO NA ENTREGA

**5 carrosséis prontos, 1 por Praça:**
```
[ ] Praça 1 — [tema definido com cliente]
[ ] Praça 2 — [tema definido com cliente]
[ ] Praça 3 — [tema definido com cliente]
[ ] Praça 4 — [tema definido com cliente]
[ ] Praça 5 — [tema definido com cliente]
```

**Grade editorial da semana 1:**
```
[ ] python core/agentes/planner.py --dry-run
[ ] Revisar com cliente
[ ] Criar no Notion (se incluso no escopo)
```

**Se o escopo incluir Reels:**
```
[ ] 1 Reel completo gerado (7 cenas × voz + sfx + vídeo)
[ ] Arquivos organizados em campanhas/reels/[nome]/cena_XX/
[ ] Trilha de fundo gerada
[ ] Arquivos disponibilizados para montagem final
```

---

## FASE 6 — ENTREGA (Dias 5-7)

**Objetivo:** O cliente sai capaz de operar sozinho.

---

### PACOTE DE ENTREGA

**Documentação**
```
[ ] README-[CLIENTE].md com:
    - Como rodar o dashboard
    - Como gerar um novo carrossel
    - Como publicar pelo dashboard
    - Onde ficam os arquivos
    - O que cada pasta significa
    - Contato de suporte

[ ] Documento das Praças e Temas:
    - As 5 praças com definição
    - 5 temas por praça (25 temas no total — para os próximos meses)
```

**Vídeos de operação** *(gravações de tela, 5-10min cada)*
```
[ ] Vídeo 1: "Como gerar um carrossel do zero"
[ ] Vídeo 2: "Como usar o dashboard e publicar"
[ ] Vídeo 3: "Como calibrar a qualidade do conteúdo"
[ ] Vídeo 4: "Como gerar um Reel" *(se escopo inclui Reels)*
```

**Acesso ao repositório**
```
[ ] GitHub privado criado para o cliente
[ ] Cliente adicionado como colaborador
[ ] Último commit com tudo funcionando
[ ] .env.example atualizado (sem valores reais)
```

**Canal de suporte**
```
[ ] WhatsApp Business ou Slack criado
[ ] SLA definido (ex: respostas em até 24h úteis)
[ ] Primeiras 2 semanas: suporte prioritário
```

---

### SESSÃO DE HANDOVER (1h ao vivo)

Roteiro da sessão:

```
0:00 — Apresentar o que foi construído (5min)
0:05 — Mostrar o dashboard ao vivo
0:10 — Gerar 1 carrossel AO VIVO na frente do cliente (15min)
0:25 — Publicar 1 carrossel AO VIVO (10min)
0:35 — Mostrar os vídeos de documentação
0:45 — Perguntas abertas (15min)
1:00 — Encerramento + próximos passos
```

---

## DOCUMENTO DE ENTREGA — TEMPLATE README DO CLIENTE

*(Criar este arquivo como `README-[CLIENTE].md` no repositório)*

```markdown
# Oráculo de Conteúdo — [Nome do Cliente]

## Como rodar o dashboard
```
cd [pasta-do-projeto]
node dashboard/server.js
```
Acesse: http://localhost:3131

## Como gerar um carrossel
```
python carrossel-[tema].py
```
Os slides são salvos em: Desktop/carrossel-[tema]/

## Como publicar
1. Abra o dashboard
2. Clique no carrossel que quer publicar
3. Clique em "INSTAGRAM"
4. Aguarde a confirmação

## Suas Praças de Conteúdo
- [Praça 1]: [definição]
- [Praça 2]: [definição]
- [Praça 3]: [definição]
- [Praça 4]: [definição]
- [Praça 5]: [definição]

## Palavra-chave do CTA
COMENTE [PALAVRA] nos posts

## Suporte
WhatsApp: [número]
Horário: segunda a sexta, 9h–18h
SLA: respostas em até 24h úteis
```

---

## O QUE TORNA ESSE PROCESSO INTELIGENTE

### Inteligência 1 — O onboarding coleta exatamente o que o sistema precisa

Cada campo do formulário tem um destino direto em um arquivo do sistema.
Não existe pergunta sem uso. Não existe campo "para ficar bonito".

### Inteligência 2 — A identidade fica no código, não na memória

As respostas do onboarding não ficam em um documento separado.
Elas são transplantadas diretamente nos agentes de IA.
Isso significa que cada vez que o sistema rodar, ele já "sabe" quem é o cliente.

### Inteligência 3 — A calibração é o controle de qualidade

O primeiro carrossel não vai para o ar. Ele vai para aprovação.
O feedback estruturado aponta exatamente qual arquivo ajustar.
Isso elimina iterações por adivinhação.

### Inteligência 4 — Separação entre alma e motor

O motor (código) é o mesmo para todos os clientes.
A alma (arquivos de identidade) é única por cliente.
Isso significa que uma melhoria no motor beneficia todos os clientes simultaneamente.
E uma customização de identidade nunca quebra o motor.

### Inteligência 5 — Entrega com autonomia

O cliente não depende de você para operar o sistema no dia a dia.
Ele depende de você para:
- Evoluções do sistema
- Calibrações de qualidade
- Novos formatos (quando lançar)
- Suporte técnico

Isso define um modelo de receita recorrente sem dependência operacional diária.

---

## TEMPO E ESFORÇO ESTIMADO

| Fase | Tempo do Engenheiro | Tempo do Cliente | Bloqueia quem? |
|------|--------------------|--------------------|----------------|
| Pré-venda | 1h | 30min | Cliente (qualificação) |
| Onboarding | 2h | 3-4h (formulário) | Cliente (formulário) |
| Transplante | 4-6h | 0 | Engenheiro |
| Calibração | 2h | 1h (feedback) | Cliente (aprovação) |
| Infraestrutura | 2h | 0 | Engenheiro |
| Volume inicial | 3h | 1h (aprovação temas) | Compartilhado |
| Entrega | 2h | 1h (handover) | Engenheiro |
| **TOTAL** | **16-18h** | **6-7h** | |

---

## POSSÍVEIS BLOQUEADORES E COMO RESOLVER

| Bloqueador | Causa | Solução |
|-----------|-------|---------|
| Cliente não tem System User Token | Gerou token de usuário comum | Guiar via call de 30min no Meta Business |
| Conta do Instagram não é profissional | Conta pessoal | Converter para profissional (Settings → Account) |
| ImgBB retorna erro de limite | Imagens muito grandes | Reduzir qualidade no compose_util (quality=85) |
| Meta API retorna 400 | Permissões faltando no token | Regenerar token com permissões corretas |
| Cliente aprova mas o conteúdo não engaja | Identidade mal transplantada | Revisitar B3 (público) e B6 (voz) — muitas vezes o problema está na dor mal identificada |
| fal.ai sem créditos durante geração de Reel | Saldo zerou no meio | Adicionar créditos antes, verificar custo por vídeo |
| Sistema gera conteúdo genérico | Onboarding superficial | Agendar call para aprofundar B3 e B4 |

---

*Playbook criado em Maio/2026 — Nano Banana Engenharia de Sistemas e Processos*
