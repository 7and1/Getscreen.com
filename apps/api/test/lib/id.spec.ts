import { describe, expect, it } from 'vitest';
import { id, nowMs } from '../../src/lib/id';

describe('id', () => {
	describe('id', () => {
		it('generates id with prefix', () => {
			const result = id('test');
			expect(result).toMatch(/^test_[0-9a-f]{32}$/);
		});

		it('generates unique ids', () => {
			const id1 = id('test');
			const id2 = id('test');
			expect(id1).not.toBe(id2);
		});

		it('handles different prefixes', () => {
			const orgId = id('org');
			const userId = id('usr');
			const deviceId = id('dev');
			expect(orgId).toMatch(/^org_/);
			expect(userId).toMatch(/^usr_/);
			expect(deviceId).toMatch(/^dev_/);
		});

		it('generates id without hyphens', () => {
			const result = id('test');
			expect(result).not.toContain('-');
		});

		it('generates 32 character hex after prefix', () => {
			const result = id('test');
			const hexPart = result.split('_')[1];
			expect(hexPart).toHaveLength(32);
			expect(hexPart).toMatch(/^[0-9a-f]{32}$/);
		});

		it('handles empty prefix', () => {
			const result = id('');
			expect(result).toMatch(/^_[0-9a-f]{32}$/);
		});

		it('handles long prefix', () => {
			const result = id('very_long_prefix_name');
			expect(result).toMatch(/^very_long_prefix_name_[0-9a-f]{32}$/);
		});

		it('generates many unique ids', () => {
			const ids = new Set<string>();
			for (let i = 0; i < 1000; i++) {
				ids.add(id('test'));
			}
			expect(ids.size).toBe(1000);
		});
	});

	describe('nowMs', () => {
		it('returns number', () => {
			const result = nowMs();
			expect(typeof result).toBe('number');
		});

		it('returns positive number', () => {
			const result = nowMs();
			expect(result).toBeGreaterThan(0);
		});

		it('returns milliseconds since epoch', () => {
			const result = nowMs();
			const now = Date.now();
			expect(Math.abs(result - now)).toBeLessThan(100);
		});

		it('returns increasing values', () => {
			const t1 = nowMs();
			const t2 = nowMs();
			expect(t2).toBeGreaterThanOrEqual(t1);
		});

		it('returns integer', () => {
			const result = nowMs();
			expect(Number.isInteger(result)).toBe(true);
		});

		it('returns reasonable timestamp', () => {
			const result = nowMs();
			// Should be after 2020-01-01 and before 2100-01-01
			expect(result).toBeGreaterThan(1577836800000);
			expect(result).toBeLessThan(4102444800000);
		});
	});
});
