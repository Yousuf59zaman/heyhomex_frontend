export default defineNuxtRouteMiddleware(async (to, from) => {
    const citizen_user = citizenUser()
    // console.log("ciz", citizen_user)

    if (!citizen_user.value) return navigateTo("/", {replace: true})

    const userData = (citizen_user.value as any)?.data
    const userRole = userData?.user_role
    const userTypeSlug = userData?.user_type?.[0]?.slug
    const onboardingStatus = userData?.user_onboard_profile_status

    const pathSegment = to.path.split("/")[1]

    const protectedSegments = [
        "kamaina",
        "military",
        "investor",
        "agent",
        "advertisers",
    ]

    // Check if agent or advertiser needs profile completion
    if ((userRole === 'agent' || userRole === 'advertiser') && onboardingStatus === 0) {
        const subscriptionPath = userRole === 'agent' ? '/agent/subscription' : '/advertisers/subscription'
        
        // Allow access to subscription page but redirect other pages to subscription
        if (!to.path.includes('/subscription')) {
            return navigateTo(subscriptionPath, {replace: true})
        }
    }

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
