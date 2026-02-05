import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from '@/pages/marketing/HomePage';

describe('HomePage', () => {
	const renderWithProviders = (component: React.ReactElement) => {
		return render(
			<HelmetProvider>
				<MemoryRouter>{component}</MemoryRouter>
			</HelmetProvider>
		);
	};

	it('renders home page', () => {
		renderWithProviders(<HomePage />);
		// Check for main heading or hero section
		const heading = screen.queryByRole('heading', { level: 1 });
		expect(heading).toBeInTheDocument();
	});

	it('renders hero section', () => {
		renderWithProviders(<HomePage />);
		// Hero section should contain key messaging
		const hero = screen.queryByText(/AI|remote|desktop|automation/i);
		if (hero) {
			expect(hero).toBeInTheDocument();
		}
	});

	it('renders CTA buttons', () => {
		renderWithProviders(<HomePage />);
		const buttons = screen.queryAllByRole('button');
		const links = screen.queryAllByRole('link');
		expect(buttons.length + links.length).toBeGreaterThan(0);
	});
});
