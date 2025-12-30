type VASTResponse = any;
export interface Hls {
    offset: string;
    tag: string;
    type?: 'linear' | 'nonlinear';
    apiAdId?: number;
}
export interface AdvertisingConfigHls {
    client: 'vast' | 'googima';
    schedule?: Hls[];
    skipoffset?: number;
    admessage?: string;
    skipmessage?: string;
    vpaidcontrols?: boolean;
    autoplayadsmuted?: boolean;
}
export interface ParsedAd {
    id: string;
    offset: string | number;
    vastTag: string;
    vastResponse?: VASTResponse;
    mediaFileUrl?: string;
    clickThroughUrl?: string;
    duration?: number;
    skipOffset?: number;
    hasBeenPlayed?: boolean;
    apiAdId?: number;
}

export const useHlsPlayerAds = () => {
    let VastClientCtor: any = null;
    const getVastClient = async () => {
        if (VastClientCtor) {
            return VastClientCtor;
        }
        const mod = await import('@dailymotion/vast-client');
        VastClientCtor = (mod as any).VASTClient || (mod as any).default;
        return VastClientCtor;
    };
    const parseVastTag = async (tagUrl: string): Promise<VASTResponse | undefined> => {
        try {
            const VastClient = await getVastClient();
            const vastClient = new VastClient();
            const response = await vastClient.get(tagUrl);
            return response;
        } catch (error) {
            console.error('[HLS Ads] Error parsing VAST tag:', error);
            return undefined;
        }
    };
    const extractMediaFile = (vastResponse: VASTResponse): string | undefined => {
        try {
            if (!vastResponse.ads || vastResponse.ads.length === 0) {
                return undefined;
            }

            const ad = vastResponse.ads[0];
            const creative = ad?.creatives?.[0];

            if (!creative || creative.type !== 'linear') {
                return undefined;
            }

            const linearCreative = creative as any;
            const mediaFiles = linearCreative.mediaFiles || [];

            // Prefer MP4, then WebM, then any other format
            const preferredFile =
                mediaFiles.find((mf: any) => mf.mimeType?.includes('mp4')) ||
                mediaFiles.find((mf: any) => mf.mimeType?.includes('webm')) ||
                mediaFiles[0];

            return preferredFile?.fileURL || undefined;
        } catch (error) {
            console.error('[HLS Ads] Error extracting media file:', error);
            return undefined;
        }
    };
    const extractClickThrough = (vastResponse: VASTResponse): string | undefined => {
        try {
            if (!vastResponse.ads || vastResponse.ads.length === 0) {
                return undefined;
            }

            const ad = vastResponse.ads[0];
            const creative = ad?.creatives?.[0];

            if (!creative || creative.type !== 'linear') {
                return undefined;
            }

            const linearCreative = creative as any;
            return linearCreative.videoClickThroughURLTemplate?.url || undefined;
        } catch (error) {
            console.error('[HLS Ads] Error extracting click-through:', error);
            return undefined;
        }
    };
    const getAdDuration = (vastResponse: VASTResponse): number => {
        try {
            if (!vastResponse.ads || vastResponse.ads.length === 0) {
                return 0;
            }

            const ad = vastResponse.ads[0];
            const creative = ad?.creatives?.[0];

            if (!creative || creative.type !== 'linear') {
                return 0;
            }

            const linearCreative = creative as any;
            return linearCreative.duration || 0;
        } catch (error) {
            console.error('[HLS Ads] Error getting ad duration:', error);
            return 0;
        }
    };
    const processAdSchedule = async (
        schedule: Hls[],
        skipOffset: number = 5
    ): Promise<ParsedAd[]> => {
        const parsedAds: ParsedAd[] = [];

        for (const adSchedule of schedule) {
            try {
                const vastResponse = await parseVastTag(adSchedule.tag);

                if (!vastResponse) {
                    console.warn('[HLS Ads] Failed to parse VAST tag:', adSchedule.tag);
                    continue;
                }

                const mediaFileUrl = extractMediaFile(vastResponse);

                if (!mediaFileUrl) {
                    console.warn('[HLS Ads] No suitable media file found in VAST response');
                    continue;
                }

                const parsedAd: ParsedAd = {
                    id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    offset: adSchedule.offset,
                    vastTag: adSchedule.tag,
                    vastResponse,
                    mediaFileUrl,
                    clickThroughUrl: extractClickThrough(vastResponse),
                    duration: getAdDuration(vastResponse),
                    skipOffset,
                    hasBeenPlayed: false,
                    apiAdId: adSchedule.apiAdId,
                };

                parsedAds.push(parsedAd);
            } catch (error) {
                console.error('[HLS Ads] Error processing ad schedule:', error);
            }
        }

        return parsedAds;
    };
    const convertOffsetToSeconds = (offset: string | number, videoDuration: number): number => {
        if (typeof offset === 'number') {
            return offset;
        }

        const offsetStr = offset.toString().toLowerCase();

        if (offsetStr === 'pre') {
            return -1;
        }

        if (offsetStr === 'post') {
            return Infinity;
        }

        if (offsetStr.endsWith('%')) {
            const percentage = parseFloat(offsetStr);
            return (percentage / 100) * videoDuration;
        }

        return parseFloat(offsetStr) || 0;
    };
    const findAdToPlay = (
        parsedAds: ParsedAd[],
        currentTime: number,
        videoDuration: number,
        isPreRoll: boolean = false,
        isPostRoll: boolean = false
    ): ParsedAd | undefined => {
        for (const ad of parsedAds) {
            if (ad.hasBeenPlayed) {
                continue;
            }

            const adTime = convertOffsetToSeconds(ad.offset, videoDuration);

            if (isPreRoll && adTime === -1) {
                return ad;
            }

            if (isPostRoll && adTime === Infinity) {
                return ad;
            }

            if (!isPreRoll && !isPostRoll && Math.abs(currentTime - adTime) < 1) {
                return ad;
            }
        }

        return undefined;
    };

    /**
     * Track VAST impression
     */
    const trackImpression = (vastResponse: VASTResponse) => {
        try {
            if (!vastResponse.ads || vastResponse.ads.length === 0) {
                return;
            }

            const ad = vastResponse.ads[0];
            const impressions = (ad as any).impressionURLTemplates || [];

            impressions.forEach((impression: any) => {
                const url = impression.url || impression;
                if (url) {
                    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
                        const img = new Image();
                        img.src = url;
                    }
                }
            });
        } catch (error) {
            console.error('[HLS Ads] Error tracking impression:', error);
        }
    };

    /**
     * Track VAST event
     */
    const trackEvent = (vastResponse: VASTResponse, eventName: string) => {
        try {
            if (!vastResponse.ads || vastResponse.ads.length === 0) {
                return;
            }

            const ad = vastResponse.ads[0];
            const creative = ad?.creatives?.[0];

            if (!creative) {
                return;
            }

            const linearCreative = creative as any;
            const trackingEvents = linearCreative.trackingEvents || {};
            const eventUrls = trackingEvents[eventName] || [];

            eventUrls.forEach((tracking: any) => {
                const url = tracking.url || tracking;
                if (url) {
                    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
                        const img = new Image();
                        img.src = url;
                    }
                }
            });
        } catch (error) {
            console.error(`[HLS Ads] Error tracking ${eventName} event:`, error);
        }
    };

    return {
        parseVastTag,
        extractMediaFile,
        extractClickThrough,
        getAdDuration,
        processAdSchedule,
        findAdToPlay,
        trackImpression,
        trackEvent
    };
};
