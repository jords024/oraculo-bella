import express from "express";
import settingsApiKeysRouter from "./settingsApiKeys.js";
import settingsPromptsRouter from "./settingsPrompts.js";
import settingsBrandingRouter from "./settingsBranding.js";
import oraculoAndReelsRouter from "./oraculoAndReels.js";
import statsAndLogsRouter from "./statsAndLogs.js";
import financialRouter from "./financial.js";

const router = express.Router();

// ── Montagem dos sub-routers de Serviços e Configurações ─────────────────────
router.use(settingsApiKeysRouter);
router.use(settingsPromptsRouter);
router.use(settingsBrandingRouter);
router.use(oraculoAndReelsRouter);
router.use(statsAndLogsRouter);
router.use(financialRouter);

export default router;

