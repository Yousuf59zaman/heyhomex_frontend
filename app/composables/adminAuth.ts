const LOGIN = '/admin/login';
const LOGOUT = '/admin/logout';
const CURRENT_USER = '/admin/user';

export const adminUser = () => {
	return useState('admin_user', () => undefined);
};

export const adminAuth = () => {
	const router = useRouter();
	const admin_user: any = adminUser();
	const isAdminLoggedIn = computed(() => !!admin_user.value);
	const cookie = useCookie($XADM_TOKEN);

	async function login(credentials: any) {
		if (isAdminLoggedIn.value) return;

		const response: any = await $fetchAdmin(LOGIN, { method: 'post', body: credentials });
		cookie.value = response.data?.token;
		return response;
	}

	async function logout() {
		if (!isAdminLoggedIn.value) return;
		$fetchAdmin(LOGOUT, { method: 'POST' });
		admin_user.value = null;
		cookie.value = null;
		await router.push('/');
	}

	return {
		admin_user,
		isAdminLoggedIn,
		login,
		logout
	};
};

export const fetchAdminCurrentUser = async () => {
	try {
		return await $fetchAdmin(CURRENT_USER, {
			redirectIfNotAuthenticated: false,
			method: 'POST'
		});
	} catch (error: any) {
		if ([401, 400, 419].includes(error?.response?.status)) return null;
		// console.log(error);
	}
};