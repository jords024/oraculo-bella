#!/usr/bin/env python3
"""
popular_notion_30dias.py — Popula o Calendário Editorial com 30 dias / 30 carrosseis
Cria 90 slots no Notion (3/dia × 10 dias) com copy, caption e metadata completos.

ROTAÇÃO VERIFICADA pelo planner.py:
  PRACAS   = ["MENTE","SISTEMA","CORPO","ESPÍRITO","ALAVANCA"]
  offsets  = [0, 2, 4]  # 09h, 13h, 20h
  09h: PRACAS[(dia_idx+0)%5]  |  FORMATO: B, D, B, D, B, D, B, D, B, D
  13h: PRACAS[(dia_idx+2)%5]  |  FORMATO: A, C, A, C, A, C, A, C, A, C
  20h: PRACAS[(dia_idx+4)%5]  |  FORMATO: D, B, D, B, D, B, D, B, D, B

USO:
    python popular_notion_30dias.py           → criar todos os 90 slots
    python popular_notion_30dias.py --dry-run → mostrar sem criar
    python popular_notion_30dias.py --dia 3   → criar apenas o dia 3 (1-10)
"""

import argparse
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent))
from notion_calendar import criar_slot

# ── FORMATO FULL NAMES ────────────────────────────────────────────────────────
B = "B - Demolição+Reconstrução"
D = "D - História+Verdade"
A = "A - Tese+Tradução"
C = "C - Lista Revelação"

# ── BASE PATH PARA SLIDES ─────────────────────────────────────────────────────
SLIDES_BASE = "C:/Users/julia/nano-banana-mcp/carousels"

# ── 30 CARROSSEIS — 10 DIAS × 3 SLOTS ────────────────────────────────────────
# Cada entrada: (data, horario, praca, formato, carousel_id, slides_dir, caption, status)

CARROSSEIS = [

    # ══════════════════════════════════════════════════════════
    # DIA 01 — 2026-04-09 (quinta-feira)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-09",
        "horario":     "09h00",
        "praca":       "MENTE",
        "formato":     B,
        "carousel_id": "fo-mente-disciplina-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-mente-disciplina-01",
        "status":      "Planejado",
        "titulo":      "Você não tem problema de disciplina",
        "caption": (
            "A disciplina não falhou com você.\n\n"
            "O sistema nervoso autônomo processa 11 milhões de bits por segundo. "
            "A mente consciente processa 50. "
            "Bruce Lipton, da Universidade Stanford, documentou em 1994 como as células "
            "respondem ao campo eletromagnético do ambiente antes de qualquer programa consciente.\n\n"
            "Você tentou vencer 11 milhões com 50. "
            "Não é falta de força de vontade. É física.\n\n"
            "Comente MENTE se você já se cobrou por não conseguir mudar um padrão "
            "que, no fundo, você sabia exatamente onde estava.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-09",
        "horario":     "13h00",
        "praca":       "CORPO",
        "formato":     A,
        "carousel_id": "fo-corpo-intestino-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-corpo-intestino-01",
        "status":      "Planejado",
        "titulo":      "Seu intestino tem 100 milhões de neurônios",
        "caption": (
            "Há 100 milhões de neurônios no seu intestino.\n\n"
            "Michael Gershon, da Universidade Columbia, os catalogou em 1996 "
            "e chamou de Sistema Nervoso Entérico — o segundo cérebro. "
            "90% dos sinais na via intestino-cérebro viajam de baixo para cima, "
            "não o contrário.\n\n"
            "O que você chama de instinto é literalmente um sistema nervoso inteiro "
            "funcionando abaixo do seu pescoço — e sendo ignorado sistematicamente.\n\n"
            "Comente FONTE se você nunca foi ensinado que seu corpo pensa "
            "independente do que sua cabeça decide.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-09",
        "horario":     "20h00",
        "praca":       "ALAVANCA",
        "formato":     D,
        "carousel_id": "fo-alavanca-chetty-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-alavanca-chetty-01",
        "status":      "Planejado",
        "titulo":      "O padrão oculto dos ricos — Harvard 2014",
        "caption": (
            "Em 2014, Raj Chetty analisou os registros fiscais de 40 milhões de americanos "
            "em estudo publicado pela Harvard. "
            "O fator preditivo mais alto de acumulação de riqueza não era inteligência, "
            "disciplina ou networking.\n\n"
            "Era o código postal onde você nasceu.\n\n"
            "E o sistema nervoso calibrado naquele ambiente antes dos 7 anos.\n\n"
            "Você não falhou. Foi calibrado para um teto que nunca escolheu. "
            "E calibrações podem ser reescritas.\n\n"
            "Comente FONTE se você cresceu num ambiente que definiu seu teto "
            "antes de você ter capacidade de questionar.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 02 — 2026-04-10 (sexta-feira)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-10",
        "horario":     "09h00",
        "praca":       "SISTEMA",
        "formato":     D,
        "carousel_id": "fo-sistema-jekyll-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-sistema-jekyll-01",
        "status":      "Planejado",
        "titulo":      "A reunião secreta que ainda controla seu salário",
        "caption": (
            "Em novembro de 1910, sete homens desembarcaram numa ilha privada na Georgia "
            "com identidades falsas. "
            "O que saiu daquele encontro — promulgado em 1913 como o Federal Reserve Act — "
            "ainda determina quanto vale a moeda em que você recebe hoje.\n\n"
            "Você trabalha décadas para acumular reserva numa moeda cujo valor é administrado "
            "por 12 bancos que nenhum presidente elege e nenhum congresso fiscaliza diretamente.\n\n"
            "Isso não é teoria conspiratória. Está no registro histórico do Congresso americano.\n\n"
            "Comente FONTE se você vai olhar diferente para o sistema financeiro depois disso.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-10",
        "horario":     "13h00",
        "praca":       "ESPÍRITO",
        "formato":     C,
        "carousel_id": "fo-espirito-einstein-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-espirito-einstein-01",
        "status":      "Planejado",
        "titulo":      "5 crenças de Einstein que removeram do currículo",
        "caption": (
            "Einstein disse: 'Quero conhecer os pensamentos de Deus. O resto são detalhes.' "
            "Não foi metáfora.\n\n"
            "Ele acreditava no Deus de Spinoza — uma inteligência impessoal que permeia "
            "toda a matéria. Passou 30 anos tentando provar matematicamente "
            "a unidade de toda a física num único campo.\n\n"
            "A teoria do campo unificado não era apenas ciência. "
            "Era teologia com equações.\n\n"
            "Comente FONTE se você sempre soube que ciência e espiritualidade "
            "descrevem o mesmo objeto de ângulos diferentes.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-10",
        "horario":     "20h00",
        "praca":       "MENTE",
        "formato":     B,
        "carousel_id": "fo-mente-amigdala-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-mente-amigdala-01",
        "status":      "Planejado",
        "titulo":      "Você não tem problema de foco — tem amígdala dominante",
        "caption": (
            "Joseph LeDoux, da Universidade de Nova York, mapeou o sequestro da amígdala em 1996.\n\n"
            "Em situação de ameaça percebida, o sinal chega à amígdala 12 milissegundos "
            "antes de chegar ao córtex pré-frontal. "
            "Doze milissegundos — e seu cérebro racional já chegou atrasado.\n\n"
            "O problema: a amígdala não distingue 'predador na savana' de 'apresentação importante'. "
            "Qualquer ameaça percebida ao status, pertencimento ou sobrevivência "
            "dispara o mesmo protocolo.\n\n"
            "Você não tem problema de foco. Tem um sistema de alarme calibrado para um mundo "
            "que não existe mais.\n\n"
            "Comente MENTE se você já se paralisou numa situação onde sabia logicamente "
            "que deveria agir — e não conseguiu.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 03 — 2026-04-11 (sábado)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-11",
        "horario":     "09h00",
        "praca":       "CORPO",
        "formato":     B,
        "carousel_id": "carrossel-trauma-somatico",
        "slides_dir":  "C:/Users/julia/nano-banana-mcp/carousels/carrossel-trauma-somatico",
        "status":      "Planejado",
        "titulo":      "Você reprogramou a mente — seu corpo ainda vive no trauma",
        "caption": (
            "Você reprogramou a mente. "
            "Fez terapia, leu livros, mudou os pensamentos.\n\n"
            "Seu corpo ainda vive no trauma de 20 anos atrás.\n\n"
            "Bessel van der Kolk, da Universidade Harvard, documentou em 2014: "
            "o trauma não reside na memória — reside no corpo. "
            "No tônus muscular. Na frequência cardíaca. Na postura.\n\n"
            "O HeartMath Institute mediu: o campo eletromagnético do coração se estende "
            "60 vezes além do peito e é detectável a 90 centímetros de distância.\n\n"
            "Você pode pensar diferente e ainda vibrar o mesmo.\n\n"
            "Comente CORPO se você já sentiu sua mente dizer sim "
            "enquanto seu corpo dizia não.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-11",
        "horario":     "13h00",
        "praca":       "ALAVANCA",
        "formato":     A,
        "carousel_id": "carrossel-teto-sna",
        "slides_dir":  "C:/Users/julia/nano-banana-mcp/carousels/carrossel-teto-sna",
        "status":      "Planejado",
        "titulo":      "Seu teto financeiro foi calibrado antes dos 7 anos",
        "caption": (
            "Você não tem problema de estratégia.\n\n"
            "Bruce Lipton, da Universidade Stanford (1994), documentou: "
            "nos primeiros 7 anos de vida, o cérebro opera em ondas theta — "
            "o estado hipnagógico. Nenhum filtro crítico. Tudo entra direto como programa.\n\n"
            "O que seus adultos sentiam sobre dinheiro foi instalado em você "
            "como hardware antes de você ter capacidade de questionar.\n\n"
            "Paul MacLean, do NIMH (1990): o sistema límbico — onde emoções e memórias vivem — "
            "é 3 vezes mais antigo que o córtex racional. Em conflito, ele vence.\n\n"
            "Comente FONTE se você já se pegou sabotando uma oportunidade financeira real "
            "sem conseguir explicar por quê.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-11",
        "horario":     "20h00",
        "praca":       "SISTEMA",
        "formato":     D,
        "carousel_id": "fo-sistema-gaiola-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-sistema-gaiola-01",
        "status":      "Planejado",
        "titulo":      "O dia em que o empreendedorismo virou a nova gaiola",
        "caption": (
            "Em 1983, John Naisbitt vendeu 9 milhões de cópias de 'Megatrends' "
            "e plantou uma crença que dominou os 40 anos seguintes: "
            "trabalhar por conta própria é liberdade.\n\n"
            "Os dados dizem outra coisa.\n\n"
            "O empreendedor individual médio no Brasil trabalha 57 horas por semana, "
            "ganha menos que um empregado sênior equivalente, "
            "e carrega 100% do risco que antes era da empresa.\n\n"
            "A gaiola mudou de modelo. A sensação de liberdade foi cuidadosamente mantida.\n\n"
            "Comente FONTE se você reconhece esse padrão — "
            "na sua trajetória ou na de alguém que você conhece.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 04 — 2026-04-12 (domingo)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-12",
        "horario":     "09h00",
        "praca":       "ESPÍRITO",
        "formato":     D,
        "carousel_id": "fo-espirito-jejum-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-espirito-jejum-01",
        "status":      "Planejado",
        "titulo":      "Os 40 dias que a neurociência agora consegue explicar",
        "caption": (
            "Quando Moisés subiu o Sinai por 40 dias sem comer, "
            "os escribas registraram como evento sobrenatural.\n\n"
            "Mark Mattson, diretor do Laboratório de Neurociências do NIH, "
            "publicou em 2014 no New England Journal of Medicine: "
            "jejum prolongado aumenta o BDNF — fator neurotrófico, "
            "o fertilizante do neurônio — em até 400%.\n\n"
            "O estado alterado de consciência relatado em práticas ascéticas "
            "tem uma bioquímica mensurável e reproduzível.\n\n"
            "A experiência mística e o mecanismo biológico são a mesma coisa "
            "descrita em idiomas diferentes.\n\n"
            "Comente FONTE se você sente que práticas antigas guardam "
            "uma tecnologia que ainda não sabemos nomear completamente.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-12",
        "horario":     "13h00",
        "praca":       "MENTE",
        "formato":     C,
        "carousel_id": "fo-mente-trava-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-mente-trava-01",
        "status":      "Planejado",
        "titulo":      "5 mecanismos que travam pessoas altamente inteligentes",
        "caption": (
            "Carol Dweck, da Universidade Stanford, identificou em 2006 "
            "que o fator que mais diferencia resultados entre pessoas de QI semelhante "
            "não é inteligência — é o modelo interno sobre de onde a inteligência vem.\n\n"
            "Pessoas com mindset fixo investem energia em parecer inteligentes. "
            "Pessoas com mindset de crescimento investem em aprender. "
            "Mesma inteligência. Resultados completamente diferentes.\n\n"
            "O mais cruel: quanto maior a inteligência, maior o medo de arriscar — "
            "porque fracassar diria algo sobre quem você é.\n\n"
            "Comente MENTE se você reconhece em você o padrão de não tentar "
            "para não ter que se confrontar com o resultado.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-12",
        "horario":     "20h00",
        "praca":       "CORPO",
        "formato":     B,
        "carousel_id": "fo-corpo-respiracao-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-corpo-respiracao-01",
        "status":      "Planejado",
        "titulo":      "Você respira errado há toda sua vida",
        "caption": (
            "James Nestor passou 10 anos pesquisando respiração para o livro 'Breath' (2020).\n\n"
            "Conclusão: 90% dos humanos modernos respiram de forma disfuncional — "
            "boca aberta, superficial, volume excessivo.\n\n"
            "O efeito: CO₂ cronicamente baixo mantém o sistema nervoso em alerta constante. "
            "Você fica em modo luta-ou-fuga sem nenhuma ameaça real.\n\n"
            "Sua ansiedade crônica pode não ser psicológica. Pode ser mecânica.\n\n"
            "E mecânica tem solução mecânica.\n\n"
            "Comente CORPO se você nunca tinha conectado sua forma de respirar "
            "com seu estado emocional crônico.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 05 — 2026-04-13 (segunda-feira)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-13",
        "horario":     "09h00",
        "praca":       "ALAVANCA",
        "formato":     B,
        "carousel_id": "fo-alavanca-estrategia-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-alavanca-estrategia-01",
        "status":      "Planejado",
        "titulo":      "Você não tem problema de estratégia",
        "caption": (
            "Você não tem problema de estratégia.\n\n"
            "Você tem um sistema nervoso calibrado para o teto financeiro "
            "do ambiente onde cresceu — antes de você ter capacidade de escolher.\n\n"
            "Joe Dispenza conduziu estudo publicado no Journal of Alternative and "
            "Complementary Medicine (2017, n=142): "
            "mudança de padrão de resposta ao estresse altera marcadores epigenéticos "
            "mensuráveis em 4 dias.\n\n"
            "Não são as suas escolhas que estão erradas. "
            "É o estado do sistema nervoso que as produz.\n\n"
            "E estados podem ser alterados.\n\n"
            "Comente FONTE se você tem estratégia e conhecimento e ainda sente "
            "algo invisível travando a execução.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-13",
        "horario":     "13h00",
        "praca":       "SISTEMA",
        "formato":     A,
        "carousel_id": "fo-sistema-controle-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-sistema-controle-01",
        "status":      "Planejado",
        "titulo":      "A arquitetura invisível do controle social",
        "caption": (
            "Edward Bernays — sobrinho de Freud, pai das relações públicas — "
            "escreveu em 1928: 'A manipulação consciente e inteligente dos hábitos "
            "e opiniões das massas é um elemento importante numa sociedade democrática.'\n\n"
            "Não foi uma crítica. Foi um manual.\n\n"
            "Ele criou o mercado de bacon no café da manhã americano em 1925. "
            "Não porque era saudável. Porque um cliente de processados de carne pagou.\n\n"
            "A arquitetura do seu desejo foi construída por alguém que não era você.\n\n"
            "Comente FONTE se você quer saber quais dos seus desejos são realmente seus.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-13",
        "horario":     "20h00",
        "praca":       "ESPÍRITO",
        "formato":     D,
        "carousel_id": "fo-espirito-mistico-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-espirito-mistico-01",
        "status":      "Planejado",
        "titulo":      "Os místicos estavam descrevendo física — sem saber",
        "caption": (
            "Plotino, no século III, descreveu o Uno: uma realidade não-dual "
            "da qual toda existência emana e para a qual toda consciência retorna.\n\n"
            "Em 1982, Alain Aspect, do CNRS francês, publicou o experimento "
            "que provou o entrelaçamento quântico — duas partículas, separadas "
            "por qualquer distância, são um único sistema.\n\n"
            "O Nobel de Física de 2022 foi dado por confirmar isso definitivamente.\n\n"
            "A separação é a ilusão. A unidade é a física.\n\n"
            "Plotino não tinha um acelerador de partículas. "
            "Tinha um método de consciência que chegou lá de outro ângulo.\n\n"
            "Comente FONTE se você sente que a tradição mística e a física moderna "
            "estão descrevendo a mesma realidade.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 06 — 2026-04-14 (terça-feira)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-14",
        "horario":     "09h00",
        "praca":       "MENTE",
        "formato":     D,
        "carousel_id": "fo-mente-heranca-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-mente-heranca-01",
        "status":      "Planejado",
        "titulo":      "O experimento que provou que suas crenças são herdadas",
        "caption": (
            "Rachel Yehuda, do Hospital Monte Sinai (2016), "
            "mediu os marcadores epigenéticos de filhos de sobreviventes do Holocausto.\n\n"
            "Eles tinham os mesmos padrões hormonais de resposta ao estresse que seus pais — "
            "sem nunca terem vivido um campo de concentração.\n\n"
            "O trauma não foi ensinado. Foi transmitido biologicamente.\n\n"
            "Suas crenças mais profundas sobre segurança, merecimento e possibilidade "
            "podem ter começado numa geração que não era a sua.\n\n"
            "Comente MENTE se você identificou na sua família um padrão "
            "que se repete há gerações sem que ninguém consiga quebrar.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-14",
        "horario":     "13h00",
        "praca":       "CORPO",
        "formato":     C,
        "carousel_id": "fo-corpo-sna-sinais-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-corpo-sna-sinais-01",
        "status":      "Planejado",
        "titulo":      "5 sinais de que seu SNA ainda está em modo sobrevivência",
        "caption": (
            "Stephen Porges, da Universidade de Indiana, "
            "publicou a Teoria Polivagal em 1994.\n\n"
            "Ela descreve como o sistema nervoso autônomo mantém o corpo "
            "em estados cronicamente defensivos — sem que a mente consciente perceba.\n\n"
            "O diagnóstico clínico não diz 'você está em modo sobrevivência'. "
            "Ele diz 'ansiedade', 'insônia', 'dificuldade de relacionamento', "
            "'procrastinação crônica'.\n\n"
            "São sintomas. O sistema nervoso é a causa.\n\n"
            "Comente CORPO se você reconhece em você os padrões que vou descrever.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-14",
        "horario":     "20h00",
        "praca":       "ALAVANCA",
        "formato":     B,
        "carousel_id": "fo-alavanca-inteligentes-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-alavanca-inteligentes-01",
        "status":      "Planejado",
        "titulo":      "Por que pessoas inteligentes ganham pouco",
        "caption": (
            "O QI médio de um CEO da Fortune 500 é 104. "
            "O QI médio de um professor universitário é 125.\n\n"
            "Inteligência não prediz riqueza.\n\n"
            "O que prediz — documentado por Raj Chetty em 40 milhões de casos — "
            "é a relação interna com merecimento, risco e autoridade. "
            "Todas instaladas antes dos 7 anos.\n\n"
            "Pessoas inteligentes que cresceram em ambientes de escassez aprendem "
            "que a inteligência é um instrumento de sobrevivência — não de expansão.\n\n"
            "E usam toda sua capacidade para justificar por que não podem ter mais.\n\n"
            "Comente FONTE se você já usou sua inteligência para criar argumentos "
            "contra sua própria expansão.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 07 — 2026-04-15 (quarta-feira)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-15",
        "horario":     "09h00",
        "praca":       "SISTEMA",
        "formato":     B,
        "carousel_id": "fo-sistema-escola-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-sistema-escola-01",
        "status":      "Planejado",
        "titulo":      "A escola foi projetada para criar trabalhadores — não pensadores",
        "caption": (
            "Em 1902, John D. Rockefeller criou o General Education Board "
            "e escreveu no primeiro relatório anual:\n\n"
            "'Não queremos pensar por nossa conta. Queremos que esses funcionários "
            "não façam nada além de executar as instruções dadas.'\n\n"
            "O modelo prusso-industrial de educação — sentar em fileiras, "
            "obedecer ao sinal, repetir conteúdo — "
            "não foi projetado para desenvolver potencial humano.\n\n"
            "Foi projetado para produzir obediência escalável.\n\n"
            "Você não é desinteressado. Foi colocado num sistema que premiava obediência "
            "e punia curiosidade fora do currículo.\n\n"
            "Comente FONTE se você foi chamado de 'problemático' ou 'difícil' "
            "exatamente por pensar demais.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-15",
        "horario":     "13h00",
        "praca":       "ESPÍRITO",
        "formato":     A,
        "carousel_id": "fo-espirito-coerencia-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-espirito-coerencia-01",
        "status":      "Planejado",
        "titulo":      "Deus não é uma entidade — é um estado de coerência",
        "caption": (
            "O HeartMath Institute, em 30 anos de pesquisa, "
            "identificou que o coração humano gera um campo eletromagnético "
            "detectável a 90 centímetros do corpo — 60 vezes mais poderoso "
            "que o campo cerebral.\n\n"
            "Em estado de coerência cardíaca — o que tradições chamam de oração, "
            "meditação ou rendição — o campo se sincroniza e muda a bioquímica. "
            "Cortisol cai. DHEA sobe. Sistema imunológico se fortalece.\n\n"
            "O que a tradição chama de 'presença de Deus' tem uma assinatura biométrica "
            "mensurável e reproduzível.\n\n"
            "Comente FONTE se você já sentiu a experiência — mas nunca teve "
            "um vocabulário científico para descrevê-la.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-15",
        "horario":     "20h00",
        "praca":       "MENTE",
        "formato":     D,
        "carousel_id": "fo-mente-dois-cerebros-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-mente-dois-cerebros-01",
        "status":      "Planejado",
        "titulo":      "O neurocientista que provou que você tem dois cérebros",
        "caption": (
            "Roger Sperry ganhou o Nobel de Medicina em 1981 "
            "por documentar que os hemisférios cerebrais processam realidades diferentes.\n\n"
            "O esquerdo processa linguagem, sequência, análise. "
            "O direito processa padrão, contexto, síntese. "
            "São dois sistemas com arquiteturas diferentes — "
            "que normalmente nunca aprendemos a usar juntos.\n\n"
            "A educação ocidental desenvolveu quase que exclusivamente o esquerdo.\n\n"
            "Você está usando metade do seu processador. "
            "E o sistema que você não desenvolveu "
            "é exatamente o que acessa estados expandidos de consciência.\n\n"
            "Comente MENTE se você quer entender como ativar a outra metade.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 08 — 2026-04-16 (quinta-feira)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-16",
        "horario":     "09h00",
        "praca":       "CORPO",
        "formato":     D,
        "carousel_id": "fo-corpo-levine-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-corpo-levine-01",
        "status":      "Planejado",
        "titulo":      "O médico que curou trauma sem uma única palavra sobre o passado",
        "caption": (
            "Peter Levine desenvolveu a Somatic Experiencing nos anos 70 "
            "observando como animais saem do estado de choque no campo.\n\n"
            "Um antílope perseguido por um leão, quando escapa, "
            "treme por vários minutos antes de retomar a pastagem normalmente. "
            "Descarga do sistema nervoso. Retorno à linha de base.\n\n"
            "Humanos foram ensinados a 'controlar' esse tremor. "
            "A 'ser fortes'. A 'não exagerar'.\n\n"
            "Resultado: o sistema nervoso permanece em estado de choque crónico "
            "enquanto a mente insiste que já superou.\n\n"
            "O corpo não mente. E ele guarda o que a mente descartou.\n\n"
            "Comente CORPO se você sente que há algo no seu corpo "
            "que nenhuma conversa conseguiu alcançar ainda.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-16",
        "horario":     "13h00",
        "praca":       "ALAVANCA",
        "formato":     C,
        "carousel_id": "fo-alavanca-padroes-ricos-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-alavanca-padroes-ricos-01",
        "status":      "Planejado",
        "titulo":      "5 padrões que mantêm pessoas ricas ricas",
        "caption": (
            "Thomas Stanley estudou 733 milionários americanos por 20 anos "
            "e publicou em 1996 o que descobriu: "
            "quase nenhum deles tinha lifestyle de luxo visível.\n\n"
            "O que tinham em comum: tolerância alta à incerteza, "
            "capacidade de manter visão de longo prazo sob pressão de curto prazo, "
            "e uma relação com dinheiro baseada em segurança — não em status.\n\n"
            "Essas não são habilidades financeiras. "
            "São estados do sistema nervoso.\n\n"
            "E estados são aprendíveis quando você sabe onde começar.\n\n"
            "Comente FONTE se você quer entender o que diferencia "
            "quem acumula de quem ganha e gasta na mesma velocidade.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-16",
        "horario":     "20h00",
        "praca":       "SISTEMA",
        "formato":     B,
        "carousel_id": "fo-sistema-capitalismo-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-sistema-capitalismo-01",
        "status":      "Planejado",
        "titulo":      "O que os ricos sabem sobre o sistema que você nunca foi ensinado",
        "caption": (
            "O Banco da Inglaterra publicou em seu site em 2014:\n\n"
            "'A maioria do dinheiro em circulação é criada por bancos comerciais "
            "quando concedem empréstimos — não pelo banco central.'\n\n"
            "Isso está no site deles. Não é teoria conspiratória.\n\n"
            "Você trabalha para pagar um empréstimo de dinheiro "
            "que foi criado digitalmente no momento em que você assinou o contrato.\n\n"
            "Entender o sistema não é suficiente para sair dele. "
            "Mas é o primeiro passo para parar de culpar a si mesmo "
            "por dificuldades que têm origem estrutural.\n\n"
            "Comente FONTE se você nunca tinha entendido como o dinheiro é criado.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 09 — 2026-04-17 (sexta-feira)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-17",
        "horario":     "09h00",
        "praca":       "ESPÍRITO",
        "formato":     B,
        "carousel_id": "fo-espirito-oracao-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-espirito-oracao-01",
        "status":      "Planejado",
        "titulo":      "Sua oração não está chegando a lugar nenhum — e eu posso provar",
        "caption": (
            "No aramaico original — o idioma que Jesus falava — "
            "a palavra usada para 'orar' é 'slota'.\n\n"
            "Ela não significa súplica. Significa alinhamento. Sintonização. "
            "Coerência com o campo.\n\n"
            "O Pai Nosso não é um pedido.\n\n"
            "O HeartMath Institute documentou: o coração humano em estado de coerência "
            "gera um campo eletromagnético que afeta as batidas do coração "
            "de pessoas a 90 centímetros de distância — sem contato físico.\n\n"
            "Oração que muda realidade não é súplica ao ausente. "
            "É sintonização do presente.\n\n"
            "Comente FONTE se você já sentiu que suas orações eram mais poderosas "
            "quando você estava em paz — do que quando estava desesperado.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-17",
        "horario":     "13h00",
        "praca":       "MENTE",
        "formato":     A,
        "carousel_id": "fo-mente-meditacao-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-mente-meditacao-01",
        "status":      "Planejado",
        "titulo":      "O que acontece no cérebro durante a meditação",
        "caption": (
            "Sara Lazar, da Harvard Medical School (2005), "
            "publicou o primeiro estudo de neuroimagem de meditadores de longo prazo.\n\n"
            "Resultado: o córtex pré-frontal — responsável por atenção, "
            "tomada de decisão e regulação emocional — era 5% mais espesso "
            "em meditadores versus controle da mesma idade.\n\n"
            "E não era seleção natural: 8 semanas de prática produziam "
            "mudanças mensuráveis na estrutura cerebral.\n\n"
            "A meditação não é prática espiritual ou filosofia. "
            "É neurocirurgia voluntária sem anestesia.\n\n"
            "Comente MENTE se você quer entender o protocolo que produz "
            "essas mudanças sem precisar de anos de prática para sentir resultado.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-17",
        "horario":     "20h00",
        "praca":       "CORPO",
        "formato":     D,
        "carousel_id": "fo-corpo-placebo-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-corpo-placebo-01",
        "status":      "Planejado",
        "titulo":      "O experimento de placebo que mudou a medicina",
        "caption": (
            "Em 1994, Bruce Moseley, ortopedista da Baylor University, "
            "realizou cirurgia de joelho placebo em veteranos de guerra com artrite severa.\n\n"
            "Incisão real. Anestesia real. Instrumentos cirúrgicos usados sem procedimento.\n\n"
            "Resultado: melhora idêntica ao grupo que fez a cirurgia real. "
            "Publicado no New England Journal of Medicine em 2002.\n\n"
            "O corpo curou artrite severa por acreditar que foi operado.\n\n"
            "Isso não é espiritualidade. É biologia. "
            "A crença é um mecanismo físico com efeitos físicos mensuráveis.\n\n"
            "Comente CORPO se você nunca tinha dimensionado "
            "o quanto sua expectativa determina a resposta do seu corpo.\n\n"
            "O acesso está no link da bio."
        ),
    },

    # ══════════════════════════════════════════════════════════
    # DIA 10 — 2026-04-18 (sábado)
    # ══════════════════════════════════════════════════════════

    {
        "data":        "2026-04-18",
        "horario":     "09h00",
        "praca":       "ALAVANCA",
        "formato":     D,
        "carousel_id": "fo-alavanca-epigenetica-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-alavanca-epigenetica-01",
        "status":      "Planejado",
        "titulo":      "A descoberta que prova que crenças financeiras são herdadas",
        "caption": (
            "Em 2016, Rachel Yehuda e a equipe do Monte Sinai publicaram "
            "a evidência definitiva: trauma modifica marcadores epigenéticos "
            "que são transmitidos para a geração seguinte.\n\n"
            "Filhos de pessoas que cresceram em extrema pobreza "
            "têm marcadores de cortisol e resposta ao estresse "
            "idênticos aos dos pais — mesmo quando crescem em abundância.\n\n"
            "Suas crenças sobre dinheiro — escassez, indignidade, perigo — "
            "podem ter chegado em você antes de você ter uma única experiência financeira.\n\n"
            "Você não herdou a pobreza. Herdou o sistema nervoso calibrado para ela.\n\n"
            "E sistemas nervosos podem ser recalibrados.\n\n"
            "Comente FONTE se você reconhece em você padrões financeiros "
            "que vieram de antes de você.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-18",
        "horario":     "13h00",
        "praca":       "SISTEMA",
        "formato":     C,
        "carousel_id": "fo-sistema-mitos-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-sistema-mitos-01",
        "status":      "Planejado",
        "titulo":      "5 mitos do empreendedorismo que mantêm você preso",
        "caption": (
            "Scott Shane, da Case Western Reserve University, "
            "analisou 30 anos de dados sobre startups americanas em 2008.\n\n"
            "Conclusão: a narrativa do empreendedorismo heroico é a mais cara "
            "que a indústria de cursos e eventos já vendeu.\n\n"
            "65% dos negócios fecham em 10 anos. "
            "Dos que sobrevivem, a maioria cresce menos "
            "do que o salário equivalente ao esforço investido.\n\n"
            "Isso não é argumento contra empreender. "
            "É argumento contra empreender sem entender que "
            "o sistema interno é mais determinante que o externo.\n\n"
            "Comente FONTE se você quer os 5 mitos que mais caros "
            "custaram para pessoas que você conhece.\n\n"
            "O acesso está no link da bio."
        ),
    },

    {
        "data":        "2026-04-18",
        "horario":     "20h00",
        "praca":       "ESPÍRITO",
        "formato":     B,
        "carousel_id": "fo-espirito-sna-01",
        "slides_dir":  f"{SLIDES_BASE}/fo-espirito-sna-01",
        "status":      "Planejado",
        "titulo":      "Você não precisa de fé maior — precisa de um SNA diferente",
        "caption": (
            "A maioria das pessoas que 'não consegue manter a fé' "
            "não tem problema de comprometimento espiritual.\n\n"
            "Tem um sistema nervoso autônomo cronicamente em modo de defesa.\n\n"
            "Stephen Porges documentou: quando o SNA está em estado de ameaça, "
            "o sistema de vinculação social — conexão, abertura, confiança — "
            "é literalmente desativado pelo nervo vago.\n\n"
            "Você não pode confiar quando seu sistema nervoso está sobrevivendo.\n\n"
            "A fé não é um ato de vontade. "
            "É o estado natural de um sistema nervoso que se sente seguro.\n\n"
            "Comente FONTE se você já se cobrou por não conseguir ter fé "
            "num momento em que, olhando de fora, a vida estava boa.\n\n"
            "O acesso está no link da bio."
        ),
    },

]

# ── VALIDAÇÃO ─────────────────────────────────────────────────────────────────
assert len(CARROSSEIS) == 30, f"Esperado 30 carrosseis, encontrado {len(CARROSSEIS)}"

# ── EXECUTAR ──────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Popular Notion — 30 dias")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem criar no Notion")
    parser.add_argument("--dia",     type=int, default=None, help="Criar apenas dia N (1-10)")
    args = parser.parse_args()

    print(f"\n{'='*62}")
    print("  POPULAR NOTION — 30 Carrosseis / 10 Dias")
    print(f"  Total de slots: {len(CARROSSEIS)}")
    if args.dry_run:
        print("  [DRY RUN ativado — nada será criado]")
    print(f"{'='*62}\n")

    # Filtrar por dia se especificado
    slots = CARROSSEIS
    if args.dia:
        from datetime import date, timedelta
        inicio   = date(2026, 4, 9)
        data_alvo = (inicio + timedelta(days=args.dia - 1)).isoformat()
        slots = [s for s in CARROSSEIS if s["data"] == data_alvo]
        print(f"  Filtrando para Dia {args.dia} ({data_alvo}): {len(slots)} slots\n")

    criados = 0
    erros   = 0

    for i, slot in enumerate(slots, 1):
        prefix = f"  [{i:02d}/{len(slots):02d}]"
        data    = slot["data"]
        horario = slot["horario"]
        praca   = slot["praca"]
        fmt     = slot["formato"][:1]  # A, B, C ou D
        titulo  = slot.get("titulo", "")
        caption = slot["caption"]

        print(f"{prefix} {data} {horario} | {praca:<10} | {fmt} | {titulo[:40]}")

        if args.dry_run:
            print(f"         Caption: {caption[:80].strip()}...")
            continue

        try:
            criar_slot(
                data        = slot["data"],
                horario     = slot["horario"],
                praca       = slot["praca"],
                formato     = slot["formato"],
                carousel_id = slot.get("carousel_id", ""),
                slides_dir  = slot.get("slides_dir", ""),
                caption     = slot["caption"],
                status      = slot.get("status", "Planejado"),
            )
            criados += 1
            time.sleep(0.35)   # respeitar rate limit da API do Notion
        except Exception as e:
            erros += 1
            print(f"         ERRO: {e}")

    print(f"\n{'='*62}")
    if args.dry_run:
        print(f"  [DRY RUN] {len(slots)} slots simulados. Remova --dry-run para criar.")
    else:
        print(f"  Concluído: {criados} criados | {erros} erros")
        if criados > 0:
            print("  Acesse o calendário em: https://notion.so")
    print(f"{'='*62}\n")

if __name__ == "__main__":
    main()
