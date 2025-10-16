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
            },
            dark: {
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
                }
            }
        }
    },
});

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },

    css: [
        '~/assets/css/main.css',
        'leaflet/dist/leaflet.css'
    ],

    modules: [
        "@primevue/nuxt-module",
        "@nuxt/icon",
        
        "@nuxtjs/sitemap",
        "@nuxtjs/tailwindcss",
    ],

    primevue: {
        options: {
            theme: {
                preset: MyPreset,
                options: {
                    prefix: 'p',
                    darkModeSelector: 'html.dark', 
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
