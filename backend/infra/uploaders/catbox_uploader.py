from pathlib import Path

import requests


def upload_slides(slides_dir: Path | str) -> list[str]:
    slides_dir = Path(slides_dir)
    slides = sorted(slides_dir.glob("slide-*.jpg"))
    urls = []
    print("\n[1/3] Enviando slides para Catbox.moe (Servidor Público Garantido)...")
    for slide in slides:
        print(f"      {slide.name}...", end=" ", flush=True)
        with open(slide, 'rb') as f:
            r = requests.post(
                "https://catbox.moe/user/api.php",
                data={"reqtype": "fileupload"},
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
                files={"fileToUpload": f}
            )

        url = r.text.strip()
        if r.status_code == 200 and url.startswith("http"):
            print("OK")
            urls.append(url)
        else:
            raise RuntimeError(f"Erro no upload para catbox: Status {r.status_code} | Resposta: '{url}'")

    print(f"      {len(urls)} slides enviados.\n")
    return urls
