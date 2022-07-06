import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import gamesList from '../../../files/gamesList.json'

import { GAME_GENRES, IGameList, WHERE_TO_PLAY } from 'src/shared/models/lists.model';
import { GamesEditboxDialog } from './games-editbox/games-editbox.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { randomElement } from 'src/shared/models/utils';
import { RandomDialog } from 'src/shared/random/random.component';

import * as uuid from 'uuid';
import { FormControl } from '@angular/forms';
import { single, Subscription } from 'rxjs';

@Component({
	selector: 'app-games',
	templateUrl: './games.component.html',
	styleUrls: ['./games.component.scss']
})
export class GamesComponent implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	data : IGameList[] = []

	allColumns: string[] = [ 'Actions', 'name', 'score', 'whereToPlay', 'genre', 'singleplayer', 'multiplayer', 'recommended', 'checkbox', 'starred'];

	gameGenres: string[] = GAME_GENRES;
	whereToPlay: string[] = WHERE_TO_PLAY;

	dataSource: MatTableDataSource<IGameList>;

	scoreControl: FormControl;
	whereControl: FormControl;
	genreControl: FormControl;
	singleControl: FormControl;
	recommendedControl: FormControl;
	playedControl: FormControl;
	starredControl: FormControl;

	subscriptions: Subscription;

	globalFilter: string = '';
	filteredValues = {
		score: null,
		whereToPlay: null,
		genre: null,
		singleplayer: null,
		recommended: null,
		played: null,
		starred: null,
	}

	constructor(
		private dialogService: NbDialogService,
		private toastrService: NbToastrService,
	) {
		const storage = localStorage.getItem('gamesList');
		this.data = (storage !== null ? JSON.parse(storage) : gamesList) as IGameList[];
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name));
		this.dataSource = new MatTableDataSource(this.data);

		this.dataSource.filterPredicate = this.customFilterPredicate();

		this.scoreControl = new FormControl;
		this.whereControl = new FormControl;
		this.genreControl = new FormControl;
		this.singleControl = new FormControl;
		this.recommendedControl = new FormControl;
		this.playedControl = new FormControl;
		this.starredControl = new FormControl;
		this.subscriptions = new Subscription();
	}

	ngOnInit(): void {
		const scoreSub = this.scoreControl.valueChanges.subscribe(scoreValue => {

			this.filteredValues['score'] = scoreValue.length > 0 ? scoreValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const whereSub = this.whereControl.valueChanges.subscribe(whereValue => {
			this.filteredValues['whereToPlay'] = whereValue.length > 0 ? whereValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const genreSub = this.genreControl.valueChanges.subscribe(genreValue => {
			this.filteredValues['genre'] = genreValue.length > 0 ? genreValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const singleSub = this.singleControl.valueChanges.subscribe(singleValue => {
			this.filteredValues['singleplayer'] = singleValue;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const recSub = this.recommendedControl.valueChanges.subscribe(recValue => {
			this.filteredValues['recommended'] = recValue;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const playedSub = this.playedControl.valueChanges.subscribe(playedValue => {
			this.filteredValues['played'] = playedValue;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const starSub = this.starredControl.valueChanges.subscribe(starredValue => {
			this.filteredValues['starred'] = starredValue;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		this.subscriptions.add(scoreSub);
		this.subscriptions.add(whereSub);
		this.subscriptions.add(genreSub);
		this.subscriptions.add(singleSub);
		this.subscriptions.add(recSub);
		this.subscriptions.add(playedSub);
		this.subscriptions.add(starSub);
	}

	ngAfterViewInit() {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	applyFilter(event: string) {
		this.globalFilter = event;
		this.dataSource.filter = JSON.stringify(this.filteredValues);

		if (this.dataSource.paginator) {
		  this.dataSource.paginator.firstPage();
		}
	}

	customFilterPredicate() {
		const lessonFilter = (data: IGameList, filter: string): boolean => {

			let parsedSearch = JSON.parse(filter);

			const score = parsedSearch.score;
			const hasScore = score ? score.some((entry: any) => this.calculateScore(entry.type, entry.predicate, data.score)) : true;

			const whereToPlay = parsedSearch.whereToPlay;
			const hasWhere = whereToPlay ? data.whereToPlay.filter(entry => whereToPlay.includes(entry)).length > 0 : true;

			const genre = parsedSearch.genre;
			const hasGenre = genre ? data.genre.filter(entry => genre.includes(entry)).length > 0 : true;

			const singleplayer = parsedSearch.singleplayer;
			const hasSingle = singleplayer !== null ? singleplayer ? data.singleplayer : data.multiplayer : true;

			const recommended = parsedSearch.recommended;
			const hasRecommended = recommended !== null ? data.recommended === recommended : true;

			const played = parsedSearch.played;
			const hasPlayed = played !== null ? data.checkbox === played : true;

			const starred = parsedSearch.starred;
			const hasStarred = starred !== null ? data.starred === starred : true;

			let selectMatch = hasScore && hasWhere && hasGenre && hasSingle && hasRecommended && hasPlayed && hasStarred;

			let globalMatch = !this.globalFilter;

			if (this.globalFilter) {
				const lowerCaseFilter = this.globalFilter.trim().toLowerCase();
				const nameIncludes = data.name != '' && data.name.toLowerCase().includes(lowerCaseFilter);
				const whereIncludes = data.whereToPlay != [] && data.whereToPlay.some(entry => entry.toLocaleLowerCase().includes(lowerCaseFilter));
				const genreIncludes = data.genre != [] && data.genre.some(entry => entry.toLocaleLowerCase().includes(lowerCaseFilter));

				globalMatch = nameIncludes || whereIncludes || genreIncludes;
			}

			return globalMatch && selectMatch;
		}
		return lessonFilter;
	}

	calculateScore(type : '<' | '>=' | '==', predicate: number, value: number) {
		switch (type) {
			case '<':
				return value < predicate && value != -1;
			case '>=':
				return value >= predicate && value < predicate + 1;
			case '==':
				return value === predicate;
			default:
				return true;
		}
	}

	randomizeEntry(forMe: boolean, starred: boolean = false) {
		let filteredEntries = starred ? this.dataSource.data.filter(data => data.starred) : this.dataSource.filteredData;
		filteredEntries = forMe ? filteredEntries : filteredEntries.filter(data => data.recommended);
		const element = randomElement(filteredEntries);
		this.dialogService.open(RandomDialog, {
			context: {
				data: {
					name: element.name,
					genre: this.getValue(element, 'genre'),
					whereTo: this.getValue(element, 'whereToPlay'),
				}
			}
		});
	}

	getValue(row: IGameList, column: string) {
		const columnData = (row as any)[column];
		if (Array.isArray(columnData)) {
			let value = '';
			for (let entry of columnData) {
				value += `${entry}\n`;
			}
			return value;
		}
		return columnData === -1 ? '-' : columnData;
	}

	convert(column: string) : string {
		switch(column) {
			case 'name':
				return 'Name';
			case 'score':
				return 'Score';
			case 'author':
				return 'Author';
			case 'genre':
				return 'Genre';
			case 'whereToPlay':
				return 'Play On';
			case 'singleplayer':
				return 'Single Player';
			case 'multiplayer':
				return 'Multi Player';
			case 'recommended':
				return 'GF';
			case 'starred':
				return 'Star';
			case 'checkbox':
				return 'Played';
			default:
				return column;
		}
	}

	add() {
		this.dialogService.open(GamesEditboxDialog, {
			context: {
				data : {
					id: uuid.v4(),
					name: '',
					score:  -1,
					singleplayer: false,
					multiplayer: false,
					recommended: false,
					whereToPlay: [],
					genre: [],
					checkbox: false,
					starred: false,
				}
			}
		}).onClose.subscribe(res => {
			if (!res) {
				return;
			}

			const index = this.data.findIndex(entry => entry.name === res.name);

			if (index !== -1) {
				this.toastrService.danger('Entry already exists with the same name', 'Name Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT })
				return;
			}

			this.data.push(res);
			this.saveToLocalStorage();
		});
	}

	edit(row: IGameList) {
		const data = row;
		this.dialogService.open(GamesEditboxDialog, {context : {
			data: {
				id: row.id,
				name: data.name,
				score:  data.score,
				singleplayer: data.singleplayer,
				multiplayer: data.multiplayer,
				recommended: data.recommended,
				whereToPlay: data.whereToPlay,
				genre: data.genre,
				checkbox: data.checkbox,
				starred: data.starred,
			}
		}}).onClose.subscribe((res : IGameList) => {
			if (!res) {
				return;
			}

			const index = this.data.findIndex(entry => entry.id === res.id);

			this.data[index] = res as IGameList;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: IGameList) {
		const index = this.data.findIndex(entry => entry.id === row.id);
		this.data.splice(index, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name));
		this.dataSource.data = this.data;
		this.applyFilter('');
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
		localStorage.setItem('gamesList', JSON.stringify(this.data));
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "gamesList.json");
	}

}
