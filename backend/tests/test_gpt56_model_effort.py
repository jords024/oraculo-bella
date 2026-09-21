from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read(relative_path):
    return (ROOT / relative_path).read_text(encoding="utf-8")


def test_creator_exposes_current_gpt56_family_and_three_effort_levels():
    selector = read("frontend/src/components/Criador/ModelExperienceSelector.jsx")
    for model in ("gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna"):
        assert model in selector
    for effort in ("low", "medium", "high"):
        assert f"id: '{effort}'" in selector


def test_creator_sends_reasoning_effort_to_backend():
    creator = read("frontend/src/components/Criador.jsx")
    assert "reasoningEffort" in creator
    assert "criador_reasoning_effort" in creator


def test_backend_uses_responses_api_with_validated_model_and_effort():
    route = read("backend/dashboard/routes/carousels/carouselsGenerate.js")
    assert "https://api.openai.com/v1/responses" in route
    assert "reasoning: { effort: activeEffort }" in route
    assert "const allowedModels = ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna']" in route
    assert "const allowedEfforts = ['low', 'medium', 'high']" in route
    assert "response.output_text.delta" in route


def test_terra_medium_are_the_safe_defaults():
    creator = read("frontend/src/components/Criador.jsx")
    route = read("backend/dashboard/routes/carousels/carouselsGenerate.js")
    assert "'gpt-5.6-terra'" in creator
    assert "'medium'" in creator
    assert "? model : 'gpt-5.6-terra'" in route
    assert "reasoningEffort) ? reasoningEffort : 'medium'" in route
