export default defineNuxtRouteMiddleware(async () => {
	const admin_user = adminUser();
	console.log('Admin User Middleware:', admin_user.value);
	if (!admin_user.value) return navigateTo('/admin-login', { replace: true });
});
