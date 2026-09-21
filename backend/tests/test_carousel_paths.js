import assert from "node:assert/strict";
import { test } from "node:test";
import path from "path";
import fs from "fs";
import { getLocalSlidesDir } from "../dashboard/helpers.js";

test("Deve mapear corretamente um caminho com padrão Windows para o volume persistente no Linux", () => {
  // Simula a execução em Linux
  const originalPlatform = process.platform;
  Object.defineProperty(process, 'platform', { value: 'linux' });

  try {
    const carouselMock = {
      slidesDir: "C:\\Users\\julia\\Desktop\\carrossel-05-a-noite-em-que-o-dinheiro-perdeu-a-alma"
    };

    const result = getLocalSlidesDir(carouselMock);
    const normalizedResult = result.replace(/\\/g, '/');
    assert.strictEqual(
      normalizedResult,
      "/app/backend/storage/carousels/carrossel-05-a-noite-em-que-o-dinheiro-perdeu-a-alma"
    );
  } finally {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  }
});

test("Deve resolver caminhos dinamicamente no Windows caso contenham o usuário julia", () => {
  if (process.platform !== 'win32') return; // Executa apenas no ambiente Windows do host

  const carouselMock = {
    slidesDir: "C:\\Users\\julia\\Desktop\\carrossel-niceia"
  };

  const result = getLocalSlidesDir(carouselMock);
  
  // O resultado deve conter o perfil do usuário atual em vez de julia
  assert.ok(!result.includes("julia") || process.env.USERPROFILE.includes("julia"));
  assert.ok(result.endsWith("carrossel-niceia"));
});
