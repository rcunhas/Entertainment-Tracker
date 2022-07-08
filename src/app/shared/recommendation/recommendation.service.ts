import { Injectable } from "@angular/core";
import { IBookList, IGameList } from "../models/lists.model";

@Injectable({
	providedIn: 'root'
})
export class RecommendationService {

	constructor() {}

	calculateBooksRecomendation(bookList: IBookList[]) : Map<string,number> | null{
		const books = bookList.slice();
		const readBooks = books.filter(book => book.checkbox);

		if (readBooks.length === 0) return null;

		const featureMap : Map<string, number[]> =  new Map<string,number[]>();

		for (let book of readBooks) {
			const author = book.author;
			const score = book.score;
			this.addEntry(author, score, featureMap);

			const genres = book.genre.slice();
			this.calculateGenres(genres, score, featureMap);
		}

		return this.getUserEntries(featureMap);
	}

	calculateGamesRecomendation(gamesList: IGameList[]) : Map<string,number> | null{
		const games = gamesList.slice();
		const playedGames = games.filter(game => game.checkbox);

		if (playedGames.length === 0) return null;

		const featureMap : Map<string, number[]> =  new Map<string,number[]>();

		for (let game of playedGames) {
			const score = game.score;
			// this.calculateArray(game.whereToPlay.slice(), score, featureMap);

			if (game.singleplayer) this.addEntry('SinglePlayer', score, featureMap);
			if (game.multiplayer) this.addEntry('MultiPlayer', score, featureMap);

			const genres = game.genre.slice();
			this.calculateGenres(genres, score, featureMap);
		}

		return this.getUserEntries(featureMap);
	}

	calculateArray(array: string[], score: number, features: Map<string, number[]>) {
		for (let i = 0; i < array.length; i++) {
			const key = array[i];
			this.addEntry(key, score, features);
		}
	}

	calculateGenres(genres: string[], score: number, features: Map<string, number[]>) {
		for (let i = 0; i < genres.length; i++) {
			const genre = genres[i];
			this.addEntry(genre, score, features);
			for (let j = i + 1; j < genres.length; j++) {
				const key = `${genre}/${genres[j]}`;
				this.addEntry(key, score, features);
			}
		}
	}

	addEntry(key : string, value: number, featureMap: Map<string, number[]>) {
		const values = (featureMap.get(key) || [])
		values.push(value);
		featureMap.set(key, values);
	}

	getUserEntries(featureMap: Map<string, number[]>) {
		const userEntries : Map<string, number> =  new Map<string,number>();

		for (let [key, value] of featureMap.entries()) {
			const sum = value.reduce((a, b) => a + b, 0);
			const avg = (sum / value.length) || 0;
			userEntries.set(key, Math.round((avg + Number.EPSILON) * 100) / 100)
		}

		return userEntries;
	}
}
