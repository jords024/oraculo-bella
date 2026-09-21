import json
import random
import time
import psycopg2

PROMPT_THEMES = [
    "Retrato realista de empresário futurista em escritório high-tech",
    "Cachorro da raça Golden Retriever correndo em campo de girassóis",
    "Carrossel minimalista sobre Inteligência Artificial para Instagram",
    "Templo místico nas montanhas com iluminação cinematográfica dourada",
    "Design 3D de produto cosmético com fundo neon e reflexos de água",
    "Mulher moderna trabalhando com laptop em cafeteria aconchegante",
    "Arte conceitual cyberpunk com carros voadores e luzes azuis e magentas",
    "Ilustração editorial de finanças pessoais e liberdade geográfica",
    "Design de interface moderna para aplicativo de saúde e bem-estar",
    "Paisagem tropical ao pôr do sol com palmeiras e degradê suave",
    "Fotografia macro de gotas de orvalho em pétalas de rosa vermelha",
    "Robô amigável ajudando humano no estúdio de design e criação",
    "Estúdio fotográfico profissional com iluminação softbox dramática",
    "Arquitetura moderna escandinava com madeira clara e vidro",
    "Carrossel educativo sobre copywriting persuasivo e gatilhos mentais",
    "Astronauta explorando planeta alienígena com plantas bioluminescentes",
    "Xícara de café com arte latte sofisticada vista de cima",
    "Gráficos 3D de crescimento exponencial de métricas de marketing",
    "Moda urbana contemporânea com casaco neon e estilo streetwear",
    "Floresta encantada com névoa mística e raios de sol entre as árvores"
]

def seed_1000_generated_images():
    print("[INFO] Iniciando seed de 1.000 imagens geradas no banco de dados...")
    
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="123456",
        database="oracle_manager"
    )
    cur = conn.cursor()

    user_email = "aryarajmarketing@gmail.com"
    base_time = int(time.time())

    generated_images = []
    
    for i in range(1, 1001):
        theme = random.choice(PROMPT_THEMES)
        prompt = f"{theme} #{i}"
        gen_id = f"gen_seed_{base_time}_{i}"
        filename = f"gen_seed_{i}.svg"
        img_url = f"/api/library/generated/{filename}"
        
        created_at_ts = base_time - (1000 - i) * 120 # Espaçados a cada 2 minutos
        created_at_str = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(created_at_ts))

        item = {
            "id": gen_id,
            "imageUrl": img_url,
            "filename": filename,
            "prompt": prompt,
            "generatedPrompt": f"Direção de Arte: {prompt}. Renderização 8K, hiper-detalhado, iluminação cinematográfica e cores vibrantes.",
            "referenceIds": [],
            "createdAt": created_at_str
        }
        generated_images.append(item)

    # Inverte para que as mais recentes fiquem no topo
    generated_images.reverse()

    cur.execute(
        """
        INSERT INTO library_chats (user_email, messages, generated_images, updated_at)
        VALUES (%s, '[]'::jsonb, %s::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (user_email) DO UPDATE
        SET generated_images = %s::jsonb, updated_at = CURRENT_TIMESTAMP;
        """,
        (user_email, json.dumps(generated_images), json.dumps(generated_images))
    )

    conn.commit()
    cur.close()
    conn.close()
    print(f"[OK] 1.000 imagens geradas inseridas com sucesso para o usuario {user_email}.")

if __name__ == "__main__":
    seed_1000_generated_images()
