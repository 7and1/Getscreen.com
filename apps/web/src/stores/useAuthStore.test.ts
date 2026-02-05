import { describe, expect, it, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/useAuthStore';

describe('useAuthStore', () => {
	beforeEach(() => {
		useAuthStore.getState().clear();
	});

	it('initializes with null apiKey', () => {
		const state = useAuthStore.getState();
		expect(state.apiKey).toBeNull();
	});

	it('sets API key', () => {
		const { setApiKey } = useAuthStore.getState();
		setApiKey('test_api_key');
		expect(useAuthStore.getState().apiKey).toBe('test_api_key');
	});

	it('trims API key', () => {
		const { setApiKey } = useAuthStore.getState();
		setApiKey('  test_api_key  ');
		expect(useAuthStore.getState().apiKey).toBe('test_api_key');
	});

	it('sets null for empty string', () => {
		const { setApiKey } = useAuthStore.getState();
		setApiKey('');
		expect(useAuthStore.getState().apiKey).toBeNull();
	});

	it('sets null for whitespace-only string', () => {
		const { setApiKey } = useAuthStore.getState();
		setApiKey('   ');
		expect(useAuthStore.getState().apiKey).toBeNull();
	});

	it('clears API key', () => {
		const { setApiKey, clear } = useAuthStore.getState();
		setApiKey('test_api_key');
		clear();
		expect(useAuthStore.getState().apiKey).toBeNull();
	});

	it('updates API key', () => {
		const { setApiKey } = useAuthStore.getState();
		setApiKey('first_key');
		expect(useAuthStore.getState().apiKey).toBe('first_key');
		setApiKey('second_key');
		expect(useAuthStore.getState().apiKey).toBe('second_key');
	});
});
