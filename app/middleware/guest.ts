export default defineNuxtRouteMiddleware(async () => {
	const admin_user = adminUser();
	const citizen_user = citizenUser();
	if (admin_user.value) return navigateTo('/admin-panel', { replace: true });
	if (citizen_user.value) return navigateTo('/dashboard', { replace: true });
});
