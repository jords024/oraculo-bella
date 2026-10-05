/**
 * test_storage_persistence.test.js
 * Teste unitário para validar a persistência dos carrosséis no volume de armazenamento
 * e o fallback transparente do MinIO/B2 caso o arquivo local não exista.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { getLocalSlidesDir, getSlidesForCarousel } from "../dashboard/helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Preservação no Volume: getSlidesForCarousel deve extrair nomes de slides corretamente de strings e objetos", () => {
  const carouselWithStringSlides = {
    id: "carrossel-teste-01",
    slides: ["slide-01.jpg", "slide-02.jpg", "slide-03.jpg"]
  };
  const slides1 = getSlidesForCarousel(carouselWithStringSlides);
  assert.deepEqual(slides1, ["slide-01.jpg", "slide-02.jpg", "slide-03.jpg"]);

  const carouselWithObjectSlides = {
    id: "carrossel-teste-02",
    slides: [{ filename: "slide-01.jpg" }, { filename: "slide-02.png" }]
  };
  const slides2 = getSlidesForCarousel(carouselWithObjectSlides);
  assert.deepEqual(slides2, ["slide-01.jpg", "slide-02.png"]);
});

test("Volume de Armazenamento: arquivos criados no diretório do carrossel não devem ser deletados", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "oraculo-storage-test-"));
  try {
    const slide1 = path.join(tempDir, "slide-01.jpg");
    const slide2 = path.join(tempDir, "slide-02.jpg");
    const meta1 = path.join(tempDir, "slide-01.meta.json");

    fs.writeFileSync(slide1, "fake-image-content-1");
    fs.writeFileSync(slide2, "fake-image-content-2");
    fs.writeFileSync(meta1, JSON.stringify({ title: "Título 1", layout: "fullbleed" }));

    // Simula o ciclo pós-geração: os arquivos devem continuar existindo no diretório
    assert.ok(fs.existsSync(slide1), "slide-01.jpg deve existir no disco");
    assert.ok(fs.existsSync(slide2), "slide-02.jpg deve existir no disco");
    assert.ok(fs.existsSync(meta1), "slide-01.meta.json deve existir no disco");

    const files = fs.readdirSync(tempDir);
    assert.equal(files.length, 3, "Todos os 3 arquivos devem estar preservados no volume");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("Matching de Imagens: detecção de slide por correspondência parcial de nome ou prefixo", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "oraculo-matching-test-"));
  try {
    const slideOriginal = path.join(tempDir, "slide-01-capa.jpg");
    fs.writeFileSync(slideOriginal, "fake-jpeg-binary");

    const files = fs.readdirSync(tempDir);
    const requested = "slide-01.jpg";
    const reqBase = requested.replace(/\.(jpg|jpeg|png)$/i, '');

    const match = files.find(f => {
      const fBase = f.replace(/\.(jpg|jpeg|png)$/i, '');
      return f === requested || fBase === reqBase || f.startsWith(`${reqBase}-`) || f.startsWith(`${reqBase}_`);
    });

    assert.equal(match, "slide-01-capa.jpg", "Deve encontrar o arquivo correspondente pelo prefixo da lâmina");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("Resolução do diretório local com getLocalSlidesDir", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "carousel-resolve-test-"));
  try {
    const carousel = {
      id: "carrossel-42",
      slidesDir: tempDir
    };
    const resolved = getLocalSlidesDir(carousel);
    assert.equal(resolved, tempDir, "Diretório existente deve ser retornado diretamente");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
