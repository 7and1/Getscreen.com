import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PricingPage from '@/pages/marketing/PricingPage';

describe('PricingPage', () => {
	const renderWithProviders = (component: React.ReactElement) => {
		return render(
			<HelmetProvider>
				<MemoryRouter>{component}</MemoryRouter>
			</HelmetProvider>
		);
	};

	it('renders pricing page', () => {
		renderWithProviders(<PricingPage />);
		const heading = screen.queryByRole('heading', { level: 1 });
		expect(heading).toBeInTheDocument();
	});

	it('renders pricing plans', () => {
		renderWithProviders(<PricingPage />);
		// Should have multiple pricing cards/sections
		const headings = screen.queryAllByRole('heading');
		expect(headings.length).toBeGreaterThan(0);
	});

	it('renders CTA buttons', () => {
		renderWithProviders(<PricingPage />);
		const buttons = screen.queryAllByRole('button');
		const links = screen.queryAllByRole('link');
		expect(buttons.length + links.length).toBeGreaterThan(0);
	});
});
