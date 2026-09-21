import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  readDataAsync, 
  getSlidesForCarousel, 
  getCarouselCostDetails 
} from "../../helpers.js";

import { query } from "../../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// ── API: Stats ───────────────────────────────────────────────────────────────
router.get("/api/stats", async (req, res) => {
  const all = await readDataAsync();
  const statusCount = {};
  let totalSlides = 0;
  let totalCostBrl = 0;

  all.forEach(c => {
    statusCount[c.status] = (statusCount[c.status] || 0) + 1;
    const slides = getSlidesForCarousel(c);
    totalSlides += slides.length;
    
    const costDetails = getCarouselCostDetails(c);
    const costUsd = Number(costDetails.cost) || 0;
    const costBrl = costUsd * 5.0; // Converter USD -> BRL (taxa 5.0)
    totalCostBrl += costBrl;
  });

  try {
    const extraCostsRes = await query(`
      SELECT SUM(cost_brl) as extra_brl 
      FROM usage_costs 
      WHERE type IN ('agent_prompt', 'image_generation', 'slide_regenerate', 'carousel_retry')
    `);
    if (extraCostsRes && extraCostsRes.rows && extraCostsRes.rows[0]?.extra_brl) {
      totalCostBrl += Number(extraCostsRes.rows[0].extra_brl) || 0;
    }
  } catch (e) {}

  const roundedCostBrl = Math.round(totalCostBrl * 100) / 100;

  res.json({
    totalCarousels: all.length,
    totalSlides,
    byStatus: statusCount,
    totalCostBrl: roundedCostBrl,
    lastUpdated: new Date().toISOString(),
    total: all.length,
    slides: totalSlides,
    aprovados: (statusCount['aprovado'] || 0) + (statusCount['pronto'] || 0),
    publicados: statusCount['publicado'] || 0,
    cost: roundedCostBrl,
  });
});

// ── API: Visualizador de Logs ──────────────────────────────────────────────────
router.get("/api/logs", async (req, res) => {
  const LOGS_FILE = path.join(__dirname, "..", "..", "..", "logs", "app.log");
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      return res.json({ logs: [], totalLines: 0, availableDates: [], status: { whatsapp: true, rabbitmq: true } });
    }

    const { date, level, search, limit = 2000 } = req.query;
    const content = fs.readFileSync(LOGS_FILE, "utf-8");
    const rawLines = content.split("\n").filter(Boolean);

    // Obter datas únicas com logs
    const datesSet = new Set();
    rawLines.forEach(line => {
      const parts = line.split(" - ");
      if (parts.length >= 4) {
        const datetime = parts[0];
        const datePart = datetime.split(" ")[0]; // DD/MM/YYYY
        if (datePart && /^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
          datesSet.add(datePart);
        }
      }
    });
    const availableDates = Array.from(datesSet).reverse(); // Mais recente primeiro

    let filterDate = date;
    if (!filterDate && availableDates.length > 0) {
      filterDate = availableDates[0]; // Padrão: mais recente
    }

    // Converter YYYY-MM-DD para DD/MM/YYYY
    if (filterDate && filterDate.includes("-")) {
      const dateParts = filterDate.split("-");
      if (dateParts.length === 3) {
        filterDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      }
    }

    let parsed = rawLines.map((line, idx) => {
      const parts = line.split(" - ");
      if (parts.length >= 4) {
        const datetime = parts[0];
        const tag = parts[1];
        const lvl = parts[2];
        const msg = parts.slice(3).join(" - ");
        return { id: idx + 1, datetime, tag, level: lvl, message: msg };
      }
      return { id: idx + 1, datetime: "", tag: "SYSTEM", level: "INFO", message: line };
    });

    if (filterDate) {
      parsed = parsed.filter(l => l.datetime.startsWith(filterDate));
    }
    
    if (level) {
      parsed = parsed.filter(l => l.level === level.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      parsed = parsed.filter(l => 
        l.message.toLowerCase().includes(q) || 
        l.tag.toLowerCase().includes(q)
      );
    }

    const totalLines = parsed.length;
    const limited = parsed.slice(-Number(limit));

    res.json({
      logs: limited,
      totalLines,
      availableDates,
      selectedDate: filterDate,
      status: {
        whatsapp: true,
        rabbitmq: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/api/logs", async (req, res) => {
  const LOGS_FILE = path.join(__dirname, "..", "..", "..", "logs", "app.log");
  try {
    if (fs.existsSync(LOGS_FILE)) {
      fs.writeFileSync(LOGS_FILE, "", "utf-8");
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/logs/delete-items", async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "O parâmetro 'ids' deve ser um array." });
  }
  const LOGS_FILE = path.join(__dirname, "..", "..", "..", "logs", "app.log");
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      return res.json({ ok: true });
    }
    const content = fs.readFileSync(LOGS_FILE, "utf-8");
    const rawLines = content.split("\n").filter(Boolean);
    const newLines = rawLines.filter((_, idx) => !ids.includes(idx + 1));
    fs.writeFileSync(LOGS_FILE, newLines.join("\n") + (newLines.length > 0 ? "\n" : ""), "utf-8");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
