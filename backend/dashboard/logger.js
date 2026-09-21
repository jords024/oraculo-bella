// dashboard/logger.js — Logger centralizado com timestamp de Brasília
// Formata todos os logs com: [DATA HORA-BRT] [TIPO] mensagem

const TZ = "America/Sao_Paulo";

/**
 * Retorna o timestamp atual formatado no fuso de Brasília.
 * Exemplo: "24/06/2025 12:04:37"
 */
function timestamp() {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    year:   "numeric",
    month:  "2-digit",
    day:    "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date()).replace(",", "");
}

/**
 * Formata uma linha de log completa.
 * @param {string} level  — INFO | WARN | ERROR | DEBUG
 * @param {string} tag    — Prefixo opcional (ex: "[Backup]", "[DB]")
 * @param {...any} args   — Argumentos originais
 */
function format(level, tag, ...args) {
  const ts = timestamp();
  const prefix = `[${ts}] [${level}]${tag ? " " + tag : ""}`;
  return [prefix, ...args];
}

// ── API pública ───────────────────────────────────────────────────────────────

export const logger = {
  /**
   * Log informativo (substitui console.log)
   * @param {string} [tag] — Prefixo opcional entre colchetes, ex: "[Backup]"
   * @param {...any} args
   */
  info(tag, ...args) {
    if (typeof tag !== "string" || !tag.startsWith("[")) {
      // Chamado sem tag: logger.info("mensagem direta")
      console.log(...format("INFO", null, tag, ...args));
    } else {
      console.log(...format("INFO", tag, ...args));
    }
  },

  /**
   * Log de aviso (substitui console.warn)
   */
  warn(tag, ...args) {
    if (typeof tag !== "string" || !tag.startsWith("[")) {
      console.warn(...format("WARN", null, tag, ...args));
    } else {
      console.warn(...format("WARN", tag, ...args));
    }
  },

  /**
   * Log de erro (substitui console.error)
   */
  error(tag, ...args) {
    if (typeof tag !== "string" || !tag.startsWith("[")) {
      console.error(...format("ERROR", null, tag, ...args));
    } else {
      console.error(...format("ERROR", tag, ...args));
    }
  },

  /**
   * Log de debug (apenas em NODE_ENV !== "production")
   */
  debug(tag, ...args) {
    if (process.env.NODE_ENV === "production") return;
    if (typeof tag !== "string" || !tag.startsWith("[")) {
      console.log(...format("DEBUG", null, tag, ...args));
    } else {
      console.log(...format("DEBUG", tag, ...args));
    }
  },
};

export default logger;
