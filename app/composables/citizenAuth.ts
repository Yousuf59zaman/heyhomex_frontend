const LOGIN = '/customer/login';
const LOGOUT = '/customer/logout';
const CURRENT_USER = '/customer/user';

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