import { $fetch, FetchError } from 'ofetch';

export const $XCMS_TOKEN = 'XCMS-TOKEN';
const AUTH_HEADER = 'Authorization';

interface ResponseMap {
    blob: Blob;
    text: string;
    arrayBuffer: ArrayBuffer;
}
type ResponseType = keyof ResponseMap | 'json';

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

async function refreshToken() {
    try {
        const response = await $fetch('/api/auth');
        const newToken = response.login.data.token;
        useCookie($XCMS_TOKEN).value = newToken;
        return newToken;
    } catch (error) {
        throw error;
    }
}

export async function $fetchCMS<T, R extends ResponseType = 'json'>(
    path: RequestInfo,
    { ...options }
) {
    const { API_URL_CITIZEN } = useRuntimeConfig().public;
    let token = useCookie($XCMS_TOKEN).value;

    if (process.client && ['get', 'post', 'delete', 'put', 'patch'].includes(options?.method?.toLowerCase() ?? '')) {
        token = getCookie($XCMS_TOKEN);
    }

    const url = useRequestURL();
    const hostName = url.hostname;

    let headers: any = {
        accept: 'application/json',
        ...options?.headers,
        ...(token && { [AUTH_HEADER]: `Bearer ${token}` })
    };

    if (process.server) {
        headers = {
            ...headers,
            ...useRequestHeaders(['cookie']),
            referer: hostName,
        };
    }

    try {
        return await $fetch<T, R>(path, {
            baseURL: API_URL_CITIZEN,
            ...options,
            headers
        });
    } catch (error) {
        if (!(error instanceof FetchError)) throw error;
        const status = error.response?.status ?? -1;

        if (status === 401) {
            if (isRefreshing) {
                // Wait for token refresh
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    headers[AUTH_HEADER] = `Bearer ${token}`;
                    return $fetch<T, R>(path, {
                        baseURL: API_URL_CITIZEN,
                        ...options,
                        headers
                    });
                });
            }

            isRefreshing = true;

            try {
                const newToken = await refreshToken();
                isRefreshing = false;
                processQueue(null, newToken);
                
                // Retry original request with new token
                headers[AUTH_HEADER] = `Bearer ${newToken}`;
                return await $fetch<T, R>(path, {
                    baseURL: API_URL_CITIZEN,
                    ...options,
                    headers
                });
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                throw refreshError;
            }
        }

        if ([500].includes(status)) {
            console.error('[Http Error]', error.data?.message, error.data);
        }
        throw error;
    }
}

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
}
