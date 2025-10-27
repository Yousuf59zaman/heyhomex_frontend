import { fetchCitizenCurrentUser, citizenUser } from "~/composables/citizenAuth";

export default defineNuxtPlugin(async () => {
    const citizen_user: any = citizenUser();
    if (citizen_user.value !== undefined) return;
    // citizen_user.value = await fetchCitizenCurrentUser();
});
