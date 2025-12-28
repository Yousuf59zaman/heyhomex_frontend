import { $fetch, FetchError } from 'ofetch';

export const $XADV_TOKEN = 'XADV-TOKEN';
const AUTH_HEADER = 'Authorization';

interface ResponseMap {
    blob: Blob;
    text: string;
    arrayBuffer: ArrayBuffer;
}
type ResponseType = keyof ResponseMap | 'json';

export async function $fetchAdvertiser<T, R extends ResponseType = 'json'>(
    path: RequestInfo,
    { ...options }
) {
    const { API_BASE_URL } = useRuntimeConfig().public;
    let token = useCookie($XADV_TOKEN).value;

    if (process.client && ['get', 'post', 'delete', 'put', 'patch'].includes(options?.method?.toLowerCase() ?? '')) {
        token = getCookie($XADV_TOKEN);
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
            baseURL: API_BASE_URL,
            ...options,
            headers
        });
    } catch (error) {
        if (!(error instanceof FetchError)) throw error;
        const status = error.response?.status ?? -1;
        if (status === 401 && import.meta.client) {
            deleteCookie($XADV_TOKEN);
            useCookie($XADV_TOKEN).value = null;
            navigateTo('/');
        }
        throw error;
    }
}
