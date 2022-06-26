export function randomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function randomFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function randomElement<T>(array: T[]): T {
	return array[randomInteger(0, array.length)];
}
