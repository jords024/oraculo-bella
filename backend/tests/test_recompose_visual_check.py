import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from core.util.compose_util import compose

# Test composition with title_y = 698 and body_y = 1183
dummy_img = Image.new("RGB", (1080, 1350), color=(40, 20, 10))
img_bytes = Path(__file__).parent / "dummy.jpg"
dummy_img.save(img_bytes)

output_path = Path(__file__).parent / "output_test_y.jpg"

res = compose(
    img_bytes=img_bytes.read_bytes(),
    title="DINHEIRO OU VALOR?",
    body='"Você acha que dinheiro traz felicidade?\nPense novamente."',
    layout="fullbleed",
    preset_name="manuscrito_sagrado",
    title_y=698,
    body_y=1183
)

res.save(output_path)
print(f"Sucesso ao salvar teste visual em {output_path}")
