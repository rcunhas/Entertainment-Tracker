import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IBookList, IGameList, IMovieList } from "../models/lists.model";
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
		const recTable = await this.recService.calculateBooksRecomendation(books.slice());
		if (recTable != null) {
			books = books.map(book => {
				let value = 0;
				let entries = 0;

				[value, entries] = this.updateRecValue(value, entries, book.author, recTable);

				const genres = book.genre.slice();

				[value, entries] = this.updateGenreValues(value, entries, genres, recTable);

				book.recommendation = this.convertToPercentage(value/entries) || -1;
				return book;
			})
		}
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
		const recTable = await this.recService.calculateGamesRecomendation(games.slice());
		if (recTable != null) {
			games = games.map(game => {
				let value = 0;
				let entries = 0;

				const genres = game.genre.slice();
				const where = game.whereToPlay.slice();

				if (game.singleplayer) [value, entries] = this.updateRecValue(value, entries, 'SinglePlayer', recTable);
				if (game.multiplayer) [value, entries] = this.updateRecValue(value, entries, 'MultiPlayer', recTable);

				[value, entries] = this.updateGenreValues(value, entries, genres, recTable);
				// [value, entries] = this.updateArray(value, entries, where, recTable);

				game.recommendation = this.convertToPercentage(value/entries) || -1;
				return game;
			})
		}
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
				// [value, entries] = this.updateArray(value, entries, types, recTable);
				// [value, entries] = this.updateArray(value, entries, where, recTable);

				movie.recommendation = this.convertToPercentage(value/entries) || -1;
				return movie;
			})
		}
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

	updateRecValue(value: number, entries: number, key: string, table: Map<string,number>) {
		const keyValue = table.get(key);
		if (keyValue) {
			value += keyValue;
		}
		entries += 1;
		return [
			value,
			entries,
		]
	}

	convertToPercentage(value: number) {
		return Math.round((value/10) * 100) ;
	}

}
