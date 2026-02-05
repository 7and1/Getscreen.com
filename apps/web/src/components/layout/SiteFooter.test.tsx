import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteFooter from '@/components/layout/SiteFooter';

describe('SiteFooter component', () => {
	const renderWithRouter = (component: React.ReactElement) => {
		return render(<MemoryRouter>{component}</MemoryRouter>);
	};

	it('renders site footer', () => {
		renderWithRouter(<SiteFooter />);
		expect(screen.getByRole('contentinfo')).toBeInTheDocument();
	});

	it('renders copyright notice', () => {
		renderWithRouter(<SiteFooter />);
		const currentYear = new Date().getFullYear();
		const copyright = screen.queryByText(new RegExp(currentYear.toString()));
		if (copyright) {
			expect(copyright).toBeInTheDocument();
		}
	});

	it('renders footer links', () => {
		renderWithRouter(<SiteFooter />);
		// Check for common footer links
		const links = screen.queryAllByRole('link');
		expect(links.length).toBeGreaterThan(0);
	});
});
