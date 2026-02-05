export function id(prefix: string): string {
	return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
}

export function nowMs(): number {
	return Date.now();
}
