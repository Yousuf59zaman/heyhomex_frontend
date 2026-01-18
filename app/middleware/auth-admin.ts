export default defineNuxtRouteMiddleware(async () => {
    const admin_user: any = adminUser()

    if (!admin_user.value) return navigateTo("/", {replace: true})

    if (admin_user.value.data) {
        const roleId = admin_user.value.data?.user_role?.id

        if (roleId !== 1) {
            const cookie = useCookie($XADM_TOKEN)
            admin_user.value = null
            cookie.value = null

            return navigateTo("/", {replace: true})
        }
    }
})
