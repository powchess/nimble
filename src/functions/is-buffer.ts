export default function isBuffer(a: unknown): boolean {
	// This covers both Uint8Array and Buffer instances
	if (a instanceof Uint8Array) return true;

	// Check if a standard array, which is slower than the above checks
	return Array.isArray(a) && !a.some((x: number) => !Number.isInteger(x) || x < 0 || x > 255);
}
