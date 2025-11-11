import { fetchCitizenCurrentUser, citizenUser } from "~/composables/citizenAuth";

export default defineNuxtPlugin(async () => {
    const citizen_user: any = citizenUser();
    console.log('calling plug' , citizen_user.value)
    if (citizen_user.value !== undefined) return;
    citizen_user.value = await fetchCitizenCurrentUser();
});
