#!/usr/bin/env python3
"""
download_reel.py — Baixa um reel/vídeo via yt-dlp e imprime o caminho do arquivo.
Uso: python download_reel.py <url> <output_template>
"""
import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import yt_dlp


class SilentLogger:
    def debug(self, msg): pass
    def info(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): pass

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Uso: download_reel.py <url> <output_template>"}))
        sys.exit(1)

    url      = sys.argv[1]
    template = sys.argv[2]

    ydl_opts = {
        "outtmpl": template,
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "merge_output_format": "mp4",
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "logger": SilentLogger(),
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info     = ydl.extract_info(url, download=True)
            filepath = ydl.prepare_filename(info)
            # yt-dlp pode salvar como .webm ou .mkv mesmo pedindo mp4
            for ext in [".webm", ".mkv"]:
                if filepath.endswith(ext):
                    import glob
                    mp4 = filepath.replace(ext, ".mp4")
                    if os.path.exists(mp4):
                        filepath = mp4
                    else:
                        # tenta achar qualquer mp4 com o mesmo id
                        pattern = filepath.replace(ext, ".mp4")
                        matches = glob.glob(pattern)
                        if matches:
                            filepath = matches[0]
            title = info.get("title", "reel")
            print(json.dumps({"file": filepath, "title": title}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
