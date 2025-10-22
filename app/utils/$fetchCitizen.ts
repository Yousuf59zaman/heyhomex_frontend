import { $fetch, FetchError } from 'ofetch';

export const $XCTN_TOKEN = 'XCTN-TOKEN';
const AUTH_HEADER = 'Authorization';

interface ResponseMap {
	blob: Blob;
	text: string;
	arrayBuffer: ArrayBuffer;
}
type ResponseType = keyof ResponseMap | 'json';

export async function $fetchCitizen<T, R extends ResponseType = 'json'>(
	path: RequestInfo,
	{ ...options }
) {
	const { API_URL_CITIZEN } = useRuntimeConfig().public;
	let token = useCookie($XCTN_TOKEN).value;

	if (process.client && ['get', 'post', 'delete', 'put', 'patch'].includes(options?.method?.toLowerCase() ?? '')) {
		token = getCookie($XCTN_TOKEN);
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
