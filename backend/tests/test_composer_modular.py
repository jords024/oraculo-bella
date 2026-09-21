"""
Teste Unitário: Validação da Modularização do Motor de Composição (Composer).
Testa composição de slides em layouts: fullbleed, dramatico, etereo, text_only e card.
"""

import unittest
from io import BytesIO
from PIL import Image

from core.util.composer import (
    compose,
    compose_fullbleed,
    compose_dramatico,
    compose_etereo,
    compose_text_only,
    compose_card,
    get_preset,
    W, H
)

class TestComposerModular(unittest.TestCase):

    def setUp(self):
        # Cria uma imagem dummy em memória (1080x1350)
        img = Image.new("RGB", (W, H), color=(70, 50, 40))
        buf = BytesIO()
        img.save(buf, format="JPEG")
        self.dummy_bytes = buf.getvalue()

    def test_compose_fullbleed(self):
        result = compose(
            img_bytes=self.dummy_bytes,
            title="O Mistério Oculto",
            body="Este é um **texto em negrito** e *itálico* de teste.",
            layout="fullbleed",
            preset_name="manuscrito_sagrado"
        )
        self.assertEqual(result.size, (W, H))
        self.assertEqual(result.mode, "RGB")

    def test_compose_dramatico(self):
        result = compose(
            img_bytes=self.dummy_bytes,
            title="A Lei do Retorno",
            body="Toda ação gera uma reação **inevitável** no campo quântico.",
            layout="dramatico",
            preset_name="dramatico"
        )
        self.assertEqual(result.size, (W, H))

    def test_compose_text_only(self):
        result = compose(
            img_bytes=self.dummy_bytes,
            title="Princípio Hermético",
            body="O que está em cima é como o que está embaixo.\n\nA mente é o todo.",
            layout="text_only",
            preset_name="cinematografico"
        )
        self.assertEqual(result.size, (W, H))

    def test_compose_card(self):
        result = compose(
            img_bytes=self.dummy_bytes,
            title="Estudo Prático",
            body="Observe a frequência da sua vibração diária.",
            layout="card",
            preset_name="etereo_luminoso"
        )
        self.assertEqual(result.size, (W, H))

    def test_backward_compatibility_imports(self):
        from core.util.compose_util import compose as compose_v2
        from core.util.compose_util_v3 import compose as compose_v3

        res_v2 = compose_v2(self.dummy_bytes, "Teste V2", "Body V2", layout="fullbleed")
        res_v3 = compose_v3(self.dummy_bytes, "Teste V3", "Body V3", layout="fullbleed")
        self.assertEqual(res_v2.size, (W, H))
        self.assertEqual(res_v3.size, (W, H))


if __name__ == "__main__":
    unittest.main()
