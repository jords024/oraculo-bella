#!/usr/bin/env python3
"""
carrossel-deus-construido.py  — v3 (pictórico/atmosférico)
Tema: O Deus que Construíram
Praça: MENTE | Formato: B | Score: 15/15 | Preset: cinematografico_crimson
Big Idea: Concílio de Nicéia 325 d.C. — o Deus iracundo foi votado, não revelado.
Hook: PARADOXO SAGRADO — "Você nunca duvidou de Deus. Duvidou da versão construída para você."

MUDANÇA v3: todos os prompts migrados de "engraving/Doré" para
"painterly digital oil painting / atmospheric cinematic" — estilo dos virais reais.
"""

import os

from dotenv import load_dotenv

load_dotenv()
import base64
import json
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

# ── CONFIGURACAO ───────────────────────────────────────────────────────────────
API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-deus-construido")
TEMA          = "O Deus que Construíram"
TEMA_SLUG     = "deus-construido"
FORMATO       = "B"
PRESET        = "cinematografico_crimson"
CAPTION       = (
    "Em 325 d.C., Constantino convocou 318 bispos em Nicéia.\n"
    "316 assinaram o credo. 2 recusaram.\n\n"
    "O que você chama de doutrina cristã não foi revelado.\n"
    "Foi aprovado por maioria — numa votação política convocada por um imperador.\n\n"
    "Mais de 50 evangelhos foram excluídos desse cânone.\n"
    "No Evangelho de Tomé: 'O Reino não virá com sinais visíveis. "
    "Está dentro de vós e ao redor de vós.'\n\n"
    "Essa versão perdeu a votação.\n\n"
    "O que você internalizou como medo de Deus, culpa original, e necessidade de intermediário "
    "não é o que estava originalmente lá.\n"
    "É o que foi aprovado para estar lá.\n\n"
    "Comente FONTE se você já sentiu que estava rezando para um Deus que alguém descreveu pra você "
    "— e nunca encontrou o que estava de fato procurando."
)
REVISOR_SCORE = "15/15"
NOTAS         = (
    "Formato B. Praça: MENTE. Preset: cinematografico_crimson. "
    "v3 — prompts pictórico/atmosférico. "
    "Mecanismo: Concílio de Nicéia 325 d.C. — Constantino + 318 bispos. "
    "Raiva coletiva: Igreja institucional como substituta do divino original."
)

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ─────────────────────────────────────────────────────────────────────

slides = [

  # ── S1 — DISRUPÇÃO ── pedra que deveria ser Deus ─────────────────────────────
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "dramatico",
    "gen_image": True,
    "title": "VOCÊ NUNCA\nDUVIDOU DE DEUS.",
    "body": (
        "Duvidou da versão de Deus\n"
        "que alguém construiu para você."
    ),
    "prompt": (
        "Painterly digital oil painting, mystical cinematic realism. "
        "The visual language of Byzantine sacred icon painting meets dark fantasy illustration — "
        "rich, detailed, atmospheric, deeply textured."

        "A massive stone Byzantine carved face — an ancient carved deity-icon — "
        "fills 65% of the frame. The face is the constructed God: imperial, severe, "
        "authoritative — the specific expression of institutional authority pretending to be divine. "
        "The stone is rendered with extraordinary painterly detail: ancient texture, cracked surface, "
        "carved features of tremendous scale and weight. Not a flat icon — a dimensional, textured, "
        "living stone presence."

        "FROM WITHIN THE CRACKS across the entire face and crown: "
        "VIVID saturated crimson-red light radiates outward with intensity — "
        "not subtle, not glowing softly, but burning through the stone like buried fire. "
        "The crimson (#991b1b) cracks form a luminous network across the face, "
        "bright enough to cast red light onto the surrounding stone. "
        "The crimson is MAXIMUM SATURATION — this is suppressed fire, not decoration."

        "In the lower foreground: a small contemporary human figure seen from behind, "
        "standing at the base of this colossal face, providing overwhelming scale contrast."

        "Color palette: warm ancient stone (grey-beige-gold) for the face, "
        "maximum saturation crimson red for the crack-light, "
        "deep atmospheric charcoal-brown background with ancient columns receding into rich shadow. "
        "NOT absolute black — deep brown-crimson atmospheric depth with visible stone architecture."

        "Lighting: dramatic upward light from below — warm crimson-amber illuminating the stone face "
        "from beneath, casting theatrical upward shadows into the carved features. "
        "The crimson light from the cracks adds a second ambient source."

        "Rich painterly texture throughout — visible brushstroke quality, "
        "detailed and atmospheric, not photographic. "
        "Lower 30% of frame fades to deep shadow for text. "
        "Vertical portrait 4:5. No text, no symbols, no watermarks."
    ),
  },

  # ── S2 — DESCIDA ── catedral vazia, oração sem resposta ──────────────────────
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "gen_image": True,
    "title": "A SENSAÇÃO\nDE REZAR\nPARA O VAZIO.",
    "body": (
        "Não é falta de fé.\n"
        "É fé endereçada para uma construção —\n"
        "não para o que a construção pretendia representar."
    ),
    "prompt": (
        "Painterly digital oil painting, atmospheric and cinematic. "
        "The visual language of academic religious painting meets mystical photorealism — "
        "rich, warm, deeply detailed, alive with atmospheric color."

        "Interior of a Gothic cathedral rendered in FULL painterly atmospheric detail: "
        "towering stone columns with visible carved detail, "
        "ribbed vaulting rising dramatically into luminous atmospheric haze above, "
        "the vast nave receding in perfect perspective into warm distance. "
        "Every stone surface catches the light — warm amber-gold from wall sconces "
        "illuminates the columns with golden warmth. The architecture is BEAUTIFUL, not oppressive. "
        "It is the construction that stands between the person and what they seek."

        "A solitary figure kneeling in the center of the nave, seen from behind, "
        "occupying 30% of the frame. Posture: genuine, sincere prayer. "
        "The figure's clothing warm and contemporary. Real."

        "Above the figure, descending from the vault: "
        "a vertical column of deep saturated violet-purple atmospheric light (#7c3aed) — "
        "not theatrical beam but ambient atmospheric color, like a column of colored air, "
        "diffuse and luminous. It exists high above. It doesn't reach the figure. "
        "It is present and inaccessible — separated by the architecture."

        "Color palette: rich and full — warm amber-gold from the candles lighting the columns, "
        "cool grey-gold stone, the violet atmospheric column as dominant accent, "
        "warm deep brown in shadow areas. NOT dark and monochromatic — "
        "rich and atmospheric, like a Rembrandt interior with sacred light."

        "Lighting: multiple warm amber candle sources + the single violet atmospheric column above. "
        "Warm and sacred, not cold and institutional."

        "Rich painterly texture — every stone, every fold of fabric, every shadow. "
        "Lower 30% fades to warm deep shadow for text overlay. "
        "Vertical 4:5. No text, no symbols."
    ),
  },

  # ── S3 — NOMEAÇÃO ── Concílio de Nicéia 325 d.C. ────────────────────────────
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "gen_image": True,
    "title": "DEUS FOI\nVOTADO.",
    "body": (
        "Concílio de Nicéia, 325 d.C.\n"
        "Constantino convocou 318 bispos.\n"
        "316 assinaram. 2 recusaram.\n\n"
        "O que você chama de fé cristã não foi revelado.\n"
        "Foi aprovado por maioria."
    ),
    "prompt": (
        "Painterly digital oil painting, historical cinematic realism. "
        "The visual language of academic history painting — like Jacques-Louis David or "
        "Géricault — applied to a sacred institutional scene. "
        "Rich, detailed, warm, dramatic, FULL COLOR."

        "A grand imperial council chamber — marble columns, high stone arches, "
        "the architecture of Roman-Christian power in the 4th century. "
        "The room is ALIVE and CROWDED: 30+ bishops and clergy in richly detailed robes "
        "— deep burgundy, ivory white, purple with gold trim — "
        "seated in formal rows around a large central table covered in scrolls and codices. "
        "FACES ARE VISIBLE AND EXPRESSIVE: some animated in argument, some raising hands to vote, "
        "some with expressions of political calculation rather than faith."

        "CENTER AUTHORITY: a commanding figure in imperial Roman dress — "
        "Constantino — standing at the head of the table, arm raised in commanding gesture, "
        "presiding over the vote. His imperial purple and gold robes are the most saturated "
        "color in the scene. He is CLEARLY a political figure, not a religious one. "
        "His expression: confident institutional power."

        "From beneath the documents on the table and between certain figures: "
        "intense deep crimson light (#991b1b) radiating upward — "
        "the sacred source being buried under official process, visible as concentrated crimson "
        "light escaping from beneath the documents, casting crimson shadow upward on nearby faces."

        "Color palette: WARM AND FULL — amber-gold torchlight illuminating the scene "
        "from high windows and wall torches, bishops' robes in varied deep colors, "
        "Imperial purple for Constantino, with crimson as the concentrated accent "
        "of suppression beneath the official proceedings. "
        "The scene has the warmth of candlelit 4th century Rome."

        "Lighting: dramatic warm amber-gold from high clerestory windows — "
        "Caravaggio-style dramatic illumination, casting each face in warm golden light "
        "with deep dramatic shadows. The crimson from beneath the table adds a second "
        "accent light source."

        "Rich painterly texture — every robe fold, every face, every scroll. "
        "Lower 30% fades to deep warm shadow for text. "
        "Vertical 4:5. No text, no watermarks."
    ),
  },

  # ── S4 — PROFUNDIDADE ── os evangelhos excluídos ────────────────────────────
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "card",
    "gen_image": True,
    "title": "O QUE FOI\nELIMINADO",
    "body": (
        "Mais de 50 textos foram excluídos do cânone no Concílio de Nicéia.\n\n"
        "No Evangelho de Tomé (séc. I-II): 'O Reino não virá com sinais visíveis. "
        "Está dentro de vós e ao redor de vós.'\n\n"
        "Nessa versão: Deus não pune. Não exige intermediário. Não está fora.\n\n"
        "Essa versão perdeu a votação."
    ),
    "prompt": (
        "Painterly digital oil painting, mystical archaeological atmosphere. "
        "The visual language of warm candlelit manuscript illumination meets mystical discovery."

        "Ancient scrolls and illuminated codices spread across a dark stone surface — "
        "partially unrolled, revealing pages of handwritten text in Greek and Coptic script. "
        "The documents are aged but LUMINOUS — warm parchment gold, "
        "the ancient ink carrying sacred intention. "
        "Rendered with extraordinary painterly detail: every fold of parchment, "
        "every shadow where one scroll overlaps another."

        "From between the scrolls and from the pages themselves: "
        "deep saturated TEAL light (#0d9488) radiating upward and outward — "
        "the frequency of the suppressed knowledge still emanating from within the documents. "
        "The teal glow illuminates the surrounding parchment with warm-cool contrast."

        "FLOATING above the scrolls, translucent and luminous: "
        "a ghostly human figure in the posture of inner illumination — "
        "arms open, head slightly raised, deep teal light radiating FROM WITHIN the chest — "
        "this is the figure described in the suppressed texts: "
        "the divine that is inside, not outside. "
        "Rendered as translucent painterly luminescence, clearly visible but ethereal."

        "Color palette: warm antique gold-amber for the parchment, "
        "deep teal (#0d9488) as the luminous accent from the documents and the figure above, "
        "deep atmospheric dark brown-blue for the background stone surface. "
        "FULL atmospheric warmth — not flat."

        "Lighting: warm amber candlelight from upper-left illuminating the parchment surfaces, "
        "with teal light emanating from within the documents themselves. "
        "Two light sources in warm-cool contrast."

        "Rich painterly texture. Vertical 4:5. No text, no symbols."
    ),
  },

  # ── S5 — QUEDA FUNDA ── a culpa instalada como arquitetura ───────────────────
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "gen_image": True,
    "title": "A CULPA\nNÃO É SUA.\nMAS ESTÁ EM VOCÊ.",
    "body": (
        "Você não escolheu o Deus que internalizou.\n"
        "Ele foi instalado antes que você soubesse\n"
        "que havia outras versões.\n\n"
        "E agora é você quem o mantém ativo —\n"
        "não por convicção. Por medo do vazio\n"
        "que ficaria no lugar."
    ),
    "prompt": (
        "Painterly digital oil painting, surrealist mystical realism. "
        "The visual language of academic figure painting meets dark conceptual sacred art — "
        "like William Blake's illuminated figures meets contemporary surrealism. "
        "Rich, detailed, atmospheric, deeply felt."

        "A young woman (late 20s), contemporary, stands in the center of the frame "
        "occupying 70% of the height. She is rendered with photographic painterly detail — "
        "real, present, beautiful. Her expression carries a specific weight: "
        "not fear, not anguish, but the quiet normalization of an inherited burden. "
        "Eyes slightly downward, shoulders carrying something. Present but weighted."

        "Growing organically from her shoulders, rising above her head: "
        "elaborate Gothic cathedral architecture — ornate, detailed, clearly religious. "
        "NOT worn like clothing — GROWN from her body as biological extension, "
        "like bone extending into stone spires. Flying buttresses extend from her shoulder blades. "
        "A rose window visible as a crown above. Gargoyles at the edges. "
        "The architecture is exquisitely detailed — every carved element visible."

        "At the junction of flesh and stone: warm organic integration — "
        "skin transitions into carved stone naturally, as if this is simply her anatomy."

        "Through the cathedral windows: concentrated deep crimson (#991b1b) light "
        "emanating outward — the suppressed sacred source glowing from within "
        "the inherited institutional structure."

        "Color palette: warm realistic skin tones for the figure, "
        "cool grey stone for the cathedral architecture, "
        "deep atmospheric blue-purple background with rich depth, "
        "crimson as the glowing accent within the cathedral windows and structural cracks."

        "Lighting: warm amber light from directly above illuminating the cathedral-crown, "
        "while the figure's face receives soft ambient violet-blue light from the background. "
        "The crimson within glows outward as a third accent."

        "Rich painterly quality throughout. Lower 30% fades to deep shadow. "
        "Vertical 4:5. No text, no symbols."
    ),
  },

  # ── S6 — ESPELHO ── o self dividido — exatamente como a referência Image 1 ───
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "gen_image": True,
    "title": "VOCÊ JÁ\nSENTIU ISSO.",
    "body": (
        "Existe uma parte de você que rezou com sinceridade —\n"
        "e sentiu que estava falando para um espelho vazio.\n\n"
        "Essa parte não errou.\n"
        "Ela estava endereçando a frequência certa\n"
        "para o endereço errado."
    ),
    "prompt": (
        "Painterly digital oil painting, mystical psychological realism. "
        "EXACTLY in the visual style of: a person and their higher luminous self "
        "simultaneously visible in one composition — rich, detailed, atmospheric, "
        "like the highest quality mystical digital painting. "
        "Photorealistic yet painterly. Warm and cosmic simultaneously."

        "In the lower-center of the frame: a young man (25-35), "
        "eyes gently closed in inward listening, slight head bow, "
        "occupying 45% of the frame height. "
        "Rendered with EXTRAORDINARY painterly detail — "
        "every hair visible, skin texture real and warm, expression of genuine inner searching. "
        "His clothing simple, dark, contemporary. Shirt slightly open at collar. "
        "He is REAL and CLOSE — this is the viewer's mirror."

        "RISING from within and above him: his authentic self — "
        "a translucent, luminous higher presence composed of violet-purple ethereal light. "
        "This upper figure is larger, upright, composed — rendered in translucent painterly luminescence, "
        "clearly a figure (face, shoulders, posture visible) but made of pure violet light. "
        "The expression of the upper figure: calm recognition of what it has always been. "
        "It looks slightly outward, not downward — it knows."

        "Between the two: spiral energy patterns in soft violet (#7c3aed) and teal — "
        "flowing, organic, electromagnetic, like the field between the two states "
        "made visually tangible. The spirals emerge from the lower figure's chest."

        "Color palette: warm realistic tones for the lower figure (amber skin, dark clothing), "
        "saturated violet (#7c3aed) and translucent luminous white-blue for the upper presence, "
        "RICH DEEP COSMIC BLUE-PURPLE background with distant star field and subtle nebula — "
        "the cosmos as the natural environment of this recognition."

        "Lighting: warm amber-gold light on the physical figure from front-below, "
        "cool violet ethereal light from the upper presence cascading downward, "
        "the cosmic background illuminated by distant starlight."

        "This is the exact visual archetype: lower physical self + upper luminous self, "
        "both present simultaneously, one becoming aware of the other. "
        "Rich, detailed, alive, emotional. "
        "Lower 30% fades to deep shadow. Vertical 4:5. No text."
    ),
  },

  # ── S7 — ASCENSÃO ── afastando das ruínas, campo dourado ─────────────────────
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "gen_image": True,
    "title": "O DIVINO\nNÃO PRECISA\nDE CÂNONE.",
    "body": (
        "O que foi suprimido no Concílio de Nicéia\n"
        "ainda está disponível.\n\n"
        "Não em textos proibidos.\n"
        "Em você — antes da doutrina.\n"
        "No campo que antecede qualquer religião."
    ),
    "prompt": (
        "Painterly digital oil painting, atmospheric cinematic landscape. "
        "The visual language of luminous landscape painting — "
        "Turner's atmospheric light meets mystical sacred realism. "
        "Rich, warm, deeply atmospheric, alive with golden light."

        "A human figure seen from behind — contemporary, walking with the easy pace "
        "of someone returning somewhere known, not arriving somewhere new. "
        "The figure occupies 35% of the frame height, centered-left, posture of recognition."

        "BEHIND the figure (receding into distance): "
        "peaceful ruins of stone religious architecture — crumbled columns, "
        "fallen Gothic arches, carved stone fragments scattered on mossy ground. "
        "NOT destroyed by violence — simply no longer standing. "
        "The ruins are rendered in cool grey-blue stone tones, "
        "beautiful and melancholy, clearly past."

        "AHEAD of the figure (the majority of the frame): "
        "an extraordinary open landscape in warm AMBER-GOLD LIGHT (#d97706). "
        "The horizon glows with warm golden intensity — not supernatural, but hyper-real, "
        "the quality of light just after an eclipse or just before a dawn unlike any other. "
        "The golden light emanates from the landscape itself and from the horizon."

        "Within the golden landscape: very subtle sacred geometry — "
        "Fibonacci spiral proportions and Flower of Life structure "
        "barely visible as the natural organization of the field, light, and sky. "
        "Suggested, not imposed — as if the land IS the sacred structure."

        "Color palette: FULL AND WARM — cool grey-blue stone ruins behind, "
        "RICH AMBER-GOLD (#d97706) atmospheric landscape ahead, "
        "warm intermediate tones at the transition where the two meet. "
        "Sky: warm golden-orange at horizon, deep amber-blue atmospheric at top."

        "Lighting: the golden field and horizon ARE the light source — "
        "warm and ambient, casting warm shadow backward over the ruins."

        "Rich painterly texture — detailed ruins, luminous field, atmospheric sky. "
        "Lower 30% fades to warm deep shadow for text. "
        "Vertical 4:5. No text, no symbols."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── o toque interno, Sixtina reimaginada ───────────────
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "gen_image": True,
    "title": "NÃO FOI\nESCONDIDO.\nFOI SUBSTITUÍDO.",
    "body": (
        "A versão que te ensinaram a temer\n"
        "não é o que estava originalmente lá.\n\n"
        "O que estava lá não teme.\n"
        "Não pune. Não exige intermediário.\n"
        "Já está dentro."
    ),
    "prompt": (
        "Painterly digital oil painting, Renaissance sacred realism reimagined. "
        "The visual language of Michelangelo's Sistine Chapel — that specific quality "
        "of sacred academic painting — applied to an interior rather than exterior divine. "
        "Warm, luminous, detailed, deeply human."

        "A figure reclining in Renaissance posture — reminiscent of Adam from the Sistine ceiling "
        "but in open cosmic space, not on a cloud. One arm extended upward toward their own chest. "
        "The posture: not supplication toward something external, "
        "but the specific gesture of recognition — reaching toward the light that comes from within."

        "FROM THE FIGURE'S CHEST — specifically from the heart: "
        "warm AMBER-GOLD light (#d97706) radiates outward in all directions — "
        "sourceless, organic, luminous, warm as sunlight. "
        "The golden light is VIVID and concentrated at the heart, diffusing outward "
        "to bathe the extending arm and illuminate the face in warm gold from below."

        "The extended hand reaches toward this interior light — "
        "the divine touch that was always shown as external is here revealed as internal."

        "OVERLAID on the chest, semi-translucent: "
        "sacred anatomy — the heart and radiating cardiovascular system "
        "visible through the skin in fine golden-amber lines, "
        "as if the physical organ and the sacred source are the same structure. "
        "Alex Grey style sacred anatomy, warm gold, integrated naturally."

        "NO external God-figure. NO clouds. NO external divine. "
        "Just the figure and the golden light that comes from within the chest. "
        "The background: deep atmospheric blue-purple cosmic depth — "
        "star field with subtle nebula warmth, making the golden interior light "
        "the most vivid element in the composition."

        "Color palette: warm Renaissance skin tones, "
        "VIVID AMBER-GOLD (#d97706) as the concentrated interior light, "
        "deep cosmic blue-purple background. "
        "The contrast between warm gold interior light and cool cosmic exterior: maximum."

        "Lighting: the interior chest-light illuminates the figure from within — "
        "warm amber casting upward light on the face and arm. "
        "Cosmic background light: cool and distant."

        "Rich Sistine-quality painterly detail. Lower 30% fades to deep shadow. "
        "Vertical 4:5. No text."
    ),
  },

  # ── S9 — SETUP CTA ── figura em recepção — campo antes da doutrina ───────────
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "gen_image": True,
    "title": "EXISTE UMA\nFREQUÊNCIA\nQUE PRECEDE\nTODA DOUTRINA.",
    "body": (
        "Existe uma tecnologia sonora capaz de acessar\n"
        "o estado de conexão direta —\n"
        "sem intermediário, sem crença imposta.\n\n"
        "O campo existe antes de qualquer nome\n"
        "que você dê a ele.\n"
        "A frequência é anterior à religião."
    ),
    "prompt": (
        "Painterly digital oil painting, atmospheric mystical realism. "
        "The visual language of the reference: a person in direct spiritual reception — "
        "rich, warm, atmospheric, alive with sacred energy. "
        "Exactly the painterly quality of the viral reference images."

        "A figure (seen from behind) standing in open space — "
        "not in a building, not in any constructed architecture. "
        "Arms slightly extended at sides, palms turned gently outward — "
        "the specific posture of tuning in, not of supplication. "
        "The figure is receiving, not waiting. The body is open, present, relaxed. "
        "Figure occupies 50% of the frame, centered."

        "SURROUNDING the figure in all directions: "
        "deep saturated VIOLET-PURPLE atmospheric field (#7c3aed) — "
        "not a beam, not a spotlight, but an ATMOSPHERE, "
        "a field of colored sacred light that fills the upper 70% of the image "
        "like being inside a frequency made visible. "
        "This violet field has depth and dimension — layered, atmospheric, warm."

        "SPIRAL ENERGY PATTERNS: visible, specific, organic — "
        "concentric rings and Fibonacci spirals of violet light "
        "radiating outward from the figure as the center of the field. "
        "They are visible and luminous, not subtle — "
        "this is electromagnetic sacred geometry made visible."

        "WITHIN the violet field: deep cosmic space is visible — "
        "distant star field and subtle nebula colors (deep blue, purple, touches of teal) "
        "creating atmospheric cosmic depth behind the violet field."

        "Color palette: RICH COSMIC PALETTE — "
        "dominant deep violet-purple (#7c3aed) for the field, "
        "warm amber-gold at the core nearest the figure's body, "
        "deep cosmic blue-purple for the background star field. "
        "The figure in warm realistic tones — contrast with the cosmic field."

        "Lighting: the violet field IS the light source — ambient, omnidirectional, "
        "surrounding the figure without casting shadows. "
        "Warm amber glow at the figure's core where their energy meets the field."

        "Rich painterly quality — detailed figure, deep atmospheric field, luminous spirals. "
        "Lower 30% fades to deep violet-tinged shadow for text. "
        "Vertical 4:5. No text."
    ),
  },

  # ── S10 — CTA FIXO — text_only ───────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "text_only",
    "gen_image": False,
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de reconectar você "
        "com o campo sagrado original usando o Desbloqueio Neural."
    ),
    "prompt": None,
  },

]


# ── Engine ─────────────────────────────────────────────────────────────────────
def gen(prompt: str, retries: int = 4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            time.sleep(14 * attempt)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body = json.loads(r.read())
            parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            ip = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if ip:
                return base64.b64decode(ip["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body)[:150]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:120]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


# ── Execução ───────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Carrossel v3 (pictórico) — {TEMA}")
print(f"  Formato: {FORMATO} | Preset: {PRESET} | Slides: {len(slides)}")
print(f"  Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print(f"{'='*60}\n")

ok = 0
for i, s in enumerate(slides):
    print(f"[{s['num']}/{len(slides):02d}] {s['layout'].upper()} [{s['estado']}] — {s['title'].splitlines()[0][:40]}...")

    img = None
    if s["gen_image"]:
        prompt_final = build_prompt(s["prompt"])
        img = gen(prompt_final)
        if not img:
            print("  FALHOU\n")
            continue
    else:
        print("  (sem imagem — text_only)")

    final = compose(img, s["title"], s["body"], s["layout"], preset_name=PRESET)

    slug = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
    out  = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"  OK: {out.name}\n")
    ok += 1

    if i < len(slides) - 1 and s["gen_image"]:
        time.sleep(5)

print(f"{'='*60}")
print(f"  CONCLUIDO: {ok}/{len(slides)} slides")
print(f"{'='*60}\n")

# ── Registro no Dashboard ──────────────────────────────────────────────────────
register(
    title         = TEMA,
    theme         = TEMA_SLUG,
    format        = FORMATO,
    slides_dir    = str(OUT_DIR),
    caption       = CAPTION,
    revisor_score = REVISOR_SCORE,
    notes         = NOTAS,
)
