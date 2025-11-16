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

  // Get JW Player configuration from runtime config
  const jwplayerKey = config.public.NUXT_PUBLIC_JWPLAYER_KEY as string || '';
  const isDevMode = config.public.NUXT_PUBLIC_JWPLAYER_DEVMODE as string || false;
  const demoLibraryUrl = config.public.NUXT_PUBLIC_JWPLAYER_DEVMODE_DEMO_LIBRARY_URL as string || '';
  const productionLibraryUrl = config.public.NUXT_PUBLIC_JWPLAYER_LIBRARY_URL as string || '';

  // Determine the script URL based on devmode flag
  // If devmode is true, use the demo library URL; otherwise use the production library URL
  const scriptUrl = isDevMode ? demoLibraryUrl : productionLibraryUrl;


  return new Promise<void>((resolve, reject) => {
    // Check if JW Player is already loaded
    if (typeof window !== 'undefined' && (window as any).jwplayer) {
      console.log('[JW Player] Already loaded');
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      console.log('[JW Player] Library loaded successfully');

      // Set license key if provided
      if (jwplayerKey && jwplayerKey.trim() !== '') {
        try {
          (window as any).jwplayer.key = jwplayerKey;
          console.log('[JW Player] License key configured');
        } catch (error) {
          console.warn('[JW Player] Failed to set license key:', error);
        }
      } else {
        console.warn('[JW Player] No valid license key provided. Player will show watermark.');
      }

      resolve();
    };

    script.onerror = (error) => {
      console.error('[JW Player] Failed to load library:', error);
      reject(new Error('Failed to load JW Player library'));
    };

    // Append script to document head
    document.head.appendChild(script);
  });
});
