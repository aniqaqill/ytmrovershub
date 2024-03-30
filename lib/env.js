"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.env = void 0;
var _envNextjs = require("@t3-oss/env-nextjs");
var _zod = require("zod");
var env = exports.env = (0, _envNextjs.createEnv)({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: _zod.z.string().url().refine(function (str) {
      return !str.includes("YOUR_MYSQL_URL_HERE");
    }, "You forgot to change the default URL"),
    NODE_ENV: _zod.z["enum"](["development", "test", "production"])["default"]("development"),
    NEXTAUTH_SECRET: process.env.NODE_ENV === "production" ? _zod.z.string() : _zod.z.string().optional(),
    NEXTAUTH_URL: _zod.z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    function (str) {
      var _process$env$VERCEL_U;
      return (_process$env$VERCEL_U = process.env.VERCEL_URL) !== null && _process$env$VERCEL_U !== void 0 ? _process$env$VERCEL_U : str;
    },
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? _zod.z.string() : _zod.z.string().url()),
    DISCORD_CLIENT_ID: _zod.z.string(),
    DISCORD_CLIENT_SECRET: _zod.z.string()
  },
  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true
});