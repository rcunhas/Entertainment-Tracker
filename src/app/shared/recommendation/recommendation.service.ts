import { Injectable } from "@angular/core";
import { IBookList, IGameList, IMovieList } from "../models/lists.model";

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
		console.log(`BOOKS`, readBooks.length);
		return this.getUserEntries(featureMap, readBooks.length);
	}

	calculateGamesRecomendation(gamesList: IGameList[]) : Map<string,number> | null{
		const games = gamesList.slice();
		const playedGames = games.filter(game => game.checkbox);

		if (playedGames.length === 0) return null;

		const featureMap : Map<string, number[]> =  new Map<string,number[]>();

		for (let game of playedGames) {
			const score = game.score;
			this.calculateArray(game.whereToPlay.slice(), score, featureMap);

			if (game.singleplayer) this.addEntry('SinglePlayer', score, featureMap);
			if (game.multiplayer) this.addEntry('MultiPlayer', score, featureMap);

			const genres = game.genre.slice();
			this.calculateGenres(genres, score, featureMap);
		}
		console.log('GAMES', playedGames.length);
		return this.getUserEntries(featureMap, playedGames.length);
	}

	calculateMoviesRecomendation(moviesList: IMovieList[]) : Map<string,number> | null{
		const movies = moviesList.slice();
		const watchedMovies = movies.filter(game => game.checkbox);

		if (watchedMovies.length === 0) return null;

		const featureMap : Map<string, number[]> =  new Map<string,number[]>();

		for (let movie of watchedMovies) {
			const score = movie.score;
			this.calculateArray(movie.whereToStream.slice(), score, featureMap);
			// this.calculateArray(movie.type.slice(), score, featureMap);

			let genres = movie.genre.slice();
			genres.push(...movie.type.slice());
			genres = genres.sort((a,b) => a.localeCompare(b));
			this.calculateGenres(genres, score, featureMap);
		}
		console.log('MOVIES', watchedMovies.length);
		return this.getUserEntries(featureMap, watchedMovies.length);
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

	getUserEntries(featureMap: Map<string, number[]>, total: number) {
		const userEntries : Map<string, number> =  new Map<string,number>();

		console.log(featureMap);

		for (let [key, value] of featureMap.entries()) {
			value = value.sort((a,b) => a - b);
			if (value.length > 3) {
				value.splice(0, 1)
				value.splice(value.length - 1, 1);
			}
			const sum = value.reduce((a, b) => a + b, 0);
			const avg = Math.min( ((sum / value.length) || 0) * (1 + ((value.length/total)/10)), 10);
			userEntries.set(key, Math.round((avg + Number.EPSILON) * 100) / 100)
		}
		console.log(userEntries);

		return userEntries;
	}
}
