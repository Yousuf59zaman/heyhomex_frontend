const LOGIN = '/admin/login';
const LOGOUT = '/admin/logout';
const CURRENT_USER = '/admin/user';

export const adminUser = () => {
	// Store admin user data in a cookie for persistence across page refreshes
	const userCookie = useCookie('admin_user', {
		maxAge: 60 * 60 * 24 * 7, // 7 days
		sameSite: 'lax'
	});
	return useState('admin_user', () => userCookie.value);
};

export const adminAuth = () => {
	const router = useRouter();
	const admin_user: any = adminUser();
	const isAdminLoggedIn = computed(() => !!admin_user.value);
	const tokenCookie = useCookie($XADM_TOKEN);
	const userCookie = useCookie('admin_user');

	async function login(credentials: any) {
		if (isAdminLoggedIn.value) return;

		const response: any = await $fetchAdmin(LOGIN, { method: 'post', body: credentials });
		console.log('Admin Login Response:', response);
		
		// Store both in state and cookie
		admin_user.value = response.data?.user_info;
		userCookie.value = response.data?.user_info;
		tokenCookie.value = response.data?.token;
		
		console.log('Admin User after login:', admin_user.value);
		return response;
	}

	async function logout() {
		if (!isAdminLoggedIn.value) return;
		$fetchAdmin(LOGOUT, { method: 'POST' });
		
		// Clear both state and cookies
		admin_user.value = null;
		userCookie.value = null;
		tokenCookie.value = null;
		
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