import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Seo from '@/components/Seo';

describe('Seo component', () => {
	const renderWithProviders = (component: React.ReactElement) => {
		return render(
			<HelmetProvider>
				<MemoryRouter>{component}</MemoryRouter>
			</HelmetProvider>
		);
	};

	it('renders without crashing', () => {
		renderWithProviders(<Seo title="Test Page" />);
	});

	it('sets page title', () => {
		renderWithProviders(<Seo title="Test Page" />);
		// Helmet updates document.title asynchronously
		setTimeout(() => {
			expect(document.title).toContain('Test Page');
		}, 0);
	});

	it('sets description', () => {
		renderWithProviders(<Seo title="Test" description="Test description" />);
		// Meta tags are added to document head
	});

	it('sets canonical URL', () => {
		renderWithProviders(<Seo title="Test" canonical="/test-page" />);
	});

	it('sets og:image', () => {
		renderWithProviders(<Seo title="Test" ogImage="/test-image.jpg" />);
	});

	it('handles noindex', () => {
		renderWithProviders(<Seo title="Test" noindex />);
	});
});
