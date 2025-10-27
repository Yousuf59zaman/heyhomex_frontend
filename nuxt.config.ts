// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

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
            API_URL_ADMIN: process.env.API_URL_ADMIN,
            API_URL_CITIZEN: process.env.API_URL_CITIZEN,
            SCRIPT_URL: process.env.SCRIPT_URL,
            CMS_EMAIL: process.env.CMS_EMAIL,
            CMS_PASSWORD: process.env.CMS_PASSWORD,
           
        }
    },
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },

    css: [
        '~/assets/css/main.css',
        'leaflet/dist/leaflet.css',
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

    devServer: {
        host: "0.0.0.0",
        port: 3000,
    },
});