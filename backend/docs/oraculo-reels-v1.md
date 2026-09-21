# Oráculo de Conteúdo (Versão Reels) - Pipeline V1

Este documento define a arquitetura oficial, o fluxo de dados e o DNA Visual da V1 do "Oráculo Reels". O objetivo deste sistema é orquestrar agentes de IA para criar vídeos verticais (Reels/TikTok) de altíssima conversão, com atmosfera "Dark Mystical", utilizando a API do OpenAI Sora para geração de vídeo e GPT-4o para roteirização (Método Jordânico).

---

## 1. Visão Geral da Arquitetura

A geração de um vídeo de 40 a 60 segundos **não é feita em um take único** pelo Sora, pois isso gera alucinações e perda de coerência narrativa. 
O pipeline opera gerando **B-Rolls cinematográficos fatiados** (clipes independentes de 10-12 segundos) perfeitamente sincronizados com os blocos da narração.

### Os 4 Pilares do Pipeline:
1.  **Agente Roteirista (`roteirista_reels.py`)**: O Cérebro. Define o gancho, a narração e divide a linha do tempo em blocos visuais.
2.  **Diretor de Fotografia (`video_prompt_builder.py`)**: Aplica as correntes limitadoras do DNA Visual da *Fonte Oculta* em cima das cenas.
3.  **Sora Manager (`sora_manager.py`)**: A força braçal assíncrona. Pede a geração dos clipes para a API do OpenAI, aguarda e faz o download.
4.  **Integração Visual (Opcional via MCP)**: Uso do `claude-video-vision` para realizar engenharia reversa em vídeos que já viralizaram.

---

## 2. Passo a Passo do Fluxo de Geração

### Passo A: Concepção (Agente Roteirista)
*   **Entrada:** Um tema central (ex: "A Frequência da Pobreza") ou um vídeo viral antigo lido pelo `top_reels.py`.
*   **Processamento:** O GPT-4o escreve o roteiro e o **fatia em cenas curtas**.
*   **Saída (JSON):**
    ```json
    {
      "titulo_interno": "Frequencia da Pobreza 01",
      "texto_narracao_completo": "O dinheiro não obedece ao trabalho. Ele obedece à frequência do corpo que o carrega...",
      "cenas_fatiadas": [
        {
          "tempo_estimado": "0s - 12s",
          "fala_correspondente": "O dinheiro não obedece ao trabalho. Ele obedece à frequência...",
          "descricao_visual_crua": "Uma pessoa imersa em água escura, campo eletromagnético puxando para baixo."
        },
        {
          "tempo_estimado": "12s - 24s",
          "fala_correspondente": "Essa calibração aconteceu antes dos 7 anos...",
          "descricao_visual_crua": "Geometria cristalizada sendo formada por ondas lentas."
        }
      ]
    }
    ```

### Passo B: Direção de Fotografia (Video Prompt Builder)
*   A "descricao_visual_crua" de cada cena passa por um wrapper restrito que garante o formato estético.
*   **A "Coleira" do Prompt (Sufixo e Prefixo Obrigatórios para o Sora):**
    *   *Prefixo:* `Vertical 9:16 aspect ratio. Photorealistic dark fantasy cinematic shot. Deep black atmospheric background. High contrast chiaroscuro lighting.`
    *   *Sufixo de Movimento:* `Extremely slow, hypnotic, and subtle camera movement. Slow zoom or slow panning. Fluid transitions. Microscopic dust particles floating in the dark.`
    *   *Restrições Absolutas:* `Absolutely NO text, NO letters, NO words anywhere in the video. Mysterious, eerie, and profound atmosphere.`

### Passo C: Produção de Assets (Sora Manager)
*   O Manager itera sobre a lista de Cenas (ex: 3 cenas).
*   Faz as requisições paralelas (ou sequenciais) para o `/videos/create` da OpenAI solicitando vídeos de 10-12s.
*   Implementa o *polling* (verificação de status a cada X segundos) para não derrubar a conexão (geração de vídeo demora).
*   Faz o download na pasta do projeto:
    *   `/campanhas/reels/frequencia-pobreza/cena_01.mp4`
    *   `/campanhas/reels/frequencia-pobreza/cena_02.mp4`
    *   `/campanhas/reels/frequencia-pobreza/narracao.txt` (Para jogar no gerador de voz/ElevenLabs).

---

## 3. DNA Visual: Guia Rápido

Para manter a retenção e o estilo enigmático:

| Atributo | Regra Inquebrável |
| :--- | :--- |
| **Composição** | Minimalista. 1 ponto focal isolado no quadro. O fundo inferior deve ser "crushed to black" para facilitar leitura de legendas. |
| **Iluminação** | Alto contraste (*Chiaroscuro*). A escuridão é o cenário, a luz apenas recorta o elemento. Nenhuma iluminação global de "dia ensolarado". |
| **Paleta** | Preto absoluto, Ouro Envelhecido/Âmbar, Azul Índigo/Elétrico. Cores vibrantes apenas no "brilho" do mistério. |
| **Movimento** | Hiper-lento. Câmera deve ter fluidez de sonho hipnótico. Nada corta bruscamente, as coisas se dissolvem ou a câmera passeia muito devagar. |
| **Olhar (Retenção)** | Quando houver figura humana, os olhos devem ser impactantes, frios ou brilhantes, encarando diretamente a lente (quebra a 4ª parede). |

---

## 4. Integração Analítica (Top Reels)
O pipeline está conectado ao módulo `top_reels.py`, que raspa a Graph API do Meta. A IA lê os Reels do perfil que ultrapassaram uma métrica X de curtidas/engajamento para usá-los como semente (seed) no Agente Roteirista, garantindo que só reciclamos ganchos comprovadamente virais.
