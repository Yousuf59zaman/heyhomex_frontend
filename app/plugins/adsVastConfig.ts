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
    tagFilename: string; // Clean filename like "2025-12-30_13-45-00_3.xml"
    type: 'linear' | 'nonlinear';
    apiAdId?: number;
    directMediaUrl?: string;
    clickThroughUrl?: string;
    adTitle?: string;
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

const formatOffsetPercentage = (percentage: number): string => {
    const rounded = Math.round(percentage * 100) / 100;
    const formatted = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(2);
    return `${formatted.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')}%`;
};

const buildAdOffsets = (adCount: number): string[] => {
    if (adCount <= 0) {
        return [];
    }

    if (adCount === 1) {
        return ['pre'];
    }

    if (adCount === 2) {
        return ['pre', 'post'];
    }

    const midrollCount = adCount - 2;
    const offsets: string[] = ['pre', 'post'];

    for (let index = 1; index <= midrollCount; index += 1) {
        const percentage = (index / (midrollCount + 1)) * 100;
        offsets.push(formatOffsetPercentage(percentage));
    }

    return offsets;
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

/**
 * Generate datetime filename in format: 2025-12-30_13-45-00_3.xml
 */
const generateDateTimeFilename = (adId: number | string): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}_${adId}.xml`;
};

/**
 * Generate VAST XML string with media_url in ClickThrough
 */
const createVastXml = (
    adId: string | number,
    mediaUrl: string,
    adTitle: string,
    duration: string,
    mediaType: string
): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
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
                        <VideoClicks>
                            <ClickThrough><![CDATA[${mediaUrl}]]></ClickThrough>
                        </VideoClicks>
                    </Linear>
                </Creative>
            </Creatives>
        </InLine>
    </Ad>
</VAST>`;
};

/**
 * Convert VAST XML to data URI that can be fetched by VAST client
 */
const xmlToDataUri = (xml: string): string => {
    if (typeof window !== 'undefined' && typeof btoa !== 'undefined') {
        return `data:application/xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
    }
    return `data:application/xml;charset=utf-8,${encodeURIComponent(xml)}`;
};

export default defineNuxtPlugin(() => {
    return {
        provide: {
            /**
             * Generates VAST XML as a data URI with datetime_adId.xml filename format
             * Returns: { tag: dataUri, tagFilename: "2025-12-30_13-45-00_3.xml" }
             */
            generateVastXml: (
                mediaUrl: string,
                options?: {
                    adId?: string | number;
                    adTitle?: string;
                    duration?: string;
                    mediaType?: string;
                }
            ): { tag: string; tagFilename: string } => {
                const adId = options?.adId || Date.now();
                const adTitle = options?.adTitle || 'Advertisement';
                const duration = options?.duration || '00:00:30';
                const mediaType = options?.mediaType || 'video/mp4';

                // Generate clean filename: 2025-12-30_13-45-00_3.xml
                const tagFilename = generateDateTimeFilename(adId);

                // Create VAST XML with media_url in ClickThrough
                const vastXml = createVastXml(adId, mediaUrl, adTitle, duration, mediaType);

                // Convert to data URI for VAST client to fetch
                const tag = xmlToDataUri(vastXml);

                return { tag, tagFilename };
            },

            /**
             * Checks if an advertisement is currently active based on dates
             */
            isAdActive: (ad: ApiAdvertisement): boolean => {
                return isAdActive(ad);
            },

            /**
             * Generates ad schedule from API advertisements
             */
            generateAdSchedule: (
                ads: ApiAdvertisement[],
                generateVastXmlFn: (mediaUrl: string, options?: any) => { tag: string; tagFilename: string }
            ): AdScheduleItem[] => {
                const activeAds = ads.filter((ad) => isAdActive(ad));

                if (activeAds.length === 0) {
                    return [];
                }

                const schedule: AdScheduleItem[] = [];
                const offsets = buildAdOffsets(activeAds.length);

                activeAds.forEach((ad, index) => {
                    if (!isPlayableMediaUrl(ad.media_url)) {
                        console.warn(
                            '[Ads] Unsupported media_url for ad. Expected .mp4 or .m3u8:',
                            ad.id,
                            ad.media_url
                        );
                        return;
                    }

                    const offset = offsets[index] ?? offsets[0] ?? 'pre';
                    const mediaType = getMediaTypeForUrl(ad.media_url);

                    const { tag, tagFilename } = generateVastXmlFn(ad.media_url, {
                        adId: ad.id,
                        adTitle: ad.title,
                        duration: '00:00:30',
                        mediaType: mediaType,
                    });

                    schedule.push({
                        offset: offset,
                        tag: tag,
                        tagFilename: tagFilename,
                        type: 'linear',
                        apiAdId: ad.id,
                        directMediaUrl: ad.media_url,
                        clickThroughUrl: ad.media_url, // Using media_url as requested
                        adTitle: ad.title,
                    });
                });

                return schedule;
            },

            /**
             * Builds complete adConfig object from API advertisements
             */
            buildAdConfig: (
                ads: ApiAdvertisement[],
                generateVastXmlFn: (mediaUrl: string, options?: any) => { tag: string; tagFilename: string },
                options?: {
                    skipoffset?: number;
                    admessage?: string;
                    skipmessage?: string;
                    vpaidcontrols?: boolean;
                    autoplayadsmuted?: boolean;
                }
            ) => {
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
                const offsets = buildAdOffsets(activeAds.length);

                activeAds.forEach((ad, index) => {
                    if (!isPlayableMediaUrl(ad.media_url)) {
                        console.warn(
                            '[Ads] Unsupported media_url for ad. Expected .mp4 or .m3u8:',
                            ad.id,
                            ad.media_url
                        );
                        return;
                    }

                    const offset = offsets[index] ?? offsets[0] ?? 'pre';
                    const mediaType = getMediaTypeForUrl(ad.media_url);

                    const { tag, tagFilename } = generateVastXmlFn(ad.media_url, {
                        adId: ad.id,
                        adTitle: ad.title,
                        duration: '00:00:30',
                        mediaType: mediaType,
                    });

                    schedule.push({
                        offset: offset,
                        tag: tag,
                        tagFilename: tagFilename,
                        type: 'linear',
                        apiAdId: ad.id,
                        directMediaUrl: ad.media_url,
                        clickThroughUrl: ad.media_url, // Using media_url as requested
                        adTitle: ad.title,
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
        }
    };
});
