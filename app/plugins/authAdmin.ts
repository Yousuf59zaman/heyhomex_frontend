import { fetchAdminCurrentUser, adminUser } from "~/composables/adminAuth";

export default defineNuxtPlugin(async () => {
    const admin_user: any = adminUser();
    if (admin_user.value !== undefined) return;
    admin_user.value = await fetchAdminCurrentUser();
});
