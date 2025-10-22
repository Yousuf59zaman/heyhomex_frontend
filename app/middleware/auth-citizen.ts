export default defineNuxtRouteMiddleware(async () => {
	const citizen_user = citizenUser();
	if (!citizen_user.value) return navigateTo('/', { replace: true });
});
