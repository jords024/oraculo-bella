import os

import requests
from dotenv import load_dotenv

load_dotenv()

ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
IG_USER_ID = os.getenv("INSTAGRAM_ACCOUNT_ID")
API_VERSION = "v25.0"
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"

def fetch_media(limit=50):
    url = f"{BASE_URL}/{IG_USER_ID}/media"
    params = {
        "fields": "id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count",
        "access_token": ACCESS_TOKEN,
        "limit": limit
    }

    media_list = []

    print("Buscando mídia do perfil...")
    while url:
        response = requests.get(url, params=params)
        data = response.json()

        if "error" in data:
            print(f"Erro na API: {data['error']}")
            break

        for item in data.get("data", []):
            if item.get("media_type") == "VIDEO":
                media_list.append(item)

        # Handle pagination
        paging = data.get("paging", {})
        url = paging.get("next")
        params = None # Parameters are already in the next URL

        # Para não demorar muito, limitamos a 100 reels
        if len(media_list) >= 100:
            break

    print(f"Encontrados {len(media_list)} vídeos/reels. Buscando views (plays)...")
    return media_list

def fetch_insights(media_id):
    url = f"{BASE_URL}/{media_id}/insights"
    params = {
        "metric": "plays,reach",
        "access_token": ACCESS_TOKEN
    }
    response = requests.get(url, params=params)
    data = response.json()

    plays = 0
    reach = 0
    if "data" in data:
        for item in data["data"]:
            if item["name"] == "plays":
                plays = item["values"][0]["value"]
            elif item["name"] == "reach":
                reach = item["values"][0]["value"]

    return plays, reach

def main():
    media_list = fetch_media()

    results = []
    for i, media in enumerate(media_list):
        print(f"Buscando insights {i+1}/{len(media_list)}...")
        plays, reach = fetch_insights(media["id"])
        media["plays"] = plays
        media["reach"] = reach
        results.append(media)

    # Sort by plays (views)
    results.sort(key=lambda x: x.get("plays", 0), reverse=True)

    print("\n" + "="*80)
    print("🏆 TOP 10 REELS MAIS ASSISTIDOS - @afonteoculta")
    print("="*80)

    for i, item in enumerate(results[:10]):
        caption = item.get("caption", "").split("\n")[0][:40] + "..." if item.get("caption") else "Sem legenda"
        caption = caption.replace("\n", " ")
        plays = item.get("plays", 0)
        likes = item.get("like_count", 0)
        comments = item.get("comments_count", 0)
        link = item.get("permalink", "")

        print(f"{i+1}. 👀 {plays:,} views | ❤️ {likes:,} likes | 💬 {comments:,} coments")
        print(f"   Título: {caption}")
        print(f"   Link: {link}")
        print("-" * 80)

if __name__ == "__main__":
    main()
