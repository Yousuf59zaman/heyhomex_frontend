import { $fetch, FetchError } from 'ofetch';

export const $XADM_TOKEN = 'XADM-TOKEN';
const AUTH_HEADER = 'Authorization';

interface ResponseMap {
	blob: Blob;
	text: string;
	arrayBuffer: ArrayBuffer;
}
type ResponseType = keyof ResponseMap | 'json';

export async function $fetchAdmin<T, R extends ResponseType = 'json'>(
	path: RequestInfo,
	{ ...options }
) {
	const { API_URL_ADMIN } = useRuntimeConfig().public;
	let token = useCookie($XADM_TOKEN).value;

	if (process.client && ['get', 'post', 'delete', 'put', 'patch'].includes(options?.method?.toLowerCase() ?? '')) {
		token = getCookie($XADM_TOKEN);
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
			baseURL: API_URL_ADMIN,
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
