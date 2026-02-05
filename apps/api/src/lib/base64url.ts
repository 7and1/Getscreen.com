export function encodeBase64Url(bytes: Uint8Array): string {
	let binary = '';
	const chunkSize = 0x8000;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	}
	return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

export function decodeBase64UrlToBytes(base64Url: string): Uint8Array {
	const base64 = base64Url
		.replaceAll('-', '+')
		.replaceAll('_', '/')
		.padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

export function encodeJsonBase64Url(value: unknown): string {
	return encodeBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

export function decodeJsonBase64Url<T>(base64Url: string): T {
	const bytes = decodeBase64UrlToBytes(base64Url);
	return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
