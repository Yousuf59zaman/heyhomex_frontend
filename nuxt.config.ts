// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
type ProcessEnv = Record<string, string | undefined>;

const runtimeEnv =
    (globalThis as typeof globalThis & { process?: { env?: ProcessEnv } }).process?.env ?? {};

const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                primary: {
                    50: '{sky.50}',
                    100: '{sky.100}',
                    200: '{sky.200}',
                    300: '{sky.300}',
                    400: '{sky.400}',
                    500: '{sky.500}',
                    600: '{sky.600}',
                    700: '{sky.700}',
                    800: '{sky.800}',
                    900: '{sky.900}',
                    950: '{sky.950}'
                },
            }
        }
    },
});

export default defineNuxtConfig({

    runtimeConfig: {
        public: {
            NUXT_PUBLIC_SITE_URL: process.env.NUXT_PUBLIC_SITE_URL,
            API_BASE_URL: process.env.API_BASE_URL,
            SCRIPT_URL: process.env.SCRIPT_URL,
            CMS_EMAIL: process.env.CMS_EMAIL,
            CMS_PASSWORD: process.env.CMS_PASSWORD,
            FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
            FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
            FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
            NUXT_PUBLIC_JWPLAYER_KEY: process.env.NUXT_PUBLIC_JWPLAYER_KEY,
            NUXT_PUBLIC_JWPLAYER_LIBRARY_URL: process.env.NUXT_PUBLIC_JWPLAYER_LIBRARY_URL,
        }
    },
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },

    css: [
        '~/assets/css/main.css',
        'leaflet/dist/leaflet.css',
        'primeicons/primeicons.css',
        '~/assets/scss/style.scss',
        '~/assets/fa-6.4.0/css/all.css'
    ],

    modules: [
        "@primevue/nuxt-module",
        "@nuxt/icon",
        "@nuxtjs/color-mode",
        "@nuxtjs/sitemap",
        "@nuxtjs/tailwindcss",
        '@nuxt/image',
    ],

    colorMode: {
        preference: 'light', // default value of $colorMode.preference
        fallback: 'light', // fallback value if not system preference found
        hid: 'nuxt-color-mode-script',
        globalName: '__NUXT_COLOR_MODE__',
        componentName: 'ColorScheme',
        classPrefix: '',
        classSuffix: '',
        storageKey: 'nuxt-color-mode'
    },

    primevue: {
        options: {
            theme: {
                preset: MyPreset,
                options: {
                    prefix: 'p',
                    darkModeSelector: false, // Explicitly disable dark mode
                    cssLayer: false
                }
            }
        },
        components: {
            include: '*'
        }
    },

    app: {
        head: {
            link: [
                // Favicon
                { rel: 'icon', type: 'image/svg+xml', href: '/svg/dashboard/home_logo.svg' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                { rel: 'manifest', href: '/site.webmanifest' }
            ],
            meta: [
                { name: 'theme-color', content: '#0ea5e9' },
            ]
        }
    },

    devServer: {
        host: "0.0.0.0",
        port: 3000,
    },
    nitro: {
        routeRules: {
            '/api/**': { cors: true }
        }
    },
});