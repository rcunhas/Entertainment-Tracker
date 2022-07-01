import { IList } from "./lists.model";

export function randomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function randomFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function randomElement<T>(array: T[]): T {
	return array[randomInteger(0, array.length)];
}

export function verifyIfDuplicate(data: IList[]) {
	console.log(data.length);
	const set = new Set<string>();
	const mapData = data.map(entry => {
		set.add(entry.name)
		return entry.name;
	});
	console.log('NAMES', mapData);
	console.log(set);
	console.log(set.keys.length);
	console.log(data.filter(entry => {
		if (set.has(entry.name)) {
			set.delete(entry.name);
			return false;
		}
		return true;
	}).map(entry => entry.name))
}
