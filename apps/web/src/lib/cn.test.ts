import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { cn } from '@/lib/cn';

describe('cn utility', () => {
	it('merges class names', () => {
		const result = cn('class1', 'class2');
		expect(result).toContain('class1');
		expect(result).toContain('class2');
	});

	it('handles conditional classes', () => {
		const result = cn('base', true && 'conditional', false && 'excluded');
		expect(result).toContain('base');
		expect(result).toContain('conditional');
		expect(result).not.toContain('excluded');
	});

	it('merges tailwind classes correctly', () => {
		const result = cn('p-2', 'p-4');
		expect(result).toBe('p-4');
	});

	it('handles undefined and null', () => {
		const result = cn('base', undefined, null, 'end');
		expect(result).toContain('base');
		expect(result).toContain('end');
	});

	it('handles arrays', () => {
		const result = cn(['class1', 'class2']);
		expect(result).toContain('class1');
		expect(result).toContain('class2');
	});

	it('handles objects', () => {
		const result = cn({ class1: true, class2: false, class3: true });
		expect(result).toContain('class1');
		expect(result).not.toContain('class2');
		expect(result).toContain('class3');
	});

	it('merges conflicting tailwind utilities', () => {
		const result = cn('bg-red-500', 'bg-blue-500');
		expect(result).toBe('bg-blue-500');
	});

	it('preserves non-conflicting classes', () => {
		const result = cn('p-4 text-center', 'bg-blue-500');
		expect(result).toContain('p-4');
		expect(result).toContain('text-center');
		expect(result).toContain('bg-blue-500');
	});

	it('handles empty input', () => {
		const result = cn();
		expect(result).toBe('');
	});

	it('handles complex tailwind merges', () => {
		const result = cn('px-2 py-1', 'p-4');
		expect(result).toBe('p-4');
	});
});
