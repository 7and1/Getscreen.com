import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from '@/components/ui/spinner';

describe('Spinner component', () => {
	it('renders spinner', () => {
		const { container } = render(<Spinner />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('renders with small size', () => {
		const { container } = render(<Spinner size="sm" />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('renders with default size', () => {
		const { container } = render(<Spinner size="default" />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('renders with large size', () => {
		const { container } = render(<Spinner size="lg" />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(<Spinner className="custom-class" />);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});
