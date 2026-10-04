# Plano: Curadoria de Imagens (Pinterest) para o Oráculo da Bella

Status: plano de arquitetura, nada implementado. Data: 2026-10-04.
Decisão do dono do projeto: usar o Pinterest como fonte de imagens finais para capa e miolo, aceitando o risco (autorização explícita em 2026-10-04). Objetivo de negócio: reduzir o custo por imagem (hoje cada foto gerada custa uma chamada de `gpt-image`, ~US$0,04–0,19) e subir o nível de design com imagens simbólicas, emocionais e com espaço limpo para a tipografia.

## 1. O que já existe e deve ser reaproveitado

| Peça | Onde | Uso neste plano |
|---|---|---|
| Biblioteca de imagens (tabela, upload, galeria, B2/MinIO) | `backend/dashboard/db.js` (`library_images`), `dashboard/routes/library/*` | Vira o banco de imagens curadas. Estender, não recriar. |
| Checkpoint de foto bruta | `core/criador_pipeline.py` `fetch_image_for_slide`: se `raw-NN.jpg` existe, não gera | Ponto de entrada da imagem curada, sem gerar. |
| Motor tipográfico, detecção de lado calmo e sombra local | `core/util/composer/bella_type_engine.py` (`_calm_side`, `_edge_energy`, `_text_ink`) | Reaproveitar para medir espaço limpo de cada candidata. |
| Referências visuais (JSON) | `agents/visual-references/*`, `visualReferenceService.js`, `core/util/visual_reference_registry.py` | Vocabulário visual e antipadrões; a curadoria usa como régua de gosto. |
| Estado emocional, tipo de gancho, gatilhos | `forja-ganchos-bella.md`, `forgeHooks` em `editorialOrchestrator.js` | A emoção do gancho é a chave da busca. |
| "Sem imagem" por preset | `deck_director._apply_no_image` | Decide quais lâminas precisam de foto; a curadoria só atende essas. |
| Playwright já instalado | `backend/node_modules/playwright`, pacote Python `playwright` | Base técnica do coletor. |
| Fila e worker | `dashboard/services/carouselQueueWorker.js` | Jobs de coleta assíncronos seguem o mesmo padrão. |

## 2. Visão geral da arquitetura

```
Oráculo (copy + estado emocional + brief de imagem por lâmina)
        |
        v
Curador de Imagens ──► 1) Biblioteca (busca semântica + filtros)  ──┐
        |                                                          |
        |  se faltar candidata boa (nota < limiar)                 |
        v                                                          |
Planejador de consultas (LLM) ──► Coletor (provedor plugável) ──► Ingestão ──► Análise ──► Biblioteca
                                                                                           |
                                          Ranking + escolha (auto ou aprovação na UI) ◄────┘
                                                      |
                                                      v
                              raw-NN.jpg  ──► criador_pipeline.py ──► motor tipográfico ──► slide
                                                      |
                              (sem candidata aprovada) └──► geração por IA (fallback atual)
```

Cadeia de fallback por lâmina com foto: Biblioteca → coleta no Pinterest → geração por IA. Modo configurável (ver 8).

## 3. Camadas

### 3.1 Coleta (provedor plugável)
Interface única `PinterestProvider.search(query, {limit, cursor}) -> PinCandidate[]`.
`PinCandidate`: `pin_id, pin_url, image_url_original, image_url_small, width, height, title, description, board_name, source_link (link original do pin), fetched_at`.

Implementações (Fase 0 decide a principal):
1. **PlaywrightProvider**: navegador automatizado com sessão logada de uma conta Pinterest DEDICADA (não a conta oficial da Isabella). Abre `search/pins/?q=...`, rola, extrai os dados que a própria página carrega (ID, tamanhos de imagem, título). Rodar em ritmo baixo, com limite de consultas por hora e por dia.
2. **ApiProvider (serviço terceiro de raspagem)**: Apify, SerpApi, Bright Data ou similar. Avaliar preço por mil resultados, taxa de sucesso e se devolvem a URL do tamanho original. Mais estável e tira o risco da conta própria; custa por consulta.
3. **ExtensionIngest**: extensão de navegador "Salvar na Bella": o usuário navega no Pinterest como no print e clica; a extensão envia pin e URL da imagem ao backend. Sempre funciona, serve de plano B e de fonte de alta qualidade manual.

Regras do coletor: se aparecer CAPTCHA, muro de login ou bloqueio, o job para e avisa na tela; o sistema NÃO tenta resolver nem contornar. Respeitar limites de ritmo, deduplicar por `pin_id`, registrar cada consulta e o resultado.

Fase 0 precisa confirmar com testes reais: (a) se a URL do tamanho original (`originals`) está disponível na maioria dos pins e qual a resolução real; (b) taxa de sucesso e tempo por consulta; (c) se a conta dedicada sobrevive a uso normal por alguns dias.

### 3.2 Planejador de consultas (agente novo `curador-imagens-bella.md`)
Entrada: estado emocional, tema, gancho, `visual_world`, papel da lâmina (capa, miolo, fechamento), `text_side`, paleta do carrossel.
Saída (JSON): 6 a 10 consultas variadas em português e inglês + termos negativos.
- Vocabulário visual da emoção (ver mapa em 4), estética ("surreal minimal", "silhouette vast landscape", "moody analog photography", "symbolic collage"), espaço ("negative space", "empty sky", "copy space").
- Negativos aplicados no filtro: citação em imagem, infográfico, texto grande, marca d'água, "quote", "aesthetic quotes", moldura de rede social.
- Uma consulta por ângulo: metáfora, ambiente, gesto, matéria/textura.

### 3.3 Ingestão (determinística e barata, antes de qualquer IA)
Em Python (`core/curadoria/analyze.py`, PIL, sem custo de API):
- baixar o original, medir largura/altura; descartar abaixo do mínimo útil (largura ≥ 1080 após o recorte 4:5, ou ≥ 1024 com upscale opcional);
- hash perceptual (dHash) para deduplicar contra a biblioteca e contra imagens já usadas;
- paleta dominante (5 cores em hex) e distância até a paleta Bella (terracota, musgo, cacau, areia, creme);
- mapa de espaço limpo por região (reutilizando `_edge_energy`): % de calma à esquerda, direita, topo, base, e qual lado serve ao texto;
- recorte 4:5 com foco calculado.

### 3.4 Análise por visão (só nas top-K, ~12 por consulta)
Um modelo de visão em baixo detalhe devolve JSON por imagem:
`emocao_principal, emocoes_secundarias[], estados_que_evoca[], meio (fotografia|pintura|ilustração|colagem|arte digital|IA provável), sujeito, posicao_do_sujeito, rosto_identificavel (sim|não|silhueta), tem_texto, tem_marca_dagua, qualidade_estetica (0-10), adequacao_bella (0-10), descricao_curta (1 frase, em português), tags[]`.
Descartes automáticos: texto sobrepondo, marca d'água, mosaico de várias imagens, captura de tela.

Regra de direito de imagem: pessoas com rosto identificável perdem pontos fortes e só passam com aprovação humana; preferir costas, silhueta, mãos, paisagem.

### 3.5 Biblioteca (estender `library_images`)
Colunas novas: `source` (`upload|pinterest|ia|stock`), `source_url`, `pin_id`, `phash`, `license_status` (`desconhecida|própria|licenciada`), `risk_flag`, `emotion_tags JSONB`, `palette JSONB`, `negative_space JSONB`, `analysis JSONB`, `embedding JSONB`, `status` (`candidata|aprovada|rejeitada|arquivada`), `used_in JSONB` (carrosséis e lâminas), `last_used_at`.
Embeddings: gerar embedding de texto (`descricao_curta` + tags) e fazer busca por similaridade de cosseno no Node; volume esperado é de milhares, não precisa de banco vetorial.

### 3.6 Curador no pipeline
Novo serviço Node (`dashboard/services/imageCurator.js`), chamado depois de a copy estar pronta e antes do job de geração:
1. Para cada lâmina com foto (após `_apply_no_image`), monta o **brief de imagem**: estado emocional, o que mostrar, lado do texto, paleta, formato, o que evitar.
2. Busca na biblioteca (filtros duros: não usada recentemente, `text_side` compatível, rosto ok; ordenação por similaridade com o brief).
3. Se não houver candidata com nota ≥ limiar, enfileira a coleta (planejador → provedor → ingestão → análise) e espera com timeout.
4. Ranqueia e escolhe. Modo automático escolhe a melhor; modo aprovação mostra 3 por lâmina.
5. Escreve a imagem escolhida em `raw-NN.jpg` (já recortada em 4:5) dentro da pasta do carrossel, ou passa `curated_image_path` no payload da lâmina.
6. Registra em `used_in` e marca como usada para nunca repetir entre lâminas nem entre carrosséis.
7. Sem candidata aprovada: o pipeline cai na geração por IA como hoje.

Mudança pequena no Python: em `fetch_image_for_slide`, antes de gerar, aceitar `slide["curated_image_path"]` (ler os bytes e devolver). O checkpoint `raw-NN.jpg` já cobre o caso simples.

### 3.7 Composição
O motor tipográfico já recebe qualquer foto. Ajustes: aplicar correção de tom leve (quente, grão) para harmonizar imagens de origens diferentes dentro do mesmo carrossel; sombra local de leitura já existe; garantir contraste entre lâminas consecutivas (alternar claras e escuras, com e sem figura). Upscale opcional (Real-ESRGAN ou serviço) só quando a largura útil ficar entre 700 e 1080 px.

### 3.8 UI
- Criador: painel "Imagens sugeridas" por lâmina com foto: 3 miniaturas, nota, origem, botões Escolher, Buscar mais, Gerar com IA, Sem imagem. Ver custo estimado e economia.
- Biblioteca: filtros por origem, emoção, paleta, status e risco; aprovar/rejeitar em lote; ver onde cada imagem foi usada.
- Configurações: modo de imagem (8), limites de coleta por hora/dia, escolha do provedor, chaves.

### 3.9 Aprendizado e governança
- Cada escolha, troca e rejeição vira sinal: ajusta pesos por emoção, guarda consultas que funcionaram, alimenta uma lista de bloqueio (imagem, autor, domínio).
- Registro de procedência em toda imagem (pin, link original, data, quem aprovou).
- **Botão de retirada**: dado um `pin_id` ou imagem, lista todos os carrosséis em que foi usada e permite trocar por outra candidata ou por geração em um clique. Serve para atender uma notificação de direitos sem refazer o conteúdo à mão.
- Selo visível "origem: Pinterest, licença desconhecida" na biblioteca, para ninguém esquecer o status.

## 4. Mapa emocional → vocabulário visual (arquivo a criar: `agents/visual-references/emotion-visual-map.json`)
Um registro por estado (começar com 12): medo de incomodar, vergonha de querer, solidão dentro da utilidade, culpa de descansar, cansaço de ser a forte, raiva engolida, medo de decepcionar, invisibilidade, saudade de si, alívio proibido, culpa de crescer, vergonha de cobrar.
Exemplo de campos: `consultas_en[]`, `consultas_pt[]`, `sujeito`, `luz`, `paleta`, `espaco`, `gesto`, `evitar[]`, `tipo_de_capa` (figura pequena em vasto espaço, silhueta luminosa, objeto simbólico, colagem).
Exemplo: *solidão dentro da utilidade*: figura pequena num espaço enorme, luz fria, objeto de cuidado largado, céu vazio.

## 5. Contratos novos nos prompts
- `oraculo-v2.md`: cada lâmina com foto emite `imagem_ideal` (o que a imagem mostra, estado emocional, `text_side`, o que evitar) em `DIREÇÃO_JSON`. Hoje existe `visual_plan`; estender, sem quebrar.
- `curador-imagens-bella.md` (novo): planejador de consultas e rubrica de ranking (nota ponderada: emoção 35%, espaço limpo 25%, estética 20%, Bella 10%, qualidade técnica 10%; rosto identificável e texto na imagem eliminam).
- `diretor-artistico-bella-v2.md`: o mesmo brief serve de prompt de geração quando o fallback entrar.

## 6. Dados e endpoints (sugestão)
- `POST /api/curadoria/buscar` (brief → candidatas), `GET /api/curadoria/lamina/:carouselId/:num`, `POST /api/curadoria/aprovar`, `POST /api/curadoria/rejeitar`, `POST /api/curadoria/retirar` (pin_id), `POST /api/curadoria/coletar` (consulta manual), `GET /api/curadoria/uso/:imageId`.
- Jobs de coleta e análise na mesma fila do worker, com status visível na tela e timeout curto (30–90 s por lâmina) para não travar a geração.

## 7. Fases e critérios de aceite

**Fase 0 — Viabilidade (1 a 2 dias).** Prova de conceito: uma consulta → 40 pins com originais baixados → análise. Medir resolução, taxa de sucesso, tempo e comportamento da conta. Decidir provedor principal. Critério: ≥ 60% dos pins com largura útil ≥ 1080 e coleta repetível por 3 dias sem bloqueio.

**Fase 1 — Biblioteca inteligente (2 a 3 dias).** Colunas novas, upload e ingestão por URL ou extensão, análise por visão, busca por emoção na tela da Biblioteca, aprovação/rejeição. Critério: subir 50 imagens e achar as 3 certas para "solidão dentro da utilidade" em segundos.

**Fase 2 — Curador no pipeline (3 a 5 dias).** Planejador, provedor, ranking, escrita de `raw-NN.jpg`, painel "Imagens sugeridas", modo automático e aprovação. Critério: carrossel de 5 lâminas com 2 fotos curadas gerado sem chamar `gpt-image`, sem imagem repetida e com texto legível.

**Fase 3 — Aprendizado e governança (2 a 3 dias).** Pesos por emoção, lista de bloqueio, botão de retirada, painel de custo e economia. Critério: retirar uma imagem de todos os carrosséis em um clique.

**Fase 4 — Extras.** Extensão "Salvar na Bella" polida, upscale, segundo provedor, fontes licenciadas (Unsplash, Pexels, museus) como fallback com licença garantida.

## 8. Modos de imagem (configuração do preset)
- **Economia:** biblioteca → coleta → IA só se faltar. Capa e miolo.
- **Híbrido:** capa por IA original (assinatura visual própria), miolo curado.
- **IA:** como hoje.
O controle "Sem imagem" continua valendo e tem prioridade sobre qualquer modo.

## 9. Custos (estimar na Fase 0)
- Geração atual: ~US$0,04–0,19 por imagem.
- Curadoria: visão em baixo detalhe só nas top-K (~12 candidatas) custa uma fração de centavo por imagem; a biblioteca amortiza (cada imagem aprovada serve a vários carrosséis). Pré-filtro determinístico evita gastar visão em lixo.
- Provedor terceiro: custo por mil resultados; comparar com o risco e o esforço de manter o coletor próprio.
Meta: custo médio por foto curada < 25% do custo por foto gerada, após a biblioteca ter volume.

## 10. Riscos e mitigações (enxutos)
- **Conta bloqueada ou coletor quebrando:** conta dedicada, ritmo baixo, provedor plugável, extensão como plano B, parada imediata em CAPTCHA.
- **Direitos autorais:** aceito pelo dono; mitigado por procedência registrada, botão de retirada e fallback licenciado/IA. Sem redistribuir a biblioteca fora do sistema.
- **Direito de imagem (pessoas):** rosto identificável rebaixado e sujeito a aprovação humana.
- **Qualidade:** descartar baixa resolução; upscale só em faixa estreita; harmonização de tom.
- **Imagens de IA de terceiros:** marcar `IA provável` e dar prioridade a outras origens; autoria e licença incertas.
- **Repetição:** hash perceptual, `used_in`, bloqueio por carrossel e por janela de tempo.

## 11. Decisões ainda abertas
1. Provedor principal (Fase 0 decide: Playwright próprio vs serviço terceiro).
2. Modo padrão (Economia ou Híbrido) e se a capa continua por IA.
3. Aprovação humana por padrão ou automático com revisão posterior.
4. Quem cria e mantém a conta dedicada do Pinterest.

## 12. Resultado da Fase 0 (executada em 2026-10-04)

Código criado: `core/curadoria/pinterest_playwright.py` (coletor), `core/curadoria/vision_rank.py` (ranking por visão). Dados do teste em `storage/curadoria/spike/` (fora do git). Zonas de texto `topo` e `base` adicionadas ao motor tipográfico (`text_zone` no `visual_plan`).

- **Coleta anônima (sem login):** ~23 a 25 pins por consulta; o muro de login aparece logo e o coletor para, como projetado. Seis consultas deram 144 pins únicos. Anônimo não traz título, domínio nem link de origem (procedência incompleta).
- **Originais:** a URL `originals` existe e funciona. Mediana de 1080 px de largura (até 4284); 50 de 75 candidatas pré-filtradas com largura real ≥ 1080. Alguns originais vêm em **HEIC** (Pillow não abre): usar a versão JPG pequena como alternativa ou adicionar `pillow-heif`.
- **Qualidade depende da consulta:** a busca genérica "spiritual aesthetic" devolve clichês (mapa de chakra, lótus, Buda, Om, meme com texto). Consultas refinadas ("silhouette sun halo minimal surreal", "lone figure glowing light vast space", "god aesthetic", "universe aesthetic") trouxeram a estética certa. O planejador de consultas (3.2) é essencial.
- **Ranking por visão:** 75 imagens em 97 s, ~28 mil tokens de entrada e ~7,6 mil de saída (centavos). 16 eliminadas (texto, rosto identificável, pose de ioga, marca d'água); as 12 melhores bateram com a referência da Bella (silhueta, halo, espaço vazio, terracota).
- **Meio predominante:** quase tudo é arte digital/IA de terceiros. A autoria e a licença seguem incertas (risco aceito pelo dono).
- **Para escalar:** sessão logada de conta dedicada (o usuário faz o login uma vez num perfil persistente do Playwright, sem passar senha ao sistema) ou provedor terceiro. Decidir na próxima etapa.
