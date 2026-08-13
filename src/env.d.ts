/// <reference types="astro/client" />

/**
 * Version de l'application, injectée au build par `vite.define` (astro.config.mjs)
 * depuis `package.json`. Jointe à chaque événement `landing_*` sous la propriété
 * `app_version`, comme sur l'ancienne landing.
 */
declare const __APP_VERSION__: string;
