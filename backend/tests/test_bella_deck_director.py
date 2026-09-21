import sys
from pathlib import Path


BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from core.util.deck_director import direct_deck, layout_uses_generated_image
from core.util.prompt_builder import build_prompt


def _slides(total=5):
    return [
        {
            "title": f"Título {index}",
            "body": "Você pode permanecer em si mesmo quando alguém não gosta do seu limite.",
            "layout": "fullbleed",
            "prompt": "Retrato emocional",
        }
        for index in range(1, total + 1)
    ]


def test_editorial_deck_receives_sequence_and_recurring_scenes():
    slides, deck = direct_deck(_slides(5), "bella_editorial_luxo")

    assert [slide["layout"] for slide in slides] == [
        "bella_sequence_01",
        "bella_sequence_02",
        "bella_sequence_03",
        "bella_sequence_04",
        "bella_sequence_05",
    ]
    assert slides[0]["scene"] == "A"
    assert slides[2]["scene"] == "A"
    assert slides[1]["scene"] is None
    assert "limite" in deck["theme"] or "pertencimento" in deck["theme"]


def test_type_pages_do_not_request_generated_images():
    assert not layout_uses_generated_image("bella_sequence_02")
    assert not layout_uses_generated_image("bella_sequence_04")
    assert not layout_uses_generated_image("bella_sequence_08")
    assert layout_uses_generated_image("bella_sequence_01")


def test_declared_scene_is_preserved_when_valid():
    source = _slides(1)
    source[0]["scene"] = "C"
    slides, _ = direct_deck(source, "bella_editorial_luxo")
    assert slides[0]["scene"] == "C"


def test_different_contents_do_not_share_one_fixed_visual_recipe():
    directions = set()
    for theme in (
        "prosperidade que não exige sacrifício",
        "a raiva que protege o seu limite",
        "o corpo cansado de sustentar tudo",
        "quando o silêncio vira abandono",
        "a coragem de ocupar espaço",
        "voltar a desejar depois da perda",
    ):
        source = _slides(3)
        source[0]["title"] = theme
        _, deck = direct_deck(source, "bella_editorial_luxo")
        directions.add(deck["art_direction_id"])

    assert len(directions) >= 3


def test_live_direction_does_not_force_a_real_35mm_portrait():
    prompt = build_prompt(
        "a symbolic world opening around a boundary",
        "bella_editorial_luxo",
        title="Você pode prosperar sem se abandonar",
        body="Seu valor não depende de exaustão.",
        layout="bella_sequence_01",
    )
    assert "mixed-media collage" in prompt
    assert "A person is optional" in prompt
    assert "Luxury analog 35mm" not in prompt
