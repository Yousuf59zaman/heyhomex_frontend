export default defineNuxtRouteMiddleware(async () => {
	const citizen_user = citizenUser();
	console.log('ciz' , citizen_user);
	if (!citizen_user.value) return navigateTo('/', { replace: true });
});
