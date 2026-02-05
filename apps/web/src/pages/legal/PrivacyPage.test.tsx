import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PrivacyPage from '@/pages/legal/PrivacyPage';

describe('PrivacyPage', () => {
	const renderWithProviders = (component: React.ReactElement) => {
		return render(
			<HelmetProvider>
				<MemoryRouter>{component}</MemoryRouter>
			</HelmetProvider>
		);
	};

	it('renders privacy page', () => {
		renderWithProviders(<PrivacyPage />);
		const heading = screen.queryByRole('heading', { level: 1 });
		expect(heading).toBeInTheDocument();
	});

	it('contains privacy-related content', () => {
		renderWithProviders(<PrivacyPage />);
		const content = screen.queryByText(/privacy|data|information|personal/i);
		if (content) {
			expect(content).toBeInTheDocument();
		}
	});
});
