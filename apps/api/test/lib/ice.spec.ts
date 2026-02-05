import { describe, expect, it } from 'vitest';
import { getIceServers } from '../../src/lib/ice';

describe('ice', () => {
	describe('getIceServers', () => {
		it('returns default STUN server when no config', () => {
			const result = getIceServers({});
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('returns default when ICE_SERVERS_JSON is undefined', () => {
			const result = getIceServers({ ICE_SERVERS_JSON: undefined });
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('returns default when ICE_SERVERS_JSON is empty', () => {
			const result = getIceServers({ ICE_SERVERS_JSON: '' });
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('parses valid JSON array', () => {
			const config = JSON.stringify([
				{ urls: ['stun:stun.example.com:19302'] },
			]);
			const result = getIceServers({ ICE_SERVERS_JSON: config });
			expect(result).toEqual([{ urls: ['stun:stun.example.com:19302'] }]);
		});

		it('parses multiple servers', () => {
			const config = JSON.stringify([
				{ urls: ['stun:stun1.example.com:19302'] },
				{ urls: ['stun:stun2.example.com:19302'] },
			]);
			const result = getIceServers({ ICE_SERVERS_JSON: config });
			expect(result).toHaveLength(2);
		});

		it('parses TURN server with credentials', () => {
			const config = JSON.stringify([
				{
					urls: ['turn:turn.example.com:3478'],
					username: 'user',
					credential: 'pass',
				},
			]);
			const result = getIceServers({ ICE_SERVERS_JSON: config });
			expect(result[0].username).toBe('user');
			expect(result[0].credential).toBe('pass');
		});

		it('parses server with multiple URLs', () => {
			const config = JSON.stringify([
				{
					urls: ['stun:stun.example.com:19302', 'stun:stun2.example.com:19302'],
				},
			]);
			const result = getIceServers({ ICE_SERVERS_JSON: config });
			expect(result[0].urls).toHaveLength(2);
		});

		it('returns default on invalid JSON', () => {
			const result = getIceServers({ ICE_SERVERS_JSON: '{invalid}' });
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('returns default when JSON is not array', () => {
			const config = JSON.stringify({ urls: ['stun:stun.example.com'] });
			const result = getIceServers({ ICE_SERVERS_JSON: config });
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('returns default when JSON is null', () => {
			const result = getIceServers({ ICE_SERVERS_JSON: 'null' });
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('returns default when JSON is string', () => {
			const result = getIceServers({ ICE_SERVERS_JSON: '"string"' });
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('returns default when JSON is number', () => {
			const result = getIceServers({ ICE_SERVERS_JSON: '123' });
			expect(result).toEqual([{ urls: ['stun:stun.l.google.com:19302'] }]);
		});

		it('handles empty array', () => {
			const result = getIceServers({ ICE_SERVERS_JSON: '[]' });
			expect(result).toEqual([]);
		});

		it('preserves server structure', () => {
			const servers = [
				{
					urls: ['stun:stun.l.google.com:19302'],
				},
				{
					urls: ['turn:turn.example.com:3478', 'turn:turn.example.com:3479'],
					username: 'testuser',
					credential: 'testpass',
				},
			];
			const config = JSON.stringify(servers);
			const result = getIceServers({ ICE_SERVERS_JSON: config });
			expect(result).toEqual(servers);
		});
	});
});
