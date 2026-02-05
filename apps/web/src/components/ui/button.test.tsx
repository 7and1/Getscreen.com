import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
	it('renders button with text', () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
	});

	it('renders with default variant', () => {
		render(<Button>Default</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with primary variant', () => {
		render(<Button variant="default">Primary</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with secondary variant', () => {
		render(<Button variant="secondary">Secondary</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with outline variant', () => {
		render(<Button variant="outline">Outline</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with ghost variant', () => {
		render(<Button variant="ghost">Ghost</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with link variant', () => {
		render(<Button variant="link">Link</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with destructive variant', () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with small size', () => {
		render(<Button size="sm">Small</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with default size', () => {
		render(<Button size="default">Default</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with large size', () => {
		render(<Button size="lg">Large</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with icon size', () => {
		render(<Button size="icon">+</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('handles disabled state', () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeDisabled();
	});

	it('accepts custom className', () => {
		render(<Button className="custom-class">Custom</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass('custom-class');
	});

	it('renders as child component with asChild', () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>
		);
		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/test');
	});
});
