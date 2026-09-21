"use strict";

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const slides = require("./slides");

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Afonteoculta";
  pres.title = "Sistema Autônomo de Criação de Conteúdo";

  console.log("Building slides...");
  slides.slide01(pres);
  console.log("  Slide 01 — Capa ✓");
  slides.slide02(pres);
  console.log("  Slide 02 — O que é o sistema ✓");
  slides.slide03(pres);
  console.log("  Slide 03 — Pipeline completo ✓");
  slides.slide04(pres);
  console.log("  Slide 04 — Os Agentes ✓");
  slides.slide05(pres);
  console.log("  Slide 05 — Oráculo Revisor ✓");
  slides.slide06(pres);
  console.log("  Slide 06 — Nano Banana 2 ✓");
  slides.slide07(pres);
  console.log("  Slide 07 — Lições 1M+ ✓");
  slides.slide08(pres);
  console.log("  Slide 08 — Anatomia do Carrossel ✓");
  slides.slide09(pres);
  console.log("  Slide 09 — 10 Novos Temas ✓");
  slides.slide10(pres);
  console.log("  Slide 10 — Resultados Produzidos ✓");
  slides.slide11(pres);
  console.log("  Slide 11 — Infraestrutura ✓");
  slides.slide12(pres);
  console.log("  Slide 12 — Próximos Passos ✓");

  const outPath = "C:/Users/julia/nano-banana-mcp/presentation/SistemaConteudo-Afonteoculta.pptx";
  
  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await pres.writeFile({ fileName: outPath });
    console.log(`\nPresentation saved to:\n  ${outPath}`);
  } catch (err) {
    const fallbackPath = path.join(__dirname, "SistemaConteudo-Afonteoculta.pptx");
    await pres.writeFile({ fileName: fallbackPath });
    console.log(`\nWarning: Could not write to primary path. Presentation saved to fallback:\n  ${fallbackPath}`);
  }
}

main().catch((err) => {
  console.error("Error generating presentation:", err);
  process.exit(1);
});
