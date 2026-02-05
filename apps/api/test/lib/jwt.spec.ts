import { describe, expect, it, beforeEach, vi } from 'vitest';
import { signJwtHs256, verifyJwtHs256, decodeJwtPayloadUnsafe } from '../../src/lib/jwt';

describe('jwt', () => {
	const secret = 'test-secret-key';

	describe('signJwtHs256', () => {
		it('creates valid JWT structure', async () => {
			const payload = { sub: 'user123', name: 'Test User' };
			const token = await signJwtHs256(payload, secret);
			const parts = token.split('.');
			expect(parts).toHaveLength(3);
		});

		it('includes header with correct algorithm', async () => {
			const payload = { sub: 'user123' };
			const token = await signJwtHs256(payload, secret);
			const headerPart = token.split('.')[0];
			const header = JSON.parse(atob(headerPart.replaceAll('-', '+').replaceAll('_', '/')));
			expect(header.alg).toBe('HS256');
			expect(header.typ).toBe('JWT');
		});

		it('includes payload data', async () => {
			const payload = { sub: 'user123', role: 'admin' };
			const token = await signJwtHs256(payload, secret);
			const payloadPart = token.split('.')[1];
			const decoded = JSON.parse(atob(payloadPart.replaceAll('-', '+').replaceAll('_', '/')));
			expect(decoded.sub).toBe('user123');
			expect(decoded.role).toBe('admin');
		});

		it('includes exp claim when provided', async () => {
			const exp = Math.floor(Date.now() / 1000) + 3600;
			const payload = { sub: 'user123', exp };
			const token = await signJwtHs256(payload, secret);
			const decoded = decodeJwtPayloadUnsafe(token);
			expect(decoded?.exp).toBe(exp);
		});

		it('includes iat claim when provided', async () => {
			const iat = Math.floor(Date.now() / 1000);
			const payload = { sub: 'user123', iat };
			const token = await signJwtHs256(payload, secret);
			const decoded = decodeJwtPayloadUnsafe(token);
			expect(decoded?.iat).toBe(iat);
		});

		it('produces different tokens for different payloads', async () => {
			const token1 = await signJwtHs256({ sub: 'user1' }, secret);
			const token2 = await signJwtHs256({ sub: 'user2' }, secret);
			expect(token1).not.toBe(token2);
		});

		it('produces different tokens for different secrets', async () => {
			const payload = { sub: 'user123' };
			const token1 = await signJwtHs256(payload, 'secret1');
			const token2 = await signJwtHs256(payload, 'secret2');
			expect(token1).not.toBe(token2);
		});

		it('produces consistent tokens', async () => {
			const payload = { sub: 'user123', iat: 1234567890 };
			const token1 = await signJwtHs256(payload, secret);
			const token2 = await signJwtHs256(payload, secret);
			expect(token1).toBe(token2);
		});

		it('handles complex payload', async () => {
			const payload = {
				sub: 'user123',
				name: 'Test User',
				roles: ['admin', 'user'],
				metadata: { foo: 'bar', num: 42 },
			};
			const token = await signJwtHs256(payload, secret);
			const decoded = decodeJwtPayloadUnsafe(token);
			expect(decoded).toEqual(payload);
		});
	});

	describe('verifyJwtHs256', () => {
		it('verifies valid token', async () => {
			const payload = { sub: 'user123', name: 'Test' };
			const token = await signJwtHs256(payload, secret);
			const verified = await verifyJwtHs256(token, secret);
			expect(verified.sub).toBe('user123');
			expect(verified.name).toBe('Test');
		});

		it('throws on invalid format', async () => {
			await expect(verifyJwtHs256('invalid', secret)).rejects.toThrow('Invalid JWT format');
		});

		it('throws on missing parts', async () => {
			await expect(verifyJwtHs256('part1.part2', secret)).rejects.toThrow('Invalid JWT format');
		});

		it('throws on too many parts', async () => {
			await expect(verifyJwtHs256('a.b.c.d', secret)).rejects.toThrow('Invalid JWT format');
		});

		it('throws on wrong algorithm', async () => {
			const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
			const payload = btoa(JSON.stringify({ sub: 'user' }));
			const token = `${header}.${payload}.signature`;
			await expect(verifyJwtHs256(token, secret)).rejects.toThrow('Unsupported JWT');
		});

		it('throws on wrong type', async () => {
			const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'WRONG' }));
			const payload = btoa(JSON.stringify({ sub: 'user' }));
			const token = `${header}.${payload}.signature`;
			await expect(verifyJwtHs256(token, secret)).rejects.toThrow('Unsupported JWT');
		});

		it('throws on invalid signature', async () => {
			const token = await signJwtHs256({ sub: 'user123' }, secret);
			const parts = token.split('.');
			parts[2] = 'invalidsignature';
			const tamperedToken = parts.join('.');
			await expect(verifyJwtHs256(tamperedToken, secret)).rejects.toThrow('Bad JWT signature');
		});

		it('throws on wrong secret', async () => {
			const token = await signJwtHs256({ sub: 'user123' }, 'secret1');
			await expect(verifyJwtHs256(token, 'secret2')).rejects.toThrow('Bad JWT signature');
		});

		it('throws on tampered payload', async () => {
			const token = await signJwtHs256({ sub: 'user123' }, secret);
			const parts = token.split('.');
			const tamperedPayload = btoa(JSON.stringify({ sub: 'hacker' }));
			parts[1] = tamperedPayload;
			const tamperedToken = parts.join('.');
			await expect(verifyJwtHs256(tamperedToken, secret)).rejects.toThrow('Bad JWT signature');
		});

		it('throws on expired token', async () => {
			const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
			const token = await signJwtHs256({ sub: 'user123', exp }, secret);
			await expect(verifyJwtHs256(token, secret)).rejects.toThrow('JWT expired');
		});

		it('accepts token expiring in future', async () => {
			const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
			const token = await signJwtHs256({ sub: 'user123', exp }, secret);
			const verified = await verifyJwtHs256(token, secret);
			expect(verified.sub).toBe('user123');
		});

		it('accepts token without exp', async () => {
			const token = await signJwtHs256({ sub: 'user123' }, secret);
			const verified = await verifyJwtHs256(token, secret);
			expect(verified.sub).toBe('user123');
		});

		it('handles token expiring exactly now', async () => {
			const exp = Math.floor(Date.now() / 1000);
			const token = await signJwtHs256({ sub: 'user123', exp }, secret);
			await expect(verifyJwtHs256(token, secret)).rejects.toThrow('JWT expired');
		});
	});

	describe('decodeJwtPayloadUnsafe', () => {
		it('decodes valid token without verification', async () => {
			const payload = { sub: 'user123', name: 'Test' };
			const token = await signJwtHs256(payload, secret);
			const decoded = decodeJwtPayloadUnsafe(token);
			expect(decoded?.sub).toBe('user123');
			expect(decoded?.name).toBe('Test');
		});

		it('returns null for invalid format', () => {
			const result = decodeJwtPayloadUnsafe('invalid');
			expect(result).toBeNull();
		});

		it('returns null for missing parts', () => {
			const result = decodeJwtPayloadUnsafe('part1.part2');
			expect(result).toBeNull();
		});

		it('decodes expired token', async () => {
			const exp = Math.floor(Date.now() / 1000) - 3600;
			const token = await signJwtHs256({ sub: 'user123', exp }, secret);
			const decoded = decodeJwtPayloadUnsafe(token);
			expect(decoded?.sub).toBe('user123');
			expect(decoded?.exp).toBe(exp);
		});

		it('decodes token with wrong signature', async () => {
			const token = await signJwtHs256({ sub: 'user123' }, secret);
			const parts = token.split('.');
			parts[2] = 'wrongsignature';
			const tamperedToken = parts.join('.');
			const decoded = decodeJwtPayloadUnsafe(tamperedToken);
			expect(decoded?.sub).toBe('user123');
		});

		it('returns null for invalid base64', () => {
			const result = decodeJwtPayloadUnsafe('a.!!!.c');
			expect(result).toBeNull();
		});

		it('returns null for invalid json', () => {
			const invalidPayload = btoa('{invalid}');
			const result = decodeJwtPayloadUnsafe(`a.${invalidPayload}.c`);
			expect(result).toBeNull();
		});

		it('handles complex payload', async () => {
			const payload = {
				sub: 'user123',
				roles: ['admin', 'user'],
				metadata: { foo: 'bar' },
			};
			const token = await signJwtHs256(payload, secret);
			const decoded = decodeJwtPayloadUnsafe(token);
			expect(decoded).toEqual(payload);
		});
	});
});
