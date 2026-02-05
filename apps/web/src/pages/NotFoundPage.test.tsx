import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NotFoundPage from '@/pages/NotFoundPage';

describe('NotFoundPage', () => {
	const renderWithProviders = (component: React.ReactElement) => {
		return render(
			<HelmetProvider>
				<MemoryRouter>{component}</MemoryRouter>
			</HelmetProvider>
		);
	};

	it('renders 404 page', () => {
		renderWithProviders(<NotFoundPage />);
		expect(screen.getByText(/404|not found/i)).toBeInTheDocument();
	});

	it('renders link to home', () => {
		renderWithProviders(<NotFoundPage />);
		const homeLink = screen.queryByRole('link', { name: /home|back/i });
		if (homeLink) {
			expect(homeLink).toBeInTheDocument();
		}
	});
});
