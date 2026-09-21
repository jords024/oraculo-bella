# 🔖 Registro de Evolução: Projeto Fonte Oculta
**Data de Atualização:** 16 de Setembro de 2026

Este arquivo serve como ponte de comunicação de estado do projeto.

---

## Sessão de 16/09/2026 — Bella: correção do gargalo de profundidade na ideação

> Entre 31/08 e 16/09 o usuário, com ajuda de outro modelo (GPT), reescreveu boa parte do pipeline da Bella (ver seção "O que mudou entre sessões" logo abaixo). Esta sessão começou com uma auditoria dessas mudanças, depois validou e corrigiu um diagnóstico específico feito pelo GPT sobre por que os temas gerados estavam "genéricos".

### O que mudou entre 31/08 e 16/09 (feito por outra sessão/modelo, mapeado aqui pela primeira vez)

O chat "Criador" deixou de ser uma chamada única de prompt. Agora é um pipeline real de 4-5 estágios em `backend/dashboard/services/editorialOrchestrator.js`, usando a Responses API da OpenAI (`reasoning.effort`): **Ideação** (Big Idea Lab, 12 hipóteses) → **Estratégia** (Big Idea + arco) → **Pesquisa** opcional (com busca web) + **Verificação de Fatos** → **Escrita** → **Revisão**. Novos agentes: `pesquisador-bella.md`, `verificador-fatos-bella.md`. Agentes de escrita completamente reescritos com filosofia consistente (`criador.md`, `AG03/04/05-*.md`): 8 arquiteturas narrativas alternativas em vez de estrutura fixa, proibição de sintoma corporal automático (mandíbula/peito/garganta), auditoria de originalidade obrigatória. Novo motor de composição leve `bella_essential_engine.py` (formato de 5 lâminas). Biblioteca de referências visuais da sessão de 31/08 foi operacionalizada em código (`visual_reference_registry.py` + `visualReferenceService.js`). Chat ganhou histórico persistente por usuário (tabela `creator_chats`, `creatorChats.js`) e painel de atividade dos agentes em tempo real (`AgentActivityPanel.jsx`).

### O bug: a inteligência mais rica nunca participava da criação do tema

**Sintoma:** temas gerados eram genéricos ("autossuficiência afetiva", "medo de envelhecer") — categorias de autoajuda que poderiam vir de qualquer conta, não algo que só a Bella poderia dizer.

**Causa raiz confirmada linha por linha em `editorialOrchestrator.js`:**
1. `runBigIdeaLab` (ideação) e o primeiro estágio de `runEditorialOrchestration` (estratégia) usavam `prompts.strategist || prompts.master` — como `strategist` (`oraculo-v2.md`) sempre existia, o `master` (`criador.md`, reescrito e muito mais rico) **nunca era consultado nessas duas etapas**. Só entrava depois, na escrita — quando o tema já tinha nascido raso.
2. `oraculo-v2.md` era um esqueleto de 5 linhas fixas ("Disrupção → Espelhamento → Nomeação → Integração → Portal"), inclusive mandando abrir com "cena somática real" — contradizendo a regra nova anti-corpo-automático do resto do sistema.
3. `oraculo-revisor.md` (usado como `prompts.reviewer`, a última camada de qualidade) pertence à HauCacau — fala de cortisol, teobromina, chocolate, ritual de cozinha. A auditoria final da Bella estava sendo feita com critérios de outro cliente.

**Correção:**
- `editorialOrchestrator.js`: trocado `||` por concatenação (`master` + `strategist` juntos) nas duas etapas afetadas.
- `oraculo-v2.md`: reescrito do zero como metodologia de **descoberta de tema** (não de escrita — isso continua sendo do `criador.md`). Núcleo: um tema só é válido se conectar a um dos 5 pilares específicos de `biblia-comunicacao-bella.md` (vergonha de saber-e-não-integrar, espiritualidade como fuga, indústria que lucra da busca, integração como produto não nomeado, T.A.F.A como mapa autobiográfico) e responder 12 perguntas obrigatórias (cena humana → confissão silenciosa → acordo invisível → ... → "por que só a Bella"). Teste de descarte: se o tema funcionar trocando "Isabella Dalcin" por qualquer outra criadora, está reprovado.
- **Novo arquivo `oraculo-revisor-bella.md`** — reviewer exclusivo, baseado no scorecard /15 que já existia em `AG08-guardiao-bella.md` (não modifiquei `oraculo-revisor.md`, que pode estar em uso por outro cliente/pipeline — só desviei a referência da Bella em `carouselsGenerate.js` para o arquivo novo).
- Reforço de **linguagem popular**: título e gancho precisam ser lidos em voz alta sem travar (frase curta, palavra comum, cena concreta) — a profundidade fica nos campos de raciocínio interno, não no vocabulário do título. Adicionado em `oraculo-v2.md` e reforçado na instrução hardcoded de `runBigIdeaLab`.

**Validado com chamada real à API (duas rodadas, custo ~$0,02 cada):** título de exemplo foi de "A mulher forte também precisa receber" para "Você marcou outro retiro" / "Você chamou de energia densa" — curto, popular, e ancorado num pilar específico da Bella, não uma categoria genérica de autoajuda.

**Referência usada para calibrar o "popular" sem copiar a manipulação:** o usuário trouxe um prompt de outro nicho (chamado internamente de "Andrieli") com fórmula agressiva de viralização (estatísticas inventadas, urgência fabricada, cota de "palavras viscerais", astrologia como gancho disfarçado). Deliberadamente **não** foi importado nada disso — contraria regras já estabelecidas da Bella (proibição de números inventados, proibição de urgência/escassez, arquétipo Iniciadora/Sábia sem hype). Só foi extraída a lição válida: frases curtas e concretas no título/gancho, sem abrir mão da profundidade nos bastidores.

**Se o tema voltar a sair genérico:** primeiro confirme se `editorialOrchestrator.js` ainda concatena `master`+`strategist` (não usa `||`) nas linhas de `runBigIdeaLab` e do estágio `strategy`. Segundo, confirme que `oraculo-v2.md` ainda tem a seção dos 5 pilares e das 12 perguntas — não deixe alguém reduzir de novo a um esqueleto de estados fixos.

### Continuação no mesmo dia — "espelho direto" e frase de espalhamento

Depois da correção acima, o usuário apontou que a ESCRITA (não mais o tema) ainda tinha um problema específico: a "cena humana" do tema estava sendo narrada literalmente no corpo do slide ("Você salva um método, refaz a rotina, marca a próxima aula") — uma cena inventada e específica demais, que soa genérica quando não acerta a vida real de quem lê.

**Correção — "Espelho direto, não cena adivinhada"** (`criador.md`, `copywriter.md`, `gancho-viral.md`, e ajuste na pergunta 1 do `oraculo-v2.md`): nomear o padrão/contradição internamente, direto, como o Andrieli faz ("Você diz que não quer X, mas continua escolhendo X") — nunca narrar uma cena externa específica tentando adivinhar a rotina literal da leitora. A cena humana do tema é só material de raciocínio interno.

**Achado técnico à parte, corrigido de brinde:** nenhum prompt ao vivo (`criador.md`, `copywriter.md`) listava o enum real de `layout:` (`bella_essential_01..05`, `bella_sequence_01..10`, `fullbleed`, etc.) — o modelo inventava nomes descritivos em português ("pôster fotográfico assimétrico"), que o parser do frontend descarta silenciosamente, colapsando toda lâmina pro layout padrão. Adicionada a lista exata de valores válidos em `criador.md` e `oraculo-revisor-bella.md`.

**Terceira rodada — mais uma versão do prompt "Andrieli", mais detalhada:** trouxe impressão digital de voz, mapeamento de bolhas, e a exigência de uma "frase de espalhamento" (linha que funciona sozinha, print-ável). Adotado: **frase de espalhamento obrigatória** (nova seção em `criador.md`, checada no critério 1 do `oraculo-revisor-bella.md`), **teste do comentário previsto** (prever o comentário genuíno da leitora antes de finalizar), cadência mais seca (uma ideia por frase), e a reformulação mais nítida de "confronte o padrão, nunca a pessoa" (já era o espírito da Bella, só ficou mais afiado). Rejeitado deliberadamente: cota de 15 gatilhos/35 palavras viscerais (reintroduz escrever-por-checklist), "bolha de conflito" pra provocar discordância de propósito (contraria o arquétipo calmo da Bella), estatística inventada/urgência/CTA em 3 preços por temperatura (já proibido), estrutura fixa de 11 slides com função travada por posição (já removida de propósito).

**Validado com chamada real à API:** roteiro sobre "vergonha de repetir padrão mesmo já tendo feito terapia" — verificar se surgiu naturalmente uma linha "print-ável" e se o confronto nomeou o padrão, não a leitora.

### Continuação no mesmo dia — consolidação em "Bíblia do Oráculo"

Depois das 3 rodadas acima, o usuário notou que eu tinha editado a mesma regra em 5 arquivos diferentes (`criador.md`, `copywriter.md`, `gancho-viral.md`, `oraculo-v2.md`, `oraculo-revisor-bella.md`) e perguntou se não valeria mais criar um "cérebro"/bíblia central, absorvido quando necessário, em vez de duplicar.

**Achado ao investigar a proposta:** já existia um documento assim — `biblia-comunicacao-bella.md` (identidade, ferida fundadora, avatar em camadas, Big Idea, DNA de voz, vocabulário proibido, leis invioláveis) — só que **nunca era carregado pelo pipeline**. `oraculo-v2.md` até citava "ver biblia-comunicacao-bella.md" em texto, mas o orquestrador nunca lia esse arquivo.

**Decisão (conforme direção do usuário — "a bíblia seria o próprio prompt do oráculo, mais completo"):** em vez de manter dois documentos, `oraculo-v2.md` foi reescrito para SER essa bíblia central — absorveu o essencial operacional de `biblia-comunicacao-bella.md` (identidade, avatar, big idea, DNA de voz, vocabulário proibido, leis invioláveis) e ganhou uma nova seção 13 "Regras de escrita transversais" com tudo que estava duplicado nos outros 4 arquivos (espelho direto vs. cena adivinhada, cadência sem amortecedores, confronte-o-padrão-não-a-pessoa, frase de espalhamento, teste do comentário previsto, enum de layouts válidos).

**Wiring:** `editorialOrchestrator.js` já carregava `oraculo-v2.md` como `prompts.strategist` só em ideação/estratégia — agora é concatenado também no estágio de **escrita** (antes de `copywriter`/`artDirector`) e no de **revisão** (antes de `reviewer`), então todo estágio absorve a mesma base sem precisar duplicar texto.

**Arquivos específicos enxutos:** `criador.md`, `copywriter.md`, `gancho-viral.md` e `oraculo-revisor-bella.md` tiveram as seções duplicadas removidas e substituídas por uma linha apontando para a bíblia central — cada um ficou só com o que é próprio da sua função (arquitetura de arco, mecânica de copy, mecânica de gancho, scorecard).

`biblia-comunicacao-bella.md` continua existindo como está (dossiê estratégico completo, incluindo os prompt-templates de imagem que não fazem sentido no fluxo de texto) — não foi apagado, só deixou de ser a única fonte não lida; sua essência textual agora vive dentro de `oraculo-v2.md`.

**Validado com chamada real à API** (ideação→estratégia→escrita→revisão completo): pipeline rodou os 4 estágios normalmente, layouts saíram dentro do enum válido, copy manteve espelho direto e frase de espalhamento, score 12/15 — mesma faixa das rodadas anteriores, sem regressão.

**Se precisar editar uma regra transversal no futuro:** edite só em `oraculo-v2.md`. Não copie a mudança para `criador.md`/`copywriter.md`/`gancho-viral.md`/`oraculo-revisor-bella.md` — eles absorvem via concatenação no orquestrador, não por texto duplicado.

### Continuação no mesmo dia — bug: lâminas saindo sem TÍTULO/CORPO

O usuário reportou (com print da tela) que o carrossel gerado ao vivo mostrava cada slide só com o nome do estado emocional (SUSPEITA, ACORDO, ENGRENAGEM...) e o layout dentro de "Ver direção visual" — **sem título e sem corpo nenhum**, em nenhuma das 5 lâminas.

**Hipótese inicial (descartada):** parecia bug do `MarkdownMessage.jsx` novo (regex de campo não reconhecendo o formato). Pedi o texto renderizado da tela pro usuário duas vezes para diferenciar "o modelo não escreveu" de "o parser descartou".

**Causa raiz real (não é frontend, é prompt):** o estágio de escrita concatena `criador.md` + `oraculo-v2.md` + `copywriter.md` + `diretor-artistico-bella-v2.md`. Dois problemas se somaram:
1. `criador.md` tinha um "Protocolo de geração completa" de 9 passos (Praça → Arqueologia → Big Idea → Hook Forge → Arquitetura → Partitura → Roteiro Oficial → Caption → Auditoria) escrito para um agente monolítico standalone — mas agora Praça/Arqueologia/Big Idea/Hook Forge/Arquitetura **já são decididos pela etapa de estratégia** do orquestrador e chegam prontos no `BRIEF APROVADO`. O modelo reescrevia tudo isso do zero mesmo assim.
2. `diretor-artistico-bella-v2.md` tem uma seção "Plano-mestre antes das lâminas" (cenas-mãe + progressão cromática) que o modelo tratou como uma SEÇÃO A ENTREGAR por extenso (virou "5. PLANO-MESTRE DE ARTE" com paleta em hex no output), e um "Ritmo obrigatório das dez lâminas" incompatível com o formato Bella Essencial de 5.

Resultado: o modelo gastava todo o orçamento de atenção/token reescrevendo raciocínio redundante + um relatório de arte inteiro, e ao chegar na seção 7 ("SLIDES"/ROTEIRO OFICIAL) só listava `[SX — ESTADO | layout: X]` sem nunca escrever as linhas TÍTULO:/CORPO:.

**Correção:**
- `criador.md`: o "Protocolo de geração completa" agora detecta se já existe um BRIEF APROVADO — se sim, pula direto para Partitura Emocional (breve) + ROTEIRO OFICIAL (com aviso explícito: "nunca entregue uma lâmina só com estado e layout") + Caption/CTA + Auditoria. O protocolo de 9 passos completo só é usado se não houver brief prévio (uso avulso fora do pipeline).
- `diretor-artistico-bella-v2.md`: "Plano-mestre antes das lâminas" agora é explicitamente raciocínio interno ("não é uma seção a entregar", máximo 2-3 linhas se resumido). "Ritmo obrigatório das dez lâminas" virou "Ritmo de referência" com instrução de comprimir proporcionalmente para carrosséis menores (5 lâminas).
- `editorialOrchestrator.js`: instrução do estágio de escrita reforçada — explicita que o brief não deve ser repetido e que toda lâmina precisa de TÍTULO e CORPO por extenso no formato exato, como rede de segurança adicional.

**Validado com chamada real à API**, reproduzindo o cenário exato do bug (mesmo tema, mesmo preset de 5 lâminas, incluindo o `diretor-artistico-bella-v2.md` real que antes eu tinha deixado de fora do teste anterior por engano): as 5 lâminas saíram com TÍTULO e CORPO completos, sem a seção de plano-mestre inflada, score 15/15.

**Se o sintoma voltar** ("slide só com nome do estado, sem texto"): primeiro confirme se `criador.md` ainda tem a ramificação "se já existe BRIEF APROVADO, pule para o roteiro" — não deixe alguém reintroduzir o protocolo de 9 passos como único caminho.

### Continuação no mesmo dia — bug: pedido de ideias virando produção completa

Ao testar a correção acima, o usuário pediu "me dê ideias de conteúdos disruptivos com um toque de provocação" e o sistema pulou direto pra produção completa (Praça/Arqueologia/Big Idea...) em vez de listar temas candidatos pra escolher — quebrando o fluxo normal de ideação → escolha → produção.

**Causa raiz:** `detectEditorialMode()` (em `editorialOrchestrator.js`) decide `ideas` vs. `production` por regex. A palavra "conteúdo(s)" está na lista de gatilho de `artifact` (carrossel, roteiro, slides, lâminas, **conteúdo**, post, peça, publicação), e a ordem de checagem antiga dava prioridade a `artifact` sobre `ideas`: `if (ideas.test(latest) && !artifact.test(latest)) return 'ideas'` — como a frase continha "conteúdos", esse `!artifact.test(latest)` dava falso, a checagem de ideias era pulada, e caía no fallback `if (artifact.test(latest)) return 'production'`. Ou seja: qualquer pedido de ideia que mencionasse a palavra "conteúdo" (comum em português — "ideias de conteúdo") acabava virando produção.

**Correção:** trocada a ordem/guarda — agora `if (ideas.test(latest) && !production.test(latest)) return 'ideas'` roda antes do fallback de `artifact`, e o guard é contra verbo de produção explícito (crie/gere/monte/produza...), não contra a palavra genérica "conteúdo". Testado com a frase exata do usuário + casos de controle (pedidos de produção continuam indo pra produção): todos corretos.

**Se o sintoma voltar** ("pedi ideias e ele já gerou tudo"): confirme se `detectEditorialMode` ainda testa `ideas` com guard de `production` (verbo), não de `artifact` (substantivo) — a troca de guard é o que resolve.

### 21/09/2026 (cont. 4) — Por que a comunicação seguia engessada, e a correção (só `.md`, vale sem reiniciar)

Usuário colou 5 ideias do Oráculo novo ("Retiro marcado. Conversa com seu pai, adiada.", "Ele some. Você chama de conexão difícil."…) e disse que seguia igual. **Diagnóstico:** (1) os 5 ganchos tinham o mesmo esqueleto de duas frases curtas separadas por ponto — molde que o próprio Oráculo ensinava ("duas frases secas"); (2) o limite de 14 palavras/75 caracteres na capa era **suposição não medida**: medindo `_fit` em `bella_essential_engine.py`, a capa aguenta ~24 palavras/~130 caracteres em 3 linhas (fonte 43) e o slide interno ~16 palavras/~100 caracteres em 2 linhas; (3) o Oráculo só tinha molde de frase solta, sem carrossel completo escrito no tom certo, e o modelo imita exemplos. **Correções em `oraculo-v2.md`:** tamanhos liberados (capa 24 palavras, interno 16; "gancho não é telegrama"); regra **anti-molde** (no máximo dois ganchos "X. Y." por lista); nova **Parte 11 com 3 carrosséis completos de calibragem** (A: ou/ou, retiro e pai, 5 lâminas; B: choque acumulado, "terapeuta gratuita do grupo", 5 lâminas; C: confissão de Bella, 7 lâminas), com aviso de não reaproveitar tema, apelido ou frase; **distribuição obrigatória dos 12 candidatos por forma de gancho** (choque acumulado, dilema em 1ª pessoa, ou/ou, paradoxo "Mulheres que dizem…", pergunta que cobra, confissão de Bella, objeto do cotidiano, denúncia da indústria) e no máximo 2 ganchos começando com "Você". Testes ao vivo: ganchos longos e variados ("Ou você para de traduzir as brigas da sua família, ou vira a filha que ninguém pergunta como está."; "Mulheres que dizem que encontraram sua tribo, mas nunca disseram não para o grupo."); roteiro de 7 lâminas com apelido ("a hóspede da própria relação") e lista de comportamentos. **Resíduos:** o modelo ainda puxa o "mundo" dos exemplos (mãe, pai, ex, chefe, boleto), repete "chama de…/medo vestido de…" e cravou "seu boleto/sua cliente" em uma ideia (palpite).

### 21/09/2026 (cont. 3) — "O Oráculo da Bella": prompt-mestre completo e modo Oráculo único

Usuário: faltava criar o Oráculo de verdade, como o da Andrieli e o "Oráculo Fonte Oculta" (agente inteiro num prompt: identidade, escopo, temas, gatilhos, vocabulário, molde de cada slide com exemplo, processo, checklist), e suspeitou que passar por vários agentes enfraquecia títulos. **`oraculo-v2.md` foi reescrito do zero** em 10 partes (identidade e função com modos IDEIAS/PRODUÇÃO; quem é a Bella e a leitora; escopo permitido/proibido; 7 pilares + ângulos + criação de tema + 12 perguntas + estado de crença; 15 gatilhos adaptados sem urgência fabricada; voz, concreto, partitura ácida, gancho, padrões virais, vocabulário, frase de espalhamento; anatomia lâmina a lâmina com molde e exemplo e compressão para 3/5/7/10; processo interno; formato de entrega; checklist). Versão anterior ("Bíblia") guardada em `agents/_versoes/oraculo-v2-biblia-20260921.md`. **`editorialOrchestrator.js`: modo Oráculo único (padrão)**, controlado por `ORACULO_MODO_UNICO` (defina `0` no `.env` para voltar ao pipeline antigo): a ideação e a estratégia usam só o Oráculo; a escrita usa Oráculo + Diretor Artístico (só para o campo VISUAL) + direção visual; `criador.md`, `copywriter.md`, `gancho-viral.md` e a reescrita do revisor ficam de fora (a etapa de revisão não roda; `stages` do resultado não inclui 'review'). Frontend: `parseIdeasFromText` exigia "Tema" solto em qualquer ponto da linha e criava tema falso a partir de "Esse tema atravessa…"; agora exige "Tema:" no início da linha (frontend reconstruído). Teste ao vivo em modo único: ideias ("Minha mãe aguenta tudo. Eu quase virei ela.", "Seu pai e sua irmã brigam. Você vira tradutora.") e roteiro de 7 lâminas com dilema na capa, apelido do padrão, listas de comportamentos, saída que absolve, pergunta com alvo e CTA correto. **Resíduos:** capa no mesmo molde de dilema da referência (é a forma, mas fica próxima); "chama X de Y" repetido 4 vezes (limite adicionado ao Oráculo, 2 por carrossel); um "talvez" escapou na caption. **A mudança em JS só vale após reiniciar o servidor.**

### 21/09/2026 (cont. 2) — Análise de 76 slides de referência (7 carrosséis) e "Padrões de copy viral"

Usuário passou 7 guias (Google Doc, slides como capturas de tela de posts do Instagram da referência; curtidas: 136k, 136k, 76k, 25k, 16k, 14k, 5,8k). Achados aplicados em `oraculo-v2.md` (nova subseção **"Padrões de copy viral"**, 11 itens): título de slide é veredito (frase completa com reviravolta), apelido para o papel/padrão (nunca para ela), capa como dilema/paradoxo que ataca a situação, corpo em lista de comportamentos com última linha curta, virada "Não é X. É Y." / "Chamam isso de X. Mas é Y." como dispositivo principal, verdade pesada em 3ª pessoa/coletivo com "você" só na virada e permissão, acidez que absolve, ritmo com lâmina de pausa, cena do cotidiano só com veredito, abstração só ancorada. **Reversão consciente:** as regras que proibiam "não é X, é Y" e "você chama de X" repetidos (revisor, `criador.md`, `copywriter.md`, `gancho-viral.md`) foram trocadas por "no máximo 1 por slide, nunca a mesma dupla". **Novos pilares de tema** (seção 7): (6) lealdade invisível à família e (7) se diminuir para pertencer (ferida fundadora de Bella). Os dois posts de 136k eram dilemas de amor e família sem culpar os pais; o de 5,8k acusava ("virou o pai"): com n=7 é indício, não prova, de que acidez que absolve performa melhor. **Não copiado:** estatística sem fonte, "a psicologia chama de", determinismo de gênero, "acesso grátis por 30 dias". Teste ao vivo: ideias migraram para pai/irmã/homem que some/cartão no rotativo; roteiro de 7 lâminas ainda crava um só alvo (trabalho) e o modelo continua copiando exemplos da bíblia ("Fez ayahuasca. …").

### 21/09/2026 (cont.) — "Nada abstrato": concreto, choque e scorecard fora da entrega

Usuário reprovou "Você quer outra cerimônia. A mesma conversa continua esperando" ("que mesma conversa?") e pediu comunicação mais esdrúxula, ganchos como centro, **nada abstrato, tudo intencional**. `oraculo-v2.md` ganhou "Concreto e intencional" (teste "qual?", lista de ponteiros vazios proibidos, pessoas/atos universais permitidos, proibido inventar rotina, variedade de alvos, teste do sentido, molde repetido reprova) e "Título e gancho" foi reescrito com a **Fórmula do choque** (coisa sofisticada que ela tem contra ato básico que ela não faz, com nome). `oraculo-revisor-bella.md` aplica o teste "qual?". `editorialOrchestrator.js`: instrução de ideação distribui formas de gancho entre os 12 candidatos; **novo `stripScorecard`** remove o SCORECARD interno do revisor do texto entregue (vazava "SCORECARD BELLA 14/15" no topo). **Tudo em JS só vale após reiniciar o servidor.** Último teste: ganchos bons ("Você fala de verdade. Mas mente quando sua mãe pergunta se está tudo bem."; "Eu fiz ayahuasca. E descobri que era má companhia pra mim."); roteiro ainda empilha palpites (mãe + término + currículo no mesmo slide) e repete "Você chama de processo".

### 21/09/2026 — Anatomia do carrossel (a "fórmula magistral" do usuário) e gancho de 2 frases

Usuário reprovou 5 títulos ("O retiro acabou. A vida ficou", "Seu processo não muda sua mesa"...) como "sem impacto" e trouxe a anatomia completa (gancho, validação, confronto, educação, reframing, empoderamento, síntese, reflexão, CTA, PS; 15 gatilhos; premissa; estado de crença). Causa: a regra "cirúrgico/curto" (4 a 9 palavras) que eu tinha escrito produzia fragmentos poéticos sem contradição nem laço aberto; na anatomia o gancho é de 2 linhas e carrega a contradição inteira. Mudanças: `oraculo-v2.md` ganhou **"Anatomia do carrossel"** (premissa não dica, estado de crença, 7 movimentos em ordem, compressão para 5/7/10 lâminas, gatilhos por movimento, vocabulário que corta, conectores) e **"Título e gancho"** (capa até 14 palavras/~75 caracteres, internos até 10/~60, limites do `_fit` do `bella_essential_engine.py`; 4 tipos de gancho; lista de reprovação). `criador.md`/`copywriter.md`/`diretor-artistico-bella-v2.md` tiveram o limite de título ajustado e a frase "nenhuma posição tem papel fixo" trocada por precedência da anatomia (isso **reverte conscientemente** a decisão anterior de não ter estrutura fixa, a pedido do usuário). `oraculo-revisor-bella.md` checa gancho e ordem dos movimentos. `editorialOrchestrator.js` (ideação): instrução de título trocada por gancho de 2 frases e novos campos `relevancia` (0-10, sem inflar) e `nivel_consciencia`, no formato do "Segundo comando" da anatomia. **Não importado de propósito:** estatística inventada ("82%", "estudos mostram"), urgência/escassez, reciprocidade com prazo, cota de gatilhos/palavras viscerais. **A parte de JS só vale depois de reiniciar o servidor**; os `.md` valem já. Testes ao vivo (3 rodadas) trouxeram ganchos como "Você compra outro curso. A mesma decisão continua esperando." e "Seu altar está pronto. A conversa continua adiada."; ainda escapam "sinais" (plural) e títulos internos abstratos ("Sua agenda não obedece à sua clareza").

### 18/09/2026 — Partitura ácida ("cada palavra uma alfinetada")

Usuário pediu comunicação "esdrúxula", ácida, cada palavra uma alfinetada, dentro dos gatilhos emocionais. Mudanças (só `.md`, valem sem reiniciar): `oraculo-v2.md` ganhou a subseção **"Partitura ácida"** (seção 13) com onde a picada acerta (confissão que ela não faria em voz alta, benefício oculto, desculpa bonita, indústria com evidência), técnica (uma alfinetada por frase, verbo duro, nome cru, ritmo em 3 batidas, ironia contra a desculpa e não contra ela), gatilhos que valem (vergonha nomeada, raiva coletiva, reconhecimento, alívio) e os que não valem (medo, urgência, escassez, prova social ou número inventado) e um freio (mira o padrão, nunca o valor da leitora; alfinetada forte pede saída firme). O "Tom" da voz deixou de ser "calma… nunca confronto agressivo" e virou "seco, direto, sem consolo; calma no jeito, ácida na palavra". `oraculo-revisor-bella.md` (critério 2) reprova consolo mole; `copywriter.md` trocou "elegante" por "afiada". **Decisão que o usuário pode vetar:** mantidos o freio "padrão, não pessoa" e a proibição de número inventado/urgência, que vêm das regras de marca da Bella. Teste ao vivo: títulos ficaram mais afiados ("Você salvou o post. E fez igual.", "Outro retiro. A mesma conversa adiada."), mas alguns saíram obscuros ("Acendeu vela. Não pediu desculpa.") e o CORPO ainda saiu mais explicativo que ácido.

### 18/09/2026 — Títulos populares (substitui a regra "cirúrgico" abaixo)

Depois da regra "cirúrgico" o usuário reprovou de novo: "A incompletude virou negócio" saiu abstrato, sem conexão, "inventado", e não na fala da audiência. Reli o prompt da Andrieli: o registro dela é gente e coisa concreta (pai, homem, café da manhã), a contradição que a leitora vive ("você diz X, mas continua Y") e fala de conversa, nunca conceito abstrato como sujeito. A subseção da bíblia foi reescrita como **"Título popular (a fala dela, cortada)"** em `oraculo-v2.md`: fala como ela fala (pode citar o pensamento dela entre aspas), sujeito concreto e nunca conceito, sem metáfora inventada, padrão reconhecível e não rotina adivinhada, um corte de 4 a 10 palavras, confronta o padrão e nunca ela; a palavra "também" é banida; no máximo 2 títulos por lista/carrossel no molde "Você X. Mas Y." (o modelo tinha caído nesse tique). O revisor (`oraculo-revisor-bella.md`) reescreve título abstrato, metafórico ou com cara de redação. Só `.md`, vale sem reiniciar. **Ressalva conhecida:** o modelo reaproveita literalmente exemplos de calibragem da bíblia (aconteceu 2 vezes com o primeiro exemplo da lista); a solução de fundo é alimentar a bíblia com falas reais da audiência (comentários, DMs, respostas de story) em vez de exemplos escritos por nós.

### 18/09/2026 — Títulos mais cirúrgicos (regra anterior, já substituída)

Usuário: títulos do Criador "muito ruins". Diagnóstico: hedge ("também pode"), metáfora de coach (portas, travessia, gesto), moral da história no fim, e a fórmula gasta "Você não precisa…". Nova subseção "Título cirúrgico" em `oraculo-v2.md` (seção 13): alvo de 4 a 9 palavras; o título precisa carregar o corte (contradição, custo ou fato inconveniente), não só nomear o tema; proibido abrir com "Você não precisa (de/parecer/ser)"; sem teaser ("pergunte isto"); sem "também" suavizador; teste de 5 perguntas por título. `oraculo-revisor-bella.md` reescreve qualquer título que reprove. Só `.md`, vale sem reiniciar. Validado ao vivo em 2 rodadas: de "A busca também pode virar prisão" / "Você não precisa parecer curada" para "“Deixar fluir” virou fuga de conversa." / "A incompletude virou negócio." **Ressalva:** o modelo reaproveitou literalmente um exemplo de calibragem ("Você sabe o nome. Repete mesmo assim."); se virar tique, troque os exemplos da bíblia.

### 18/09/2026 — Banco PGlite corrompido de novo (5ª vez) e reinício

Ao subir o dashboard (servidor tinha sido encerrado), o PGlite abortou na inicialização (`RuntimeError: Aborted()`), mesmo sem nenhum outro processo rodando; uma cópia do `pgdata` em outra pasta também não abriu, então os dados estavam corrompidos de fato. Com autorização do usuário, a pasta foi **renomeada** (não apagada) para `storage/pgdata-corrupt-preserved-20260918-2010` e o servidor criou um banco novo. Perdido do dashboard: histórico de conversas do Criador e lista de carrosséis desde 16/09 (arquivos de imagem em `storage/carousels/` intactos). Banco novo não tem overrides em `agent_prompts`, então os `.md` de `backend/agents/` valem direto. `.claude/launch.json` corrigido (porta 3132, não 47821).

**Hipótese não confirmada:** o `pgdata` fica dentro do OneDrive, que sincroniza os arquivos enquanto o banco escreve. Mitigação sugerida (não aplicada, precisa de autorização): mover o `pgdata` para fora do OneDrive ou usar Postgres de verdade.

---

## Sessão de 31/08/2026 — Bella: variedade visual, posicionamento de texto, infraestrutura local

> Se você é outro modelo/agente retomando este projeto: leia esta seção inteira antes de mexer em `core/util/composer/`, `core/util/deck_director.py`, `core/util/prompt_builder.py` ou nos agentes `backend/agents/*.md` da Bella. Ela documenta causas raiz já investigadas — não repita a investigação do zero.

### 1. Bug: motivo visual "fio/fita/corda" se repetindo em todo carrossel da Bella

**Sintoma relatado pelo usuário:** capas e CTAs diferentes (temas sem relação nenhuma entre si) sempre saíam com uma mulher segurando ou amarrada por fios/fitas douradas, cordas ou fios de cobre.

**Causa raiz (dupla, em dois sistemas independentes):**
1. **Código determinístico** — `backend/core/util/deck_director.py` (`_creative_universe`) e `backend/core/util/prompt_builder.py` (`_semantic_direction`) escolhiam o "motivo material" do carrossel por regex de palavra-chave. 3 das 4 categorias tinham fio/fita/corda como único motivo fixo, e o gatilho `n[aã]o` (a palavra "não", onipresente na voz da Bella) capturava quase todo conteúdo.
2. **Prompt do chat "Criador" (LLM)** — `backend/agents/diretor-artistico-bella-v2.md`, o prompt-mestre real por trás da UI de chat "Criador" (não confundir com o `criador` hardcoded em `dashboard/agentPrompts.js`, que é conteúdo antigo de outro cliente/marca — Jords/Fonte Oculta — e não é o que roda para a Bella). Sem exemplo literal de fio, mas o modelo convergia sozinho para essa metáfora ao lidar com temas de "limite"/"expectativas".

**Correção aplicada:**
- `deck_director.py` e `prompt_builder.py`: motivos agora vêm de **pools de 3-4 opções por categoria temática**, escolhidos por hash do conteúdo (variam entre carrosséis do mesmo tema, mas são estáveis para o mesmo carrossel). Fio/fita removidos como motivo padrão. Gatilho de "não" apertado para exigir frase real de limite (`\blimite(s)?\b`, `dizer n[aã]o`, etc).
- `diretor-artistico-bella-v2.md`: seção nova **"Símbolo material — proibição de repetição"** banindo fio/corda/fita como símbolo padrão e listando alternativas (raízes, água, tecido dobrado, cerâmica rachada, portão). Também adicionado à lista de "Proibidos" da capa.
- `prompt-oraculo-bella.md` (o template real de saída dos 10 slides usado pelo chat da Bella) e `AG09-tradutor-bella.md`: regras de variedade de arquétipo de composição e de capa sem depender de mulher-padrão.
- `core/util/prompt_builder.py`: `_RESTRICTIONS` ganhou uma linha proibindo explicitamente "mulher amarrada por fios/cordas andando por corredor com arcos" — a composição específica que mais se repetiu.
- Nova biblioteca `backend/agents/visual-references/` (`index.json` + `ref-00` a `ref-05`): análise de referências reais (Pinterest trazido pelo usuário) documentando arquétipos de composição (capa fotográfica, gráfico puro, painel dividido, card flutuante, textura tipográfica) e o caso `ref-00` documentando exatamente o anti-padrão do fio/card-sobre-blur. Serve de repertório para AG09/AG10, não é preset fixo.

**Backfill:** 4 carrosséis já gerados antes da correção (`deck_director.py` mudou às 18:29:05) ainda tinham fio nas fotos: *Evitar conflitos não te trouxe paz*, *Quanto mais você dá conta mais pesa*, *Ser madura não é se abandonar*, *Ser necessária não é ser amada*. As 11 fotos afetadas (slides 1/3/5 de cada, texto/legenda mantidos) foram regeneradas com os novos motivos, preservando o `art_direction_id` original de cada carrossel para não mudar o layout, só o material.

**Se o fio voltar a aparecer:** é regressão de verdade — confirmar timestamp do arquivo `slide-XX.meta.json` (campo implícito no `mtime`) contra o mtime de `deck_director.py`/`diretor-artistico-bella-v2.md` antes de assumir que o fix quebrou.

---

### 2. Bug: título e corpo do texto sobrepostos em alguns slides

**Causa:** `backend/core/util/composer/engine.py` — `compose_fullbleed`, `compose_dramatico`, `compose_etereo`, `compose_card`, `compose_brands_cover` aceitavam um `body_y` fixo do chamador (editor manual, ou um valor salvo antigo) e o usavam sem checar contra onde o título de fato terminava. Um slide salvo com `title_y=900, body_y=980` (só 80px de distância) sobrepunha sempre que o título tinha mais de ~1 linha nessa posição.

**Correção:** função `_safe_body_y()` em `engine.py`, aplicada nos 5 pontos — o corpo nunca mais pode começar antes de `rendered_title_y_end + gap`, não importa o valor pedido pelo chamador.

### 3. Feature nova: `RESPIRO` / `text_anchor` — posicionamento de texto guiado pela IA

**Problema mais profundo por trás do bug acima:** mesmo sem sobrepor, `compose_fullbleed`/`dramatico`/`etereo` tinham um piso fixo (`Y_MIN` = 62-66% da altura) que **sempre** empurrava o texto para o rodapé, ignorando a "zona de respiro" que o próprio briefing visual de 7 camadas da IA já planejava (ex: "respiro no alto e à esquerda").

**Correção — encadeada ponta a ponta:**
1. `backend/agents/diretor-artistico-bella-v2.md` e `backend/agents/prompt-oraculo-bella.md`: cada slide agora exige uma linha própria `RESPIRO: topo|centro|base`.
2. `backend/dashboard/routes/carousels/carouselsGenerate.js` (`parseCarouselTextNode`): extrai essa linha para `slide.text_anchor`.
3. `backend/core/criador_pipeline.py`: repassa `text_anchor` para `compose()`.
4. `backend/core/util/composer/engine.py`: `compose()` valida/normaliza `text_anchor` e repassa para `compose_fullbleed`/`compose_dramatico`/`compose_etereo`, que usam `_anchor_y_min()` para escolher o piso vertical certo (topo ≈150px, centro ≈38-40%, base = comportamento antigo inalterado).
5. Também plugado no fluxo manual: `backend/core/util/compose-slide.py` (`--text_anchor`) e a rota `POST /api/carousels/:id/slide/:filename/recompose` em `carouselsMedia.js`.

Validado com os 3 valores direto via Python (sem depender do dashboard) e depois no slide real via recompose.

---

### 4. Infraestrutura local: histórico do dashboard, armazenamento, banco

- **Local de saída dos carrosséis mudou:** `core/criador_pipeline.py` gravava direto em `OneDrive/Área de Trabalho` (pasta raiz, fora do projeto). Agora grava em `backend/storage/carousels/` — dentro do projeto, junto do que o `dashboard/helpers.js` já espera encontrar.
- **`core/agentes/register_carousel.py` reescrito:** antes gravava um JSON legado em `C:/Users/julia/nano-banana-mcp/...` (caminho de projeto antigo que o dashboard atual nunca lê) — carrosséis gerados localmente ficavam invisíveis na UI mesmo sem erro nenhum. Agora autentica com um JWT assinado localmente (mesma `JWT_SECRET` do `.env`, sem depender de PyJWT) e chama a API real `POST/PUT /api/carousels`, fazendo upsert por `slidesDir`.
- **Banco local é PGlite (WASM), não Postgres de verdade.** Já houve dois incidentes de perda de dados: (1) uma corrupção anterior a esta sessão que zerou o histórico visível (recuperado a partir dos arquivos em disco + de um registro JSON legado); (2) durante esta sessão, **reiniciar o processo do dashboard perdeu as duas linhas mais recentes da tabela `carousels`** enquanto outras 11 sobreviveram — indício de que escritas muito recentes não são persistidas em disco a tempo do processo encerrar. **Recomendação:** tratar o PGlite como cache, não como fonte de verdade, até migrar para um Postgres real (variáveis `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` já existem em `.env`, só falta um Postgres rodando local ou hospedado).
- `.env` local: `PORT` mudado para `47821` (porta incomum, evita conflito com outro serviço local do usuário) e `CORS_ALLOWED_ORIGINS` atualizado para incluir essa porta. `.claude/launch.json` criado apontando para `npm --prefix backend run dashboard`.

### 1. Sistema de Monitoramento (Fábrica Aberta)
*   **Pipeline em Tempo Real (SSE):** O dashboard agora recebe eventos via Server-Sent Events do `diretor_artistico.py`.
*   **Indicador de Progresso:** Adicionado cálculo de porcentagem (`0% a 100%`) e contador de slides (`Slide X de Y`) nas notificações (`index.html`).
*   **Status Inteligente:** Corrigido o bug da etiqueta "Gerando" persistente. Ao finalizar, o Dashboard limpa o cache e atualiza o status para "Pronto".

### 2. Motor de Design (`compose_util_v3.py`)
*   **Fim dos Cortes de Texto:** A restrição rígida `max_y` foi substituída por uma priorização da base (`BOTTOM_PAD`). Se o texto for longo, o bloco **sobe** em direção ao topo em vez de ser empurrado para baixo.
*   **Shrink Automático de Fontes:** Reduzidos os limites mínimos de fonte (Corpo: 16 | Título: 28) para impedir que textos densos quebrem o layout.
*   **Estética "Realismo Metafísico":** Novo padrão estético (Chiaroscuro, luz dramática) integrado ao `diretor_artistico.py`.

### 3. Clonador de Reels & Engenharia Reversa (`reels_engineer.py` e Dashboard)
*   **Transcrição Literal Completa:** O script agora retorna a transcrição pura do Whisper, e a UI do Dashboard a exibe num novo campo para conferência.
*   **Download de Transcrição:** Adicionado botão JavaScript que converte e baixa a fala do vídeo em um arquivo `.txt` direto pelo navegador.
*   **Memória de Longo Prazo (Histórico):** Criado o arquivo `dashboard/data/reels_history.json`. As análises ficam salvas e a UI as exibe em um grid para restauração rápida (1 clique).
*   **Fix Anti-Colisão (WinError 32):** Corrigido o problema de lock de arquivo no `yt-dlp` implementando `time.time()` para gerar nomes de arquivos de vídeo únicos (`temp_reel_12345678.mp4`).

### 4. Próximos Passos Sugeridos
*   Monitorar legibilidade de fontes minúsculas (tamanho 16) no Instagram.
*   Automatizar totalmente o CRON de postagem após o status ir para "Pronto".
