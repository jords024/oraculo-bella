#!/usr/bin/env node
/**
 * Nano Banana MCP Server
 * Geração de imagens via Gemini Image Generation API (Google)
 * Para uso nos carrosséis da Fonte Oculta
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  process.stderr.write("❌ GEMINI_API_KEY não definida. Configure a variável de ambiente.\n");
  process.exit(1);
}

const MODELS = {
  flash: "gemini-2.5-flash-image",
  pro: "gemini-3-pro-image-preview",
};

const server = new McpServer({
  name: "nano-banana",
  version: "1.0.0",
});

// ─── TOOL: Gerar imagem ────────────────────────────────────────────────────────
server.tool(
  "generate_image",
  "Gera uma imagem usando o Nano Banana (Gemini Image Generation). Retorna a imagem gerada.",
  {
    prompt: z.string().describe("Descrição detalhada da imagem a gerar em inglês"),
    save_path: z
      .string()
      .optional()
      .describe(
        "Caminho completo para salvar a imagem (ex: C:/Users/julia/Desktop/slide1.png). Se não informado, retorna base64."
      ),
    model: z
      .enum(["flash", "pro"])
      .default("flash")
      .describe("flash = rápido | pro = maior qualidade"),
  },
  async ({ prompt, save_path, model }) => {
    const modelId = MODELS[model];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

    let body;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-goog-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
      });

      body = await response.json();

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Erro da API (${response.status}): ${JSON.stringify(body?.error || body)}`,
            },
          ],
        };
      }
    } catch (err) {
      return {
        content: [{ type: "text", text: `❌ Erro de conexão: ${err.message}` }],
      };
    }

    // Extrair imagem da resposta
    const parts = body?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));

    if (!imagePart) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Nenhuma imagem retornada. Resposta: ${JSON.stringify(body).slice(0, 500)}`,
          },
        ],
      };
    }

    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType; // ex: image/png

    // Salvar em arquivo se save_path informado
    if (save_path) {
      try {
        const buffer = Buffer.from(base64Data, "base64");
        const dir = path.dirname(save_path);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(save_path, buffer);
        return {
          content: [
            {
              type: "text",
              text: `✅ Imagem salva com sucesso em:\n${save_path}\n\nModelo usado: ${modelId}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `❌ Erro ao salvar: ${err.message}` }],
        };
      }
    }

    // Retornar como imagem inline (visível no chat)
    return {
      content: [
        {
          type: "image",
          data: base64Data,
          mimeType: mimeType,
        },
        {
          type: "text",
          text: `✅ Imagem gerada com sucesso! Modelo: ${modelId}`,
        },
      ],
    };
  }
);

// ─── TOOL: Gerar slide completo Fonte Oculta ───────────────────────────────────
server.tool(
  "generate_carousel_slide",
  "Gera uma imagem de fundo para slide de carrossel da Fonte Oculta. Estilo: dark, místico, quântico.",
  {
    tema: z
      .string()
      .describe(
        "Tema do slide (ex: 'frequência quântica', 'sistema nervoso', 'DNA epigenética', 'portal sonoro')"
      ),
    save_path: z
      .string()
      .optional()
      .describe("Caminho para salvar (ex: C:/Users/julia/Desktop/slide1.png)"),
  },
  async ({ tema, save_path }) => {
    const prompt = `Mystical dark artistic illustration for Instagram carousel. Theme: ${tema}. Style: dark cosmic background almost black, ethereal glowing energy fields in gold and electric blue, spiritual quantum aesthetic, cinematic dramatic lighting, AI art style, highly detailed, moody atmosphere, no text, no watermarks, portrait format 1:1, photorealistic mixed with surreal mystical elements. The image should evoke consciousness, quantum physics, frequency, vibration and spiritual awakening.`;

    const modelId = MODELS.flash;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

    let body;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-goog-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      });

      body = await response.json();

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Erro da API (${response.status}): ${JSON.stringify(body?.error || body)}`,
            },
          ],
        };
      }
    } catch (err) {
      return {
        content: [{ type: "text", text: `❌ Erro de conexão: ${err.message}` }],
      };
    }

    const parts = body?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));

    if (!imagePart) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Nenhuma imagem retornada. Resposta: ${JSON.stringify(body).slice(0, 500)}`,
          },
        ],
      };
    }

    const base64Data = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;

    if (save_path) {
      const buffer = Buffer.from(base64Data, "base64");
      const dir = path.dirname(save_path);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(save_path, buffer);
      return {
        content: [
          {
            type: "text",
            text: `✅ Slide gerado e salvo em:\n${save_path}`,
          },
        ],
      };
    }

    return {
      content: [
        { type: "image", data: base64Data, mimeType },
        { type: "text", text: `✅ Imagem de slide gerada! Tema: ${tema}` },
      ],
    };
  }
);

// ─── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
