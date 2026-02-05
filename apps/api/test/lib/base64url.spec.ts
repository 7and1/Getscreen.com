import { describe, expect, it } from 'vitest';
import {
	encodeBase64Url,
	decodeBase64UrlToBytes,
	encodeJsonBase64Url,
	decodeJsonBase64Url,
} from '../../src/lib/base64url';

describe('base64url', () => {
	describe('encodeBase64Url', () => {
		it('encodes empty bytes', () => {
			const result = encodeBase64Url(new Uint8Array([]));
			expect(result).toBe('');
		});

		it('encodes single byte', () => {
			const result = encodeBase64Url(new Uint8Array([65]));
			expect(result).toBe('QQ');
		});

		it('encodes multiple bytes', () => {
			const result = encodeBase64Url(new Uint8Array([72, 101, 108, 108, 111]));
			expect(result).toBe('SGVsbG8');
		});

		it('replaces + with -', () => {
			const result = encodeBase64Url(new Uint8Array([251, 239]));
			expect(result).toContain('-');
			expect(result).not.toContain('+');
		});

		it('replaces / with _', () => {
			const result = encodeBase64Url(new Uint8Array([255, 239]));
			expect(result).toContain('_');
			expect(result).not.toContain('/');
		});

		it('removes padding', () => {
			const result = encodeBase64Url(new Uint8Array([72, 101, 108, 108, 111, 33]));
			expect(result).not.toContain('=');
		});

		it('handles large arrays', () => {
			const large = new Uint8Array(100000).fill(42);
			const result = encodeBase64Url(large);
			expect(result.length).toBeGreaterThan(0);
			expect(result).not.toContain('=');
		});
	});

	describe('decodeBase64UrlToBytes', () => {
		it('decodes empty string', () => {
			const result = decodeBase64UrlToBytes('');
			expect(result).toEqual(new Uint8Array([]));
		});

		it('decodes single byte', () => {
			const result = decodeBase64UrlToBytes('QQ');
			expect(result).toEqual(new Uint8Array([65]));
		});

		it('decodes multiple bytes', () => {
			const result = decodeBase64UrlToBytes('SGVsbG8');
			expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
		});

		it('handles - as +', () => {
			const result = decodeBase64UrlToBytes('--8');
			expect(result).toBeInstanceOf(Uint8Array);
		});

		it('handles _ as /', () => {
			const result = decodeBase64UrlToBytes('__8');
			expect(result).toBeInstanceOf(Uint8Array);
		});

		it('adds padding automatically', () => {
			const result = decodeBase64UrlToBytes('SGVsbG8');
			expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
		});

		it('round-trips with encode', () => {
			const original = new Uint8Array([1, 2, 3, 4, 5, 255, 254, 253]);
			const encoded = encodeBase64Url(original);
			const decoded = decodeBase64UrlToBytes(encoded);
			expect(decoded).toEqual(original);
		});
	});

	describe('encodeJsonBase64Url', () => {
		it('encodes null', () => {
			const result = encodeJsonBase64Url(null);
			expect(result).toBe('bnVsbA');
		});

		it('encodes object', () => {
			const result = encodeJsonBase64Url({ foo: 'bar' });
			expect(result).toBeTruthy();
			expect(result).not.toContain('=');
		});

		it('encodes array', () => {
			const result = encodeJsonBase64Url([1, 2, 3]);
			expect(result).toBeTruthy();
		});

		it('encodes string', () => {
			const result = encodeJsonBase64Url('hello');
			expect(result).toBeTruthy();
		});

		it('encodes number', () => {
			const result = encodeJsonBase64Url(42);
			expect(result).toBe('NDI');
		});

		it('encodes boolean', () => {
			const result = encodeJsonBase64Url(true);
			expect(result).toBe('dHJ1ZQ');
		});
	});

	describe('decodeJsonBase64Url', () => {
		it('decodes null', () => {
			const result = decodeJsonBase64Url('bnVsbA');
			expect(result).toBeNull();
		});

		it('decodes object', () => {
			const encoded = encodeJsonBase64Url({ foo: 'bar', num: 123 });
			const result = decodeJsonBase64Url<{ foo: string; num: number }>(encoded);
			expect(result).toEqual({ foo: 'bar', num: 123 });
		});

		it('decodes array', () => {
			const encoded = encodeJsonBase64Url([1, 2, 3]);
			const result = decodeJsonBase64Url<number[]>(encoded);
			expect(result).toEqual([1, 2, 3]);
		});

		it('decodes string', () => {
			const encoded = encodeJsonBase64Url('hello');
			const result = decodeJsonBase64Url<string>(encoded);
			expect(result).toBe('hello');
		});

		it('round-trips complex object', () => {
			const original = {
				str: 'test',
				num: 42,
				bool: true,
				arr: [1, 2, 3],
				nested: { a: 1, b: 2 },
			};
			const encoded = encodeJsonBase64Url(original);
			const decoded = decodeJsonBase64Url<typeof original>(encoded);
			expect(decoded).toEqual(original);
		});

		it('throws on invalid base64', () => {
			expect(() => decodeJsonBase64Url('!!!')).toThrow();
		});

		it('throws on invalid json', () => {
			const invalidJson = encodeBase64Url(new TextEncoder().encode('{invalid}'));
			expect(() => decodeJsonBase64Url(invalidJson)).toThrow();
		});
	});
});
