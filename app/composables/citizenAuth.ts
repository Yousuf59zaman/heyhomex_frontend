import { signInWithPopup } from 'firebase/auth';
const LOGIN = '/admin/login';
const LOGOUT = '/admin/logout';
const CURRENT_USER = '/admin/user';
const SSO_LOGIN = '/customer/sso-login';

export const citizenUser = () => {
    return useState('citizen_user', () => undefined);
};

export const citizenAuth = () => {
    const router = useRouter();
    const citizen_user: any = citizenUser();
    const isCitizenLoggedIn = computed(() => !!citizen_user.value);
    const cookie = useCookie($XCTN_TOKEN);
    const isLoadingLogout = ref(false);

    async function login(credentials: any) {
        if (isCitizenLoggedIn.value) return;

        const response: any = await $fetchCitizen(LOGIN, { method: 'POST', body: credentials });
        cookie.value = response.data?.token;
        return response;
    }

    async function googleLogin() {
        if (isCitizenLoggedIn.value) return;

        const sidCookie = useCookie('SID');
        if (sidCookie.value) {
            sidCookie.value = null;
        }

        try {
            const { $auth, $GoogleAuthProvider }: any = useNuxtApp();
            const provider = new $GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup($auth, provider);
            console.log(result);
            const { user } = result;
            const idToken = await user.getIdToken();

            const response: any = await $fetchCitizen(SSO_LOGIN, {
                method: 'POST',
                body: { idToken },
            });
            cookie.value = response.data?.token;
            return response;
        } catch (error: any) {
            console.error('Google login error:', error);
            if (error.code === 'auth/configuration-not-found') {
                throw new Error('Firebase Authentication is not enabled. Please enable it in Firebase Console.');
            }
            throw error;
        }
    }
    async function facebookLogin() {
        if (isCitizenLoggedIn.value) return;

        const sidCookie = useCookie('SID');
        if (sidCookie.value) {
            sidCookie.value = null;
        }

        try {
            const { $auth, $FacebookAuthProvider }: any = useNuxtApp();
            const provider = new $FacebookAuthProvider();
            provider.setCustomParameters({ auth_type: 'reauthenticate' });
            const result = await signInWithPopup($auth, provider);
            console.log(result);
            const { user } = result;
            const idToken = await user.getIdToken();

            const response: any = await $fetchCitizen(SSO_LOGIN, {
                method: 'POST',
                body: { idToken },
            });
            cookie.value = response.data?.token;
            return response;
        } catch (error: any) {
            console.error('Facebook login error:', error);
            if (error.code === 'auth/configuration-not-found') {
                throw new Error('Firebase Authentication is not enabled. Please enable it in Firebase Console.');
            }
            throw error;
        }
    }
    async function appleLogin() {
        if (isCitizenLoggedIn.value) return;
        const sidCookie = useCookie('SID');
        if (sidCookie.value) {
            sidCookie.value = null;
        }
        const { $auth, $OAuthProvider }: any = useNuxtApp();
        const provider = new $OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        provider.setCustomParameters({
            locale: 'en',
        });

        try {
            const result = await signInWithPopup($auth, provider);
            const { user } = result;
            const idToken = await user.getIdToken();
            const response: any = await $fetchCitizen(SSO_LOGIN, {
                method: 'POST',
                body: { idToken },
            });
            const cookie = useCookie($XCTN_TOKEN);
            cookie.value = response.data?.token;
            return response;
        } catch (error) {
            console.error('Apple login failed:', error);
            throw error;
        }
    } 

    async function logout() {
        isLoadingLogout.value = true;
        if (!isCitizenLoggedIn.value) return;
        await $fetchCitizen(LOGOUT, { method: 'POST' });
        citizen_user.value = null;
        cookie.value = null;
        isLoadingLogout.value = false;
        await router.push('/');
    }

    return {
        citizen_user,
        isCitizenLoggedIn,
        isLoadingLogout,
        login,
        logout,
        googleLogin,
        facebookLogin,
        appleLogin
    };
};

export const fetchCitizenCurrentUser = async () => {
    try {
        return await $fetchCitizen(CURRENT_USER, {
            redirectIfNotAuthenticated: false,
            method: 'POST'
        });
    } catch (error: any) {
        if ([401, 400, 419].includes(error?.response?.status)) return null;
    }
};