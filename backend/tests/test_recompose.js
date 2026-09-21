async function run() {
  const loginUrl = "http://localhost:3131/auth/login";
  const recomposeUrl = "http://localhost:3131/api/carousels/carrossel-12/slide/slide-01.png/recompose";

  console.log("🚀 [Automação] Iniciando teste de recomposição de slide com MinIO...");

  try {
    // 1. Login
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

    // 2. Recompor slide-01.png
    console.log("⚡ [Automação] Disparando recomposição do slide-01.png...");
    const recomposeRes = await fetch(recomposeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "TÍTULO EDITADO VIA API",
        body: "Este slide foi modificado com sucesso utilizando a nova integração de sincronização com o S3/MinIO.",
        layout: "fullbleed"
      })
    });

    if (!recomposeRes.ok) {
      const err = await recomposeRes.json();
      throw new Error(`Falha ao recompor: ${JSON.stringify(err)}`);
    }

    const result = await recomposeRes.json();
    console.log("🎉 [Automação] Recomposição concluída com sucesso! Retorno:", result);

  } catch (error) {
    console.error("❌ [Automação] Ocorreu um erro no teste de recomposição:", error.message);
    process.exit(1);
  }
}

run();
