export interface ApiAdvertisement {
    id: number;
    title: string;
    description?: string;
    type: number;
    type_label: string;
    media_url: string;
    redirect_url?: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
}

export interface AdScheduleItem {
    offset: string;
    tag: string;
    type: 'linear' | 'nonlinear';
    apiAdId?: number;
}

const parseAdDate = (value: string | null | undefined) => {
    if (!value) {
        return { date: null as Date | null, valid: true };
    }
    const parsed = new Date(value);
    return { date: parsed, valid: !Number.isNaN(parsed.getTime()) };
};

const isPlayableMediaUrl = (mediaUrl?: string): boolean => {
    if (!mediaUrl) return false;
    const cleanUrl = mediaUrl.split('?')[0]?.split('#')[0]?.toLowerCase() || '';
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.m3u8');
};

const getMediaTypeForUrl = (mediaUrl: string): string => {
    const cleanUrl = mediaUrl.split('?')[0]?.split('#')[0]?.toLowerCase() || '';
    if (cleanUrl.endsWith('.m3u8')) {
        return 'application/vnd.apple.mpegurl';
    }
    if (cleanUrl.endsWith('.webm')) {
        return 'video/webm';
    }
    return 'video/mp4';
};

const isAdActive = (ad: ApiAdvertisement): boolean => {
    if (!ad.is_active) return false;

    const now = new Date();
    const startsAt = parseAdDate(ad.starts_at);
    const endsAt = parseAdDate(ad.ends_at);

    if (!startsAt.valid) {
        console.warn('[Ads] Invalid starts_at for ad:', ad.id, ad.starts_at);
        return false;
    }
    if (!endsAt.valid) {
        console.warn('[Ads] Invalid ends_at for ad:', ad.id, ad.ends_at);
        return false;
    }

    const startsOk = !startsAt.date || now >= startsAt.date;
    const endsOk = !endsAt.date || now <= endsAt.date;

    return startsOk && endsOk;
};

export default defineNuxtPlugin(() => {
    return {
        provide: {
            /**
             * Generates a VAST XML string from media URL and optional parameters
             * Returns a blob URL that can be used as a VAST tag
             */
            generateVastXml: (
                mediaUrl: string,
                options?: {
                    adId?: string | number;
                    adTitle?: string;
                    clickThroughUrl?: string;
                    duration?: string;
                    mediaType?: string;
                }
            ): string => {
                const adId = options?.adId || Date.now();
                const adTitle = options?.adTitle || 'Advertisement';
                const clickThrough = options?.clickThroughUrl || '';
                const duration = options?.duration || '00:00:30';
                const mediaType = options?.mediaType || 'video/mp4';

                const vastXml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
    <Ad id="${adId}">
        <InLine>
            <AdSystem>HeyHomex Ads</AdSystem>
            <AdTitle><![CDATA[${adTitle}]]></AdTitle>
            <Impression><![CDATA[]]></Impression>
            <Creatives>
                <Creative>
                    <Linear>
                        <Duration>${duration}</Duration>
                        <MediaFiles>
                            <MediaFile delivery="progressive" type="${mediaType}" width="1920" height="1080">
                                <![CDATA[${mediaUrl}]]>
                            </MediaFile>
                        </MediaFiles>
                        ${clickThrough ? `<VideoClicks>
                            <ClickThrough><![CDATA[${clickThrough}]]></ClickThrough>
                        </VideoClicks>` : ''}
                    </Linear>
                </Creative>
            </Creatives>
        </InLine>
    </Ad>
</VAST>`;

                // Create blob URL only on client side
                if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
                    const blob = new Blob([vastXml], { type: 'application/xml' });
                    return URL.createObjectURL(blob);
                }

                // Fallback: return data URI for SSR
                return `data:application/xml;base64,${btoa(vastXml)}`;
            },

            /**
             * Checks if an advertisement is currently active based on dates
             */
            isAdActive: (ad: ApiAdvertisement): boolean => {
                return isAdActive(ad);
            },

            /**
             * Generates ad schedule from API advertisements
             * Returns the schedule array format compatible with adConfig
             */
            generateAdSchedule: (
                ads: ApiAdvertisement[],
                generateVastXmlFn: (mediaUrl: string, options?: any) => string
            ): AdScheduleItem[] => {
                // Filter only active ads based on dates and is_active flag
                const activeAds = ads.filter((ad) => isAdActive(ad));

                if (activeAds.length === 0) {
                    return [];
                }

                const schedule: AdScheduleItem[] = [];
                const offsets = ['pre', '50%', 'post'] as const;

                activeAds.forEach((ad, index) => {
                    if (!isPlayableMediaUrl(ad.media_url)) {
                        console.warn(
                            '[Ads] Unsupported media_url for ad. Expected .mp4 or .m3u8:',
                            ad.id,
                            ad.media_url
                        );
                        return;
                    }

                    // Determine offset based on index
                    // First ad = pre, second = 50%, third = post, then cycle
                    const offsetIndex = index % offsets.length;
                    const offset = offsets[offsetIndex] ?? offsets[0];

                    const mediaType = getMediaTypeForUrl(ad.media_url);

                    // Generate VAST XML blob URL
                    const vastTag = generateVastXmlFn(ad.media_url, {
                        adId: ad.id,
                        adTitle: ad.title,
                        clickThroughUrl: ad.redirect_url,
                        duration: '00:00:30',
                        mediaType: mediaType,
                    });

                    schedule.push({
                        offset: offset,
                        tag: vastTag,
                        type: 'linear',
                        apiAdId: ad.id,
                    });
                });

                return schedule;
            },

            /**
             * Builds complete adConfig object from API advertisements
             */
            buildAdConfig: (
                ads: ApiAdvertisement[],
                generateVastXmlFn: (mediaUrl: string, options?: any) => string,
                options?: {
                    skipoffset?: number;
                    admessage?: string;
                    skipmessage?: string;
                    vpaidcontrols?: boolean;
                    autoplayadsmuted?: boolean;
                }
            ) => {
                // Filter only active ads based on dates and is_active flag
                const activeAds = ads.filter((ad) => isAdActive(ad));

                if (activeAds.length === 0) {
                    return {
                        client: 'vast',
                        schedule: [],
                        skipoffset: options?.skipoffset ?? 5,
                        admessage: options?.admessage ?? 'This ad will end in xx seconds',
                        skipmessage: options?.skipmessage ?? 'Skip ad',
                        vpaidcontrols: options?.vpaidcontrols ?? true,
                        autoplayadsmuted: options?.autoplayadsmuted ?? false,
                    };
                }

                const schedule: AdScheduleItem[] = [];
                const offsets = ['pre', '50%', 'post'] as const;

                activeAds.forEach((ad, index) => {
                    if (!isPlayableMediaUrl(ad.media_url)) {
                        console.warn(
                            '[Ads] Unsupported media_url for ad. Expected .mp4 or .m3u8:',
                            ad.id,
                            ad.media_url
                        );
                        return;
                    }

                    const offsetIndex = index % offsets.length;
                    const offset = offsets[offsetIndex] ?? offsets[0];
                    const mediaType = getMediaTypeForUrl(ad.media_url);

                    const vastTag = generateVastXmlFn(ad.media_url, {
                        adId: ad.id,
                        adTitle: ad.title,
                        clickThroughUrl: ad.redirect_url,
                        duration: '00:00:30',
                        mediaType: mediaType,
                    });

                    schedule.push({
                        offset: offset,
                        tag: vastTag,
                        type: 'linear',
                        apiAdId: ad.id,
                    });
                });

                if (schedule.length === 0) {
                    return {
                        client: 'vast',
                        schedule: [],
                        skipoffset: options?.skipoffset ?? 5,
                        admessage: options?.admessage ?? 'This ad will end in xx seconds',
                        skipmessage: options?.skipmessage ?? 'Skip ad',
                        vpaidcontrols: options?.vpaidcontrols ?? true,
                        autoplayadsmuted: options?.autoplayadsmuted ?? false,
                    };
                }

                return {
                    client: 'vast',
                    schedule: schedule,
                    skipoffset: options?.skipoffset ?? 5,
                    admessage: options?.admessage ?? 'This ad will end in xx seconds',
                    skipmessage: options?.skipmessage ?? 'Skip ad',
                    vpaidcontrols: options?.vpaidcontrols ?? true,
                    autoplayadsmuted: options?.autoplayadsmuted ?? false,
                };
            },

            /**
             * Cleans up blob URLs to prevent memory leaks
             * Call this when ads are no longer needed
             */
            revokeAdBlobUrls: (schedule: AdScheduleItem[]) => {
                if (typeof window === 'undefined') return;

                schedule.forEach(item => {
                    if (item.tag && item.tag.startsWith('blob:')) {
                        URL.revokeObjectURL(item.tag);
                    }
                });
            },
        }
    };
});
