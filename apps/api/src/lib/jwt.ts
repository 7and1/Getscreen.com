import { decodeJsonBase64Url, decodeBase64UrlToBytes, encodeJsonBase64Url, encodeBase64Url } from './base64url';
import { hmacSha256, timingSafeEqualBytes } from './crypto';

export type JwtHeader = { alg: 'HS256'; typ: 'JWT' };

export type JwtPayload = Record<string, unknown> & {
	exp?: number; // epoch seconds
	iat?: number; // epoch seconds
};

export async function signJwtHs256(payload: JwtPayload, secret: string): Promise<string> {
	const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
	const encodedHeader = encodeJsonBase64Url(header);
	const encodedPayload = encodeJsonBase64Url(payload);
	const signingInput = `${encodedHeader}.${encodedPayload}`;
	const signatureBytes = await hmacSha256(secret, signingInput);
	const encodedSig = encodeBase64Url(signatureBytes);
	return `${signingInput}.${encodedSig}`;
}

export async function verifyJwtHs256(token: string, secret: string): Promise<JwtPayload> {
	const parts = token.split('.');
	if (parts.length !== 3) throw new Error('Invalid JWT format');
	const [encodedHeader, encodedPayload, encodedSig] = parts;

	const header = decodeJsonBase64Url<JwtHeader>(encodedHeader);
	if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new Error('Unsupported JWT');

	const signingInput = `${encodedHeader}.${encodedPayload}`;
	const expectedSig = await hmacSha256(secret, signingInput);
	const actualSig = decodeBase64UrlToBytes(encodedSig);
	if (!timingSafeEqualBytes(expectedSig, actualSig)) throw new Error('Bad JWT signature');

	const payload = decodeJsonBase64Url<JwtPayload>(encodedPayload);
	const exp = typeof payload.exp === 'number' ? payload.exp : undefined;
	if (exp && Math.floor(Date.now() / 1000) >= exp) throw new Error('JWT expired');
	return payload;
}

export function decodeJwtPayloadUnsafe(token: string): JwtPayload | null {
	const parts = token.split('.');
	if (parts.length !== 3) return null;
	try {
		return decodeJsonBase64Url<JwtPayload>(parts[1]);
	} catch {
		return null;
	}
}
