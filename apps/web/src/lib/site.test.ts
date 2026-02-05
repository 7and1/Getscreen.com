import { describe, expect, it } from 'vitest';
import { SITE_NAME, SITE_TAGLINE, DEFAULT_OG_IMAGE_PATH } from '@/lib/site';

describe('site constants', () => {
	it('exports SITE_NAME', () => {
		expect(SITE_NAME).toBeTruthy();
		expect(typeof SITE_NAME).toBe('string');
	});

	it('exports SITE_TAGLINE', () => {
		expect(SITE_TAGLINE).toBeTruthy();
		expect(typeof SITE_TAGLINE).toBe('string');
	});

	it('exports DEFAULT_OG_IMAGE_PATH', () => {
		expect(DEFAULT_OG_IMAGE_PATH).toBeTruthy();
		expect(typeof DEFAULT_OG_IMAGE_PATH).toBe('string');
		expect(DEFAULT_OG_IMAGE_PATH).toMatch(/^\/.*\.(svg|png|jpg|jpeg)$/);
	});

	it('SITE_NAME is VisionLink AI', () => {
		expect(SITE_NAME).toBe('VisionLink AI');
	});

	it('SITE_TAGLINE contains relevant keywords', () => {
		expect(SITE_TAGLINE.toLowerCase()).toMatch(/ai|remote|desktop|rpa|scraping|support/);
	});
});
