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

  // Get JW Player configuration from environment
  const jwplayerKey = config.public.jwplayerKey as string || '';
  const libraryUrl = config.public.jwplayerLibraryUrl as string || '';

  // Determine the script URL to load
  const scriptUrl = libraryUrl || 'https://cdn.jwplayer.com/libraries/KB5zFt7A.js'; // Free tier demo library

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
      if (jwplayerKey && jwplayerKey !== 'YOUR_LICENSE_KEY_HERE') {
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
