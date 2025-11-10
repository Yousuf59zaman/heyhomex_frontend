export default defineNuxtRouteMiddleware(async () => {
	const citizen_user = citizenUser();
	console.log('citizen panel' , citizen_user.value)
	if (!citizen_user.value) return navigateTo('/', { replace: true });
});
