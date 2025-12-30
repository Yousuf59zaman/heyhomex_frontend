/**
 * Composable for ad configuration with dynamic URLs based on current host
 * This prevents CORS issues when the site runs on different domains
 */
export const useAdConfig = () => {
    const { $getBaseUrl } = useNuxtApp();

    const getAdSchedule = () => {
        const baseUrl = $getBaseUrl();
        return [
            {
                offset: 'pre',
                tag: `${baseUrl}/ads/pre-roll-ad.xml`,
                type: 'linear' as const,
            },
            {
                offset: '50%',
                tag: `${baseUrl}/ads/mid-roll-ad.xml`,
                type: 'linear' as const,
            },
            {
                offset: 'post',
                tag: `${baseUrl}/ads/post-roll-ad.xml`,
                type: 'linear' as const,
            },
        ];
    };

    const getDefaultAdConfig = () => {
        return {
            client: 'vast' as const,
            schedule: getAdSchedule(),
            skipoffset: 5,
            admessage: 'This ad will end in xx seconds',
            skipmessage: 'Skip ad',
            vpaidcontrols: true,
            autoplayadsmuted: false,
        };
    };

    return {
        getAdSchedule,
        getDefaultAdConfig,
    };
};
