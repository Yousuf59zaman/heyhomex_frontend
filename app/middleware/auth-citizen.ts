export default defineNuxtRouteMiddleware(async (to, from) => {
    const citizen_user = citizenUser()
    // console.log("ciz", citizen_user)

    if (!citizen_user.value) return navigateTo("/", {replace: true})

    // const userRole = (citizen_user.value as any)?.data.user_role
    const userTypeSlug = (citizen_user.value as any)?.data.user_type?.[0]?.slug

    const pathSegment = to.path.split("/")[1]

    const protectedSegments = [
        "kamaina",
        "military",
        "investor",
        "agent",
        "advertisers",
    ]

    if (pathSegment && protectedSegments.includes(pathSegment)) {
        let allowedSegment: string | null = null

        // if (userRole === "agent" || userRole === "advertisers") {
        //     allowedSegment = userRole
        // } else if (userTypeSlug) {
        //     allowedSegment =
        //         userTypeSlug === "kamaaina" ? "kamaina" : userTypeSlug
        // }
        // console.log('user type segment' ,  userTypeSlug)
       if (userTypeSlug) {
            allowedSegment =
                userTypeSlug === "kamaaina" ? "kamaina" : userTypeSlug
        }

        if (allowedSegment) {
            if (
                pathSegment !== allowedSegment &&
                protectedSegments.includes(pathSegment)
            ) {
                return navigateTo(`/${allowedSegment}/`, {replace: true})
            }
        } else {
            return navigateTo("/", {replace: true})
        }
    }
})
