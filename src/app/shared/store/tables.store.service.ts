import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IBookList, IGameList } from "../models/lists.model";
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

	constructor(
		private recService: RecommendationService,
	) {
		this.listBooks();
		this.listGames();
	}

	async ngOnInit() {

		// this.listMovies(),
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
		console.log('GAMES', games);
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
				[value, entries] = this.updateArray(value, entries, where, recTable);

				game.recommendation = this.convertToPercentage(value/entries) || -1;
				return game;
			})
		}
		console.log(games);
		this.setGameData(games);
	}

	setGameData(games: IGameList[]) {
		this._gamesList.next(games);
		localStorage.setItem('gamesList', JSON.stringify(games));
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
			for (let j = i + 1; i < genres.length; i++) {
				const key = `${genre}/${genres[j]}`;
				[value, entries] = this.updateRecValue(value, entries, key, table);
			}
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
