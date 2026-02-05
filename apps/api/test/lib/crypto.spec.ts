import { describe, expect, it } from 'vitest';
import { sha256Hex, hmacSha256, timingSafeEqualBytes } from '../../src/lib/crypto';

describe('crypto', () => {
	describe('sha256Hex', () => {
		it('hashes empty string', async () => {
			const result = await sha256Hex('');
			expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
		});

		it('hashes simple string', async () => {
			const result = await sha256Hex('hello');
			expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
		});

		it('hashes complex string', async () => {
			const result = await sha256Hex('The quick brown fox jumps over the lazy dog');
			expect(result).toBe('d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592');
		});

		it('produces different hashes for different inputs', async () => {
			const hash1 = await sha256Hex('test1');
			const hash2 = await sha256Hex('test2');
			expect(hash1).not.toBe(hash2);
		});

		it('produces consistent hashes', async () => {
			const hash1 = await sha256Hex('consistent');
			const hash2 = await sha256Hex('consistent');
			expect(hash1).toBe(hash2);
		});

		it('returns 64 character hex string', async () => {
			const result = await sha256Hex('test');
			expect(result).toHaveLength(64);
			expect(result).toMatch(/^[0-9a-f]{64}$/);
		});

		it('handles unicode characters', async () => {
			const result = await sha256Hex('Hello 世界 🌍');
			expect(result).toHaveLength(64);
			expect(result).toMatch(/^[0-9a-f]{64}$/);
		});
	});

	describe('hmacSha256', () => {
		it('generates HMAC for empty data', async () => {
			const result = await hmacSha256('secret', '');
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result.length).toBe(32);
		});

		it('generates HMAC for simple data', async () => {
			const result = await hmacSha256('secret', 'message');
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result.length).toBe(32);
		});

		it('produces different HMACs for different secrets', async () => {
			const hmac1 = await hmacSha256('secret1', 'message');
			const hmac2 = await hmacSha256('secret2', 'message');
			expect(hmac1).not.toEqual(hmac2);
		});

		it('produces different HMACs for different messages', async () => {
			const hmac1 = await hmacSha256('secret', 'message1');
			const hmac2 = await hmacSha256('secret', 'message2');
			expect(hmac1).not.toEqual(hmac2);
		});

		it('produces consistent HMACs', async () => {
			const hmac1 = await hmacSha256('secret', 'message');
			const hmac2 = await hmacSha256('secret', 'message');
			expect(hmac1).toEqual(hmac2);
		});

		it('handles long secrets', async () => {
			const longSecret = 'a'.repeat(1000);
			const result = await hmacSha256(longSecret, 'message');
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result.length).toBe(32);
		});

		it('handles long messages', async () => {
			const longMessage = 'b'.repeat(10000);
			const result = await hmacSha256('secret', longMessage);
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result.length).toBe(32);
		});
	});

	describe('timingSafeEqualBytes', () => {
		it('returns true for equal empty arrays', () => {
			const a = new Uint8Array([]);
			const b = new Uint8Array([]);
			expect(timingSafeEqualBytes(a, b)).toBe(true);
		});

		it('returns true for equal single-byte arrays', () => {
			const a = new Uint8Array([42]);
			const b = new Uint8Array([42]);
			expect(timingSafeEqualBytes(a, b)).toBe(true);
		});

		it('returns true for equal multi-byte arrays', () => {
			const a = new Uint8Array([1, 2, 3, 4, 5]);
			const b = new Uint8Array([1, 2, 3, 4, 5]);
			expect(timingSafeEqualBytes(a, b)).toBe(true);
		});

		it('returns false for different lengths', () => {
			const a = new Uint8Array([1, 2, 3]);
			const b = new Uint8Array([1, 2]);
			expect(timingSafeEqualBytes(a, b)).toBe(false);
		});

		it('returns false for different values', () => {
			const a = new Uint8Array([1, 2, 3]);
			const b = new Uint8Array([1, 2, 4]);
			expect(timingSafeEqualBytes(a, b)).toBe(false);
		});

		it('returns false for single bit difference', () => {
			const a = new Uint8Array([0b10101010]);
			const b = new Uint8Array([0b10101011]);
			expect(timingSafeEqualBytes(a, b)).toBe(false);
		});

		it('handles all zeros', () => {
			const a = new Uint8Array(32).fill(0);
			const b = new Uint8Array(32).fill(0);
			expect(timingSafeEqualBytes(a, b)).toBe(true);
		});

		it('handles all ones', () => {
			const a = new Uint8Array(32).fill(255);
			const b = new Uint8Array(32).fill(255);
			expect(timingSafeEqualBytes(a, b)).toBe(true);
		});

		it('returns false when first byte differs', () => {
			const a = new Uint8Array([1, 2, 3, 4]);
			const b = new Uint8Array([2, 2, 3, 4]);
			expect(timingSafeEqualBytes(a, b)).toBe(false);
		});

		it('returns false when last byte differs', () => {
			const a = new Uint8Array([1, 2, 3, 4]);
			const b = new Uint8Array([1, 2, 3, 5]);
			expect(timingSafeEqualBytes(a, b)).toBe(false);
		});

		it('handles large arrays', () => {
			const a = new Uint8Array(10000).fill(42);
			const b = new Uint8Array(10000).fill(42);
			expect(timingSafeEqualBytes(a, b)).toBe(true);
		});

		it('detects difference in large arrays', () => {
			const a = new Uint8Array(10000).fill(42);
			const b = new Uint8Array(10000).fill(42);
			b[5000] = 43;
			expect(timingSafeEqualBytes(a, b)).toBe(false);
		});
	});
});
