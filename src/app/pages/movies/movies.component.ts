import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import { IList, IMovieList, MOVIE_GENRES, MOVIE_TYPES, WHERE_TO_STREAM } from 'src/app/shared/models/lists.model';
import { randomElement } from 'src/app/shared/models/utils';
import { RandomDialog } from 'src/app/shared/random/random.component';
import { MoviesEditboxDialog } from './movies-editbox/movies-editbox.component';

import * as uuid from 'uuid';
import { FormControl } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { TablesStore } from 'src/app/shared/store/tables.store.service';

@Component({
	selector: 'app-movies',
	templateUrl: './movies.component.html',
	styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	data : IMovieList[] = []

	allColumns: string[] = ['name', 'franchise', 'score', 'whereToStream', 'genre', 'type', 'recommendation', 'actions'];

	movieGenres: string[] = MOVIE_GENRES;
	whereToStream: string[] = WHERE_TO_STREAM;
	movieTypes: string[] = MOVIE_TYPES;
	excludeList: string[] = [...MOVIE_GENRES, ...WHERE_TO_STREAM, ...MOVIE_TYPES];

	dataSource: MatTableDataSource<IMovieList>;

	scoreControl: FormControl;
	whereControl: FormControl;
	genreControl: FormControl;
	typeControl: FormControl;
	recommendedControl: FormControl;
	watchedControl: FormControl;
	starredControl: FormControl;
	excludeControl: FormControl;

	subscriptions: Subscription;

	loading = true;

	globalFilter: string = '';
	filteredValues = {
		score: null,
		whereToStream: null,
		genre: null,
		type: null,
		recommended: null,
		watched: null,
		starred: null,
		excludes: null,
	}

	constructor(
		private dialogService: NbDialogService,
		private toastrService: NbToastrService,
		private tablesStore: TablesStore,
	) {
		this.dataSource = new MatTableDataSource();

		this.dataSource.filterPredicate = this.customFilterPredicate();

		this.scoreControl = new FormControl;
		this.whereControl = new FormControl;
		this.genreControl = new FormControl;
		this.typeControl = new FormControl;
		this.recommendedControl = new FormControl;
		this.watchedControl = new FormControl;
		this.starredControl = new FormControl;
		this.excludeControl = new FormControl;
		this.subscriptions = new Subscription();
	}

	ngOnInit(): void {
		const scoreSub = this.scoreControl.valueChanges.subscribe(scoreValue => {

			this.filteredValues['score'] = scoreValue.length > 0 ? scoreValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const whereSub = this.whereControl.valueChanges.subscribe(whereValue => {
			this.filteredValues['whereToStream'] = whereValue.length > 0 ? whereValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const genreSub = this.genreControl.valueChanges.subscribe(genreValue => {
			this.filteredValues['genre'] = genreValue.length > 0 ? genreValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const singleSub = this.typeControl.valueChanges.subscribe(typeValue => {
			this.filteredValues['type'] = typeValue.length > 0 ? typeValue : null;;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const recSub = this.recommendedControl.valueChanges.subscribe(recValue => {
			this.filteredValues['recommended'] = recValue;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const playedSub = this.watchedControl.valueChanges.subscribe(watchValue => {
			this.filteredValues['watched'] = watchValue;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const starSub = this.starredControl.valueChanges.subscribe(starredValue => {
			this.filteredValues['starred'] = starredValue;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const excludeSub = this.excludeControl.valueChanges.subscribe(excludeValue => {
			this.filteredValues['excludes'] = excludeValue.length > 0 ? excludeValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const movies = this.tablesStore.getMovies();

		const sub = combineLatest([movies])
		.subscribe(async ([movieList]) => {
			this.dataSource.data = movieList.slice();
			this.data = movieList.slice();
			this.applyFilter('');
			if (this.dataSource.paginator) {
				this.dataSource.paginator.firstPage();
			}
			this.loading = false;
		});

		this.subscriptions.add(sub);

		this.subscriptions.add(scoreSub);
		this.subscriptions.add(whereSub);
		this.subscriptions.add(genreSub);
		this.subscriptions.add(singleSub);
		this.subscriptions.add(recSub);
		this.subscriptions.add(playedSub);
		this.subscriptions.add(starSub);
		this.subscriptions.add(excludeSub);
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
		const lessonFilter = (data: IMovieList, filter: string): boolean => {

			let parsedSearch = JSON.parse(filter);

			const score = parsedSearch.score;
			const hasScore = score ? score.some((entry: any) => this.calculateScore(entry.type, entry.predicate, data.score)) : true;

			const whereToStream = parsedSearch.whereToStream;
			const hasWhere = whereToStream ? data.whereToStream.filter(entry => whereToStream.includes(entry)).length > 0 : true;

			const genre = parsedSearch.genre;
			const hasGenre = genre ? data.genre.filter(entry => genre.includes(entry)).length > 0 : true;

			const type = parsedSearch.type;
			const hasType = type !== null ? data.type.filter(entry => type.includes(entry)).length > 0 : true;

			const recommended = parsedSearch.recommended;
			const hasRecommended = recommended !== null ? data.watchWithGF === recommended : true;

			const watched = parsedSearch.watched;
			const hasWatched = watched !== null ? data.checkbox === watched : true;

			const starred = parsedSearch.starred;
			const hasStarred = starred !== null ? data.starred === starred : true;

			const excludes = parsedSearch.excludes;
			const hasExcludeGenre = excludes != null ? data.genre.every(entry => !excludes.includes(entry)) : true;
			const hasExcludeWhere = excludes != null ? data.whereToStream.every(entry => !excludes.includes(entry)) : true;
			const hasExcludeType = excludes != null ? data.type.every(entry => !excludes.includes(entry)) : true;

			const hasExclude = hasExcludeGenre && hasExcludeWhere && hasExcludeType;

			let selectMatch = hasScore && hasWhere && hasGenre && hasType && hasRecommended && hasWatched && hasStarred && hasExclude;

			let globalMatch = !this.globalFilter;

			if (this.globalFilter) {
				const lowerCaseFilter = this.globalFilter.trim().toLowerCase();
				const nameIncludes = data.name != '' && data.name.toLowerCase().includes(lowerCaseFilter);
				const franchiseIncludes = data.franchise != '' && data.franchise.toLowerCase().includes(lowerCaseFilter);
				const whereIncludes = data.whereToStream != [] && data.whereToStream.some(entry => entry.toLocaleLowerCase().includes(lowerCaseFilter));
				const genreIncludes = data.genre != [] && data.genre.some(entry => entry.toLocaleLowerCase().includes(lowerCaseFilter));

				globalMatch = nameIncludes || whereIncludes || genreIncludes || franchiseIncludes;
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

	randomizeEntry() {
		let filteredEntries = this.dataSource.filteredData;
		const element = randomElement(filteredEntries);
		this.dialogService.open(RandomDialog, {
			context: {
				data: {
					name: element.name,
					genre: this.getValue(element, 'genre'),
					whereTo: this.getValue(element, 'whereToStream'),
				}
			}
		});
	}

	getValue(row: IList, column: string) {
		const columnData = (row as any)[column];
		if (Array.isArray(columnData)) {
			let value = '';
			for (let entry of columnData) {
				value += `${entry}\n`;
			}
			return value;
		}

		if (column === 'movie') {
			return columnData ? 'Movie' : 'Series';
		}
		return columnData === -1 ? '-' : column === 'recommendation' ?  `${columnData}%` : columnData;
	}

	convert(column: string) : string {
		switch(column) {
			case 'name':
				return 'Name';
			case 'score':
				return 'Score';
			case 'franchise':
				return 'Franchise';
			case 'genre':
				return 'Genre';
			case 'whereToStream':
				return 'Stream On';
			case 'watchWithGF':
				return 'GF';
			case 'starred':
				return 'Star';
			case 'checkbox':
				return 'Watched';
			case 'type':
				return 'Type';
			case 'recommendation':
				return 'Rec %';
			case 'actions':
				return '';
			default:
				return column;
		}
	}

	add() {
		this.dialogService.open(MoviesEditboxDialog, {
			context: {
				data : {
					id: uuid.v4(),
					name: '',
					score:  -1,
					franchise: '',
					franchiseOrder: -1,
					owner: '',
					releaseYear: -1,
					watchWithGF: false,
					whereToStream: [],
					genre: [],
					type: [],
					checkbox: false,
					starred: false,
					recommendation: -1,
					recChildren: [],
					newRecChildren: [],
					extraFeatures: [],
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

			this.data.push(res as IMovieList);
			this.saveToLocalStorage();
		});
	}

	edit(row: IMovieList) {
		const data = row;
		this.dialogService.open(MoviesEditboxDialog, {context : {
			data: {
				id: row.id,
				name: data.name,
				score:  data.score,
				franchise: data.franchise,
				franchiseOrder: data.franchiseOrder,
				owner: data.owner,
				releaseYear: data.releaseYear,
				watchWithGF: data.watchWithGF,
				whereToStream: data.whereToStream,
				genre: data.genre,
				type: data.type,
				checkbox: data.checkbox,
				starred: data.starred,
				recommendation: data.recommendation,
				recChildren: data.recChildren,
				newRecChildren: data.newRecChildren,
				extraFeatures: data.extraFeatures,
			}
		}}).onClose.subscribe((res: IMovieList) => {
			if (!res) {
				return;
			}

			const index = this.data.findIndex(entry => entry.id === data.id);

			this.data[index] = res as IMovieList;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: IMovieList) {
		const index = this.data.findIndex(entry => entry.id === row.id);
		this.data.splice(index, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		this.loading = true;
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name));
		this.tablesStore.setMovieData(this.data);
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "moviesList.json");
	}

}
