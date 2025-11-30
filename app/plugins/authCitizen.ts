import { fetchCitizenCurrentUser, citizenUser } from "~/composables/citizenAuth";

export default defineNuxtPlugin(async () => {
    const citizen_user: any = citizenUser();

    if (citizen_user.value !== undefined) return;

    const response: any = await fetchCitizenCurrentUser();
    const userData = response?.data ?? response;
    const onboardingComplete =
        userData?.user_onboard_profile_status === undefined ||
        userData?.user_onboard_profile_status !== 0;
    const hasUserTypeSlug = !!userData?.user_type?.[0]?.slug;

    if (!response || !onboardingComplete || !hasUserTypeSlug) {
        citizen_user.value = null;
        return;
    }

    citizen_user.value = response;
});
