import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';

export default defineNuxtPlugin((nuxtApp) => {
    const {
        public: {
            FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID,
            FIREBASE_STORAGE_BUCKET,
            FIREBASE_MESSAGING_SENDER_ID,
            FIREBASE_APP_ID,
        },
    } = useRuntimeConfig();

    const firebaseConfig = {
        apiKey: 'AIzaSyA5wXRy11IyBxVsGEZeJcc4ZWWDdwgVP44',
        authDomain: 'next-auth-b8364.firebaseapp.com',
        projectId: 'next-auth-b8364',
        storageBucket: 'next-auth-b8364.appspot.com',
        messagingSenderId: '740203057927',
        appId: '1:740203057927:web:4aa7df75ef6ffe8a67aba2',
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    return {
        provide: {
            auth,
            GoogleAuthProvider,
            FacebookAuthProvider,
            OAuthProvider
        },
    };
});
