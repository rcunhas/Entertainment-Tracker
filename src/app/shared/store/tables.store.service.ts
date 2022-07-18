import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IBookList, IChildren, IGameList, IList, IMovieList } from "../models/lists.model";
import booksList from '../../../files/booksList.json'
import gamesList from '../../../files/gamesList.json'
import moviesList from '../../../files/moviesList.json'
import { RecommendationService } from "../recommendation/recommendation.service";

@Injectable({
	providedIn: 'root'
})
export class TablesStore implements OnInit {

	_bookList = new BehaviorSubject<IBookList[]>([])
	_gamesList = new BehaviorSubject<IGameList[]>([])
	_moviesList = new BehaviorSubject<IMovieList[]>([])

	constructor(
		private recService: RecommendationService,
	) {
		this.listBooks();
		this.listGames();
		this.listMovies();
	}

	async ngOnInit() {

	}

	getBooks() {
		return this._bookList.asObservable();
	}

	async listBooks() {
		const storage = localStorage.getItem('booksList');
		let books = (storage !== null ? JSON.parse(storage) : booksList) as IBookList[];
		books = books.sort((a,b) => a.name.localeCompare(b.name));

		books = books.map(book => {
			return book;
		})

		const recTable = await this.recService.calculateBooksRecomendation(books.slice());
		if (recTable != null) {
			books = books.map(book => {
				let value = 0;
				let entries = 0;

				[value, entries] = this.updateRecValue(value, entries, book.owner, recTable);
				if (book.franchise !== '') [value, entries] = this.updateRecValue(value, entries, book.franchise, recTable, false);

				const genres = book.genre.slice();

				[value, entries] = this.updateGenreValues(value, entries, genres, recTable);

				book.recommendation = this.convertToPercentage(value/entries) || -1;
				return book;
			})
		}

		books = books.map(book => {
			book.recChildren = this.getBookRecChildren(books.slice(), book, false);
			book.newRecChildren = this.getBookRecChildren(books.slice(), book, true);
			return book;
		})
		this.setBookData(books);
	}

	setBookData(books: IBookList[]) {
		this._bookList.next(books);
		localStorage.setItem('booksList', JSON.stringify(books));
	}

	getGames() {
		return this._gamesList.asObservable();
	}

	async listGames() {
		const storage = localStorage.getItem('gamesList');
		let games = (storage !== null ? JSON.parse(storage) : gamesList) as IGameList[];
		games = games.sort((a,b) => a.name.localeCompare(b.name));

		games = games.map(game => {
			return game;
		})

		const recTable = await this.recService.calculateGamesRecomendation(games.slice());
		if (recTable != null) {
			games = games.map(game => {
				let value = 0;
				let entries = 0;

				const genres = game.genre.slice();
				const where = game.whereToPlay.slice();

				if (game.singleplayer) [value, entries] = this.updateRecValue(value, entries, 'SinglePlayer', recTable);
				if (game.multiplayer) [value, entries] = this.updateRecValue(value, entries, 'MultiPlayer', recTable);
				if (game.franchise !== '') [value, entries] = this.updateRecValue(value, entries, game.franchise, recTable, false);

				[value, entries] = this.updateGenreValues(value, entries, genres, recTable);
				// [value, entries] = this.updateArray(value, entries, where, recTable);

				game.recommendation = this.convertToPercentage(value/entries) || -1;
				return game;
			})
		}

		games = games.map(game => {
			game.recChildren = this.getGameRecChildren(games.slice(), game, false);
			game.newRecChildren = this.getGameRecChildren(games.slice(), game, true);
			return game;
		})
		this.setGameData(games);
	}

	setGameData(games: IGameList[]) {
		this._gamesList.next(games);
		localStorage.setItem('gamesList', JSON.stringify(games));
	}

	getMovies() {
		return this._moviesList.asObservable();
	}

	async listMovies() {
		const storage = localStorage.getItem('moviesList');
		let movies = (storage !== null ? JSON.parse(storage) : moviesList) as IMovieList[];
		movies = movies.sort((a,b) => a.name.localeCompare(b.name));

		movies = movies.map(movie => {
			return movie;
		})

		const recTable = await this.recService.calculateMoviesRecomendation(movies.slice());
		if (recTable != null) {
			movies = movies.map(movie => {
				let value = 0;
				let entries = 0;

				let genres = movie.genre.slice();
				genres.push(...movie.type.slice());
				genres = genres.sort((a,b) => a.localeCompare(b));
				const where = movie.whereToStream.slice();

				[value, entries] = this.updateGenreValues(value, entries, genres, recTable);
				if (movie.franchise !== '') [value, entries] = this.updateRecValue(value, entries, movie.franchise, recTable, false);
				// [value, entries] = this.updateArray(value, entries, where, recTable);

				movie.recommendation = this.convertToPercentage(value/entries) || -1;
				return movie;
			})
		}

		movies = movies.map(movie => {
			movie.recChildren = this.getMovieRecChildren(movies.slice(), movie, false);
			movie.newRecChildren = this.getMovieRecChildren(movies.slice(), movie, true);
			return movie;
		})

		this.setMovieData(movies);
	}

	setMovieData(movies: IMovieList[]) {
		this._moviesList.next(movies);
		localStorage.setItem('moviesList', JSON.stringify(movies));
	}

	updateArray(value: number, entries: number, array: string[], table: Map<string, number>) {
		for (let i = 0; i < array.length; i++) {
			const key = array[i];
			[value, entries] = this.updateRecValue(value, entries, key, table);
		}
		return [
			value,
			entries,
		]
	}

	updateGenreValues(value: number, entries: number, genres: string[], table: Map<string,number>) {
		for (let i = 0; i < genres.length; i++) {
			const genre = genres[i];
			[value, entries] = this.updateRecValue(value, entries, genre, table);
			for (let j = i + 1; j < genres.length; j++) {
				const key = `${genre}/${genres[j]}`;
				[value, entries] = this.updateRecValue(value, entries, key, table);
			}
		}
		if (genres.length >= 3) {
			const key = genres.join('/');
			[value, entries] = this.updateRecValue(value, entries, key, table);
		}
		return [
			value,
			entries,
		]
	}

	updateRecValue(value: number, entries: number, key: string, table: Map<string,number>, addEntry: boolean = true) {
		const keyValue = table.get(key);
		if (keyValue || addEntry) {
			if (keyValue) {
				value += keyValue;
			}
			entries += 1;
		}
		return [
			value,
			entries,
		]
	}

	convertToPercentage(value: number) {
		return Math.round((value/10) * 100);
	}

	getBookRecChildren(array: IBookList[], entry: IBookList, newOnly: boolean) : IChildren[] {
		return array.filter(a => {
			const canGenre = a.genre.some(genre => entry.genre.includes(genre));
			const hasRead = newOnly ? !a.checkbox : true;
			return canGenre && a.name !== entry.name && hasRead;
		}).sort((a,b) => {
			const aBonus =  entry.owner !== '' ? entry.owner === a.owner ? 1 : -1 : 0;
			const bBonus =  entry.owner !== '' ? entry.owner === b.owner ? 1 : -1 : 0;

			return this.getSortValue(a,b, entry, aBonus, bBonus);
		}).splice(0,5)
		.map(movie => {
			return {
				name: movie.name,
				genres: movie.genre,
				relevance: movie.recommendation,
			}
		})
	}

	getGameRecChildren(array: IGameList[], entry: IGameList, newOnly: boolean) : IChildren[] {
		return array.filter(a => {
			const canGenre = a.genre.some(genre => entry.genre.includes(genre));
			const canType = (entry.multiplayer && a.multiplayer) || (entry.singleplayer && a.singleplayer);
			const hasPlayed = newOnly ? !a.checkbox : true;
			return canGenre && canType && a.name !== entry.name && hasPlayed;
		}).sort((a,b) => {
			return this.getSortValue(a,b, entry);
		}).splice(0,5)
		.map(movie => {
			return {
				name: movie.name,
				genres: movie.genre,
				relevance: movie.recommendation,
			}
		})
	}

	getMovieRecChildren(array: IMovieList[], entry: IMovieList, newOnly: boolean) : IChildren[] {
		return array.filter(a => {
			const canGenre = a.genre.some(genre => entry.genre.includes(genre));
			const canType = a.type.every(type => entry.type.includes(type)) && entry.type.every(type => a.type.includes(type));
			const hasWatched = newOnly ? !a.checkbox : true;
			return canGenre && canType && a.name !== entry.name && hasWatched;
		}).sort((a,b) => {
			return this.getSortValue(a,b, entry);
		}).splice(0,5)
		.map(movie => {
			return {
				name: movie.name,
				genres: movie.genre,
				relevance: movie.recommendation,
			}
		})
	}

	getSortValue(a: IList, b: IList, entry: IList, bonusA: number = 0, bonusB: number = 0) {
		const length = entry.genre.length;

		const aFranchise =  entry.franchise !== '' ? entry.franchise === a.franchise ? 1 : -1 : 0;
		const aBonus = aFranchise + bonusA;
		const aVal = this.getGenreValue(a, entry, length, aBonus);

		const bFranchise =  entry.franchise !== '' ? entry.franchise === b.franchise ? 1 : -1 : 0;
		const bBonus = bFranchise + bonusB;
		const bVal = this.getGenreValue(b, entry, length, bBonus);

		const recCalc =  this.getRecValue(b, bVal, bBonus) - this.getRecValue(a, aVal, aBonus);
		const genreCalc =  bVal - aVal;
		return recCalc + genreCalc;
	}

	getGenreValue(l: IList, entry: IList, length: number, bonus: number) {
		const lLength = l.genre.length;
		const lIncludes = l.genre.filter(g => entry.genre.includes(g)).length;
		return lIncludes - (lLength - lIncludes) - (length - lIncludes) - ((length - lLength) * length) + bonus;
	}

	getRecValue(l: IList, lVal: number, bonus: number) {
		return (l.recommendation * (1 + lVal/(5 - bonus))) + lVal;
	}

}
