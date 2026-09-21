import express from "express";
import carouselsCrudRouter from "./carouselsCrud.js";
import carouselsMediaRouter from "./carouselsMedia.js";
import carouselsPublishRouter from "./carouselsPublish.js";
import carouselsGenerateRouter from "./carouselsGenerate.js";

const router = express.Router();

// ── Montagem modular dos sub-routers de Carrosséis ───────────────────────────
router.use(carouselsCrudRouter);
router.use(carouselsMediaRouter);
router.use(carouselsPublishRouter);
router.use(carouselsGenerateRouter);

export default router;
