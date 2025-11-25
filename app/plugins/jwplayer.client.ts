/**
 * JW Player Nuxt Plugin
 *
 * This plugin loads the JW Player library from CDN and makes it available globally.
 * It runs only on the client side to avoid SSR issues.
 *
 * @see https://developer.jwplayer.com/
 */

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const jwplayerKey = config.public.NUXT_PUBLIC_JWPLAYER_KEY;
    const rawDevMode = config.public.NUXT_PUBLIC_JWPLAYER_DEVMODE;
    const isDevMode =
        typeof rawDevMode === 'boolean'
            ? rawDevMode
            : String(rawDevMode ?? '').trim().toLowerCase() === 'true';

    const demoLibraryUrl = String(config.public.NUXT_PUBLIC_JWPLAYER_DEVMODE_DEMO_LIBRARY_URL ?? '').trim();
    const productionLibraryUrl = String(config.public.NUXT_PUBLIC_JWPLAYER_LIBRARY_URL ?? '').trim();
    const scriptUrl = isDevMode ? demoLibraryUrl : productionLibraryUrl;

    return new Promise<void>((resolve) => {
        if (!scriptUrl) {
            resolve();
            return;
        }
        if (typeof window !== 'undefined' && (window as any).jwplayer) {
            // console.log('[JW Player] Already loaded');
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = 'jwplayer-cdn-script';
        script.src = scriptUrl;
        script.async = true;

        script.onload = () => {
            // console.log('[JW Player] Library loaded successfully');
            if (jwplayerKey && String(jwplayerKey).trim() !== '') {
                try {
                    (window as any).jwplayer.key = jwplayerKey;
                    // console.log('[JW Player] License key configured');
                } catch (error) {
                    // console.warn('[JW Player] Failed to set license key:', error);
                }
            } else {
                // console.warn('[JW Player] No valid license key provided. Player may show watermark.');
            }

            resolve();
        };

        script.onerror = (error) => {
            // console.error('[JW Player] Failed to load library:', error);
            resolve();
        };

        document.head.appendChild(script);
    });
});
