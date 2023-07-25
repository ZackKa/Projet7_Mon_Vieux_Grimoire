const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes.
    max: process.env.BRUT_FORCE_NBR_CONNECTION_MAX, // Limite de requête définit dans le .env (ici, par 15 minutes).
    standardHeaders: true, // Return rate limit info dans les en-têtes `RateLimit-*`.
    legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*` .
});

module.exports = limiter;