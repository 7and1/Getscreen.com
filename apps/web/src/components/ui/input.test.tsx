import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input component', () => {
	it('renders input', () => {
		render(<Input />);
		expect(screen.getByRole('textbox')).toBeInTheDocument();
	});

	it('renders with placeholder', () => {
		render(<Input placeholder="Enter text" />);
		expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
	});

	it('renders with value', () => {
		render(<Input value="test value" readOnly />);
		expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
	});

	it('handles disabled state', () => {
		render(<Input disabled />);
		expect(screen.getByRole('textbox')).toBeDisabled();
	});

	it('accepts custom className', () => {
		render(<Input className="custom-class" />);
		expect(screen.getByRole('textbox')).toHaveClass('custom-class');
	});

	it('renders with type', () => {
		render(<Input type="email" />);
		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('type', 'email');
	});

	it('renders password input', () => {
		const { container } = render(<Input type="password" />);
		const input = container.querySelector('input[type="password"]');
		expect(input).toBeInTheDocument();
	});

	it('renders number input', () => {
		const { container } = render(<Input type="number" />);
		const input = container.querySelector('input[type="number"]');
		expect(input).toBeInTheDocument();
	});
});
