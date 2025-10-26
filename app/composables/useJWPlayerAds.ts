/**
 * JW Player Advertising Composable
 *
 * Provides utilities and configurations for JW Player advertising integration.
 * Supports both self-hosted VAST ads and external ad networks.
 *
 * @see https://docs.jwplayer.com/players/docs/jw8-ad-features
 */

export interface AdSchedule {
  offset: string; // 'pre', 'post', '50%', or time in seconds
  tag: string; // VAST tag URL
  type?: 'linear' | 'nonlinear';
}

export interface AdvertisingConfig {
  client: 'vast' | 'googima';
  schedule?: AdSchedule[];
  skipoffset?: number;
  admessage?: string;
  skipmessage?: string;
  vpaidcontrols?: boolean;
  autoplayadsmuted?: boolean;
}

export const useJWPlayerAds = () => {
  /**
   * Get the base URL for self-hosted ads
   */
  const getAdBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/ads`;
    }
    return '/ads';
  };

  /**
   * Default advertising configuration with self-hosted VAST ads
   * Pre-roll, mid-roll at 50%, and post-roll ads
   */
  const getDefaultAdConfig = (): AdvertisingConfig => {
    const baseUrl = getAdBaseUrl();

    return {
      client: 'vast',
      schedule: [
        {
          offset: 'pre',
          tag: `${baseUrl}/pre-roll-ad.xml`,
          type: 'linear',
        },
        {
          offset: '50%',
          tag: `${baseUrl}/mid-roll-ad.xml`,
          type: 'linear',
        },
        {
          offset: 'post',
          tag: `${baseUrl}/post-roll-ad.xml`,
          type: 'linear',
        },
      ],
      skipoffset: 5, // Allow skip after 5 seconds
      admessage: 'This ad will end in xx seconds',
      skipmessage: 'Skip ad',
      vpaidcontrols: true,
      autoplayadsmuted: false,
    };
  };

  /**
   * Pre-roll only configuration
   */
  const getPreRollOnlyConfig = (): AdvertisingConfig => {
    const baseUrl = getAdBaseUrl();

    return {
      client: 'vast',
      schedule: [
        {
          offset: 'pre',
          tag: `${baseUrl}/pre-roll-ad.xml`,
          type: 'linear',
        },
      ],
      skipoffset: 5,
      admessage: 'This ad will end in xx seconds',
      skipmessage: 'Skip ad',
    };
  };

  /**
   * Post-roll only configuration
   */
  const getPostRollOnlyConfig = (): AdvertisingConfig => {
    const baseUrl = getAdBaseUrl();

    return {
      client: 'vast',
      schedule: [
        {
          offset: 'post',
          tag: `${baseUrl}/post-roll-ad.xml`,
          type: 'linear',
        },
      ],
      skipoffset: 5,
      admessage: 'This ad will end in xx seconds',
      skipmessage: 'Skip ad',
    };
  };

  /**
   * Create custom ad configuration
   * @param schedule - Array of ad schedules
   * @param options - Additional ad options
   */
  const createCustomAdConfig = (
    schedule: AdSchedule[],
    options?: Partial<AdvertisingConfig>
  ): AdvertisingConfig => {
    return {
      client: 'vast',
      schedule,
      skipoffset: options?.skipoffset ?? 5,
      admessage: options?.admessage ?? 'This ad will end in xx seconds',
      skipmessage: options?.skipmessage ?? 'Skip ad',
      vpaidcontrols: options?.vpaidcontrols ?? true,
      autoplayadsmuted: options?.autoplayadsmuted ?? false,
    };
  };

  /**
   * Google IMA (Interactive Media Ads) configuration example
   * Requires Google Ad Manager account
   */
  const getGoogleIMAConfig = (adTagUrl: string): AdvertisingConfig => {
    return {
      client: 'googima',
      schedule: [
        {
          offset: 'pre',
          tag: adTagUrl,
        },
      ],
      skipoffset: 5,
    };
  };

  /**
   * Example: Create time-based ad schedule
   * Ads at specific timestamps (in seconds)
   */
  const createTimeBasedSchedule = (timestamps: number[]): AdvertisingConfig => {
    const baseUrl = getAdBaseUrl();

    return {
      client: 'vast',
      schedule: timestamps.map(time => ({
        offset: time.toString(),
        tag: `${baseUrl}/mid-roll-ad.xml`,
        type: 'linear' as const,
      })),
      skipoffset: 5,
    };
  };

  /**
   * Example: Create percentage-based ad schedule
   * Ads at specific percentage points (e.g., 25%, 50%, 75%)
   */
  const createPercentageBasedSchedule = (percentages: number[]): AdvertisingConfig => {
    const baseUrl = getAdBaseUrl();

    return {
      client: 'vast',
      schedule: percentages.map(percent => ({
        offset: `${percent}%`,
        tag: `${baseUrl}/mid-roll-ad.xml`,
        type: 'linear' as const,
      })),
      skipoffset: 5,
    };
  };

  /**
   * Disable advertising
   */
  const getNoAdsConfig = (): undefined => {
    return undefined;
  };

  return {
    // Configuration presets
    getDefaultAdConfig,
    getPreRollOnlyConfig,
    getPostRollOnlyConfig,
    getNoAdsConfig,

    // Custom configurations
    createCustomAdConfig,
    createTimeBasedSchedule,
    createPercentageBasedSchedule,

    // External ad networks
    getGoogleIMAConfig,

    // Utilities
    getAdBaseUrl,
  };
};
