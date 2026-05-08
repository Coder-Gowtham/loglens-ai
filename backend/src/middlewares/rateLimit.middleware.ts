import rateLimit from "express-rate-limit";

export const globalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 100,

    message: {
        message: "Too many requests, please try again later",
    },

    standardHeaders: true,

    legacyHeaders: false,
});

export const authRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute

    max: 5,

    message: {
        message: "Too many login attempts, please try again later",
    },

    standardHeaders: true,

    legacyHeaders: false,
});