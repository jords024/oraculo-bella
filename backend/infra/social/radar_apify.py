import json
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("APIFY_API_KEY")
ACTOR_URL = f"https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token={API_KEY}"

OUTPUT_FILE = "C:/Users/julia/nano-banana-mcp/dashboard/data/radar_data.json"

QUERIES = [
    "física quântica expansão da consciência",
    "arqueologia proibida mistérios do passado",
    "psilocibina cogumelos tratamento mental neurociência",
    "anomalias espaço tempo universo",
    "epigenética cura mente corpo"
]

def fetch_radar():
    all_results = []

    # Executamos uma única query combinada ou enviamos uma lista (o scraper aceita \n na query)
    payload = {
        "queries": "\n".join(QUERIES),
        "maxPagesPerQuery": 1,
        "resultsPerPage": 3, # Pegar as top 3 de cada
        "csvFriendlyOutput": False
    }

    print("📡 Acionando Apify Google Search Scraper...")
    try:
        response = requests.post(ACTOR_URL, json=payload, timeout=300)
        if response.status_code != 201 and response.status_code != 200:
            print(f"Erro na API Apify: {response.status_code}")
            print(response.text)
            sys.exit(1)

        data = response.json()

        # O Apify retorna uma lista onde cada item tem "organicResults" ou "newsResults"
        for item in data:
            # Tentar pegar os resultados
            results = item.get("organicResults", [])
            query_used = item.get("searchQuery", {}).get("term", "")

            for res in results:
                title = res.get("title", "")
                snippet = res.get("description", "")
                link = res.get("url", "")

                if not title:
                    continue

                all_results.append({
                    "title": title,
                    "snippet": snippet,
                    "link": link,
                    "query": query_used,
                    "source": "Google Scholar/Search",
                    "date": "Recente" # o scraper às vezes traz data no snippet
                })

        print(f"✅ Apify finalizado. {len(all_results)} resultados encontrados.")

        # Salvar
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2)

    except Exception as e:
        print(f"Erro fatal: {e}")
        sys.exit(1)

if __name__ == "__main__":
    fetch_radar()
