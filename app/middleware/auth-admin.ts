export default defineNuxtRouteMiddleware(async () => {
	const admin_user = adminUser() as { value?: { data?: { user_type?: string } } };
	if (!admin_user.value) return navigateTo('/', { replace: true });
});
