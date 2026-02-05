import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton component', () => {
	it('renders skeleton', () => {
		const { container } = render(<Skeleton />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('accepts custom className', () => {
		const { container } = render(<Skeleton className="custom-class" />);
		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('renders with custom dimensions', () => {
		const { container } = render(<Skeleton className="h-10 w-20" />);
		expect(container.firstChild).toHaveClass('h-10', 'w-20');
	});
});
