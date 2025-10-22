export default defineNuxtRouteMiddleware(async () => {
	const admin_user = adminUser();
	console.log('Admin User Middleware:', admin_user.value);
	const citizen_user = citizenUser();
	if (admin_user.value) return navigateTo('/admin-panel', { replace: true });
	if (citizen_user.value) return navigateTo('/dashboard', { replace: true });
});
