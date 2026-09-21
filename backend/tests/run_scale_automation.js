import fs from 'fs';
import path from 'path';

async function run() {
  const loginUrl = "http://localhost:3131/auth/login";
  const createDraftUrl = "http://localhost:3131/api/carousels";
  const scaleUrl = "http://localhost:3131/api/escala/criar-mock";

  console.log("🚀 [Automação] Iniciando script de teste de escala...");

  try {
    // 1. Login
    console.log("🔑 [Automação] Realizando login...");
    const loginRes = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "aryarajmarketing@gmail.com",
        password: "123456"
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Falha no login: ${loginRes.statusText}`);
    }
    
    const { token } = await loginRes.json();
    console.log("🔑 [Automação] Login bem-sucedido!");

    // 2. Criar rascunho com 3 slides e qualidade baixa
    console.log("📝 [Automação] Criando rascunho com 3 slides e qualidade baixa...");
    const draftPayload = {
      title: "SEU SALÁRIO NÃO É BAIXO. ELE É HERDADO.",
      theme: "dinheiro-herda-trauma",
      format: "A",
      slidesDir: "",
      caption: "Esta é a legenda de teste gerada de forma automatizada pelo pipeline local.",
      notes: "",
      totalSlides: 3,
      imageQuality: "low",
      status: "rascunho"
    };

    const draftRes = await fetch(createDraftUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(draftPayload)
    });

    if (!draftRes.ok) {
      throw new Error(`Falha ao criar rascunho: ${draftRes.statusText}`);
    }

    const newCarousel = await draftRes.json();
    const carouselId = newCarousel.id;
    console.log(`📝 [Automação] Rascunho criado com ID: ${carouselId}`);

    // 3. Executar o Teste de Escala (Mock)
    console.log(`⚡ [Automação] Disparando geração mock para o carrossel ${carouselId}...`);
    const scalePayload = {
      id: carouselId,
      title: "SEU SALÁRIO NÃO É BAIXO. ELE É HERDADO.",
      theme: "dinheiro-herda-trauma",
      format: "A",
      totalSlides: 3,
      imageQuality: "low",
      slides: [
        {
          num: "01",
          estado: "MOCK STAGE 1",
          layout: "text_only",
          title: "ESTRUTURA DE TESTE\nSLIDE 1 DE 3",
          body: "Este é um slide gerado automaticamente pelo simulador de teste de escala.\nO design será gerado com fundo preto com o texto por cima sem custos."
        },
        {
          num: "02",
          estado: "MOCK STAGE 2",
          layout: "text_only",
          title: "ESTRUTURA DE TESTE\nSLIDE 2 DE 3",
          body: "Este é um slide gerado automaticamente pelo simulador de teste de escala.\nO design será gerado com fundo preto com o texto por cima sem custos."
        },
        {
          num: "03",
          estado: "CTA FIXO",
          layout: "fullbleed",
          title: "COMENTE\nFONTE",
          body: "E eu te envio a Tecnologia Sonora capaz de romper o teto financeiro herdado usando o Desbloqueio Neural."
        }
      ]
    };

    const scaleRes = await fetch(scaleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(scalePayload)
    });

    if (!scaleRes.ok) {
      throw new Error(`Falha ao disparar mock: ${scaleRes.statusText}`);
    }

    console.log("⚡ [Automação] Pipeline mock iniciado. Aguardando finalização...");
    
    // 4. Aguardar a conclusão (geração e upload)
    await new Promise(resolve => setTimeout(resolve, 8000));

    // 5. Verificar o resultado no banco
    console.log("🔍 [Automação] Buscando carrossel para validar o resultado final...");
    const verifyRes = await fetch(`http://localhost:3131/api/carousels/${carouselId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!verifyRes.ok) {
      throw new Error(`Falha ao buscar carrossel para verificação: ${verifyRes.statusText}`);
    }

    const verified = await verifyRes.json();
    console.log("\n================ RESULTADO DA VALIDAÇÃO ================");
    console.log(`ID do Carrossel:   ${verified.id}`);
    console.log(`Título:            ${verified.title}`);
    console.log(`Tema:              ${verified.theme}`);
    console.log(`Total de Slides:   ${verified.totalSlides} (Esperado: 3)`);
    console.log(`Qualidade Imagem:  ${verified.imageQuality} (Esperado: low)`);
    console.log(`Status:            ${verified.status} (Esperado: pronto)`);
    console.log(`Slides Gerados:    ${verified.slides ? verified.slides.length : 0} slides`);
    console.log(`Lista de Slides:   ${JSON.stringify(verified.slides)}`);
    console.log("========================================================\n");

    if (verified.totalSlides === 3 && verified.imageQuality === "low" && verified.status === "pronto" && verified.slides.length === 3) {
      console.log("🎉 [Automação] SUCESSO! O carrossel foi gerado e validado perfeitamente com as configurações corretas!");
    } else {
      console.error("❌ [Automação] FALHA! O carrossel não possui os dados corretos conforme configurado.");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ [Automação] Ocorreu um erro na automação:", error.message);
    process.exit(1);
  }
}

run();
