import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import { BOOK_GENRES, IBookList, IList } from 'src/app/shared/models/lists.model';
import { randomElement } from 'src/app/shared/models/utils';
import { RandomDialog } from 'src/app/shared/random/random.component';
import { BooksEditboxDialog } from './books-editbox/books-editbox.component';

import * as uuid from 'uuid';
import { FormControl } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { TablesStore } from 'src/app/shared/store/tables.store.service';
import { RecommendationService } from 'src/app/shared/recommendation/recommendation.service';

@Component({
	selector: 'app-books',
	templateUrl: './books.component.html',
	styleUrls: ['./books.component.scss']
})
export class BooksComponent implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	data : IBookList[] = []

	allColumns: string[] = [ 'Actions', 'name', 'score', 'author', 'genre', 'checkbox', 'starred', 'recommendation'];

	bookGenres: string[] = BOOK_GENRES;

	excludeList: string[] = [...BOOK_GENRES];

	dataSource: MatTableDataSource<IBookList>;

	scoreControl: FormControl;
	genreControl: FormControl;
	readControl: FormControl;
	starredControl: FormControl;
	excludeControl: FormControl;

	subscriptions: Subscription;

	loading = true;

	globalFilter: string = '';
	filteredValues = {
		score: null,
		genre: null,
		read: null,
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
		this.genreControl = new FormControl;
		this.readControl = new FormControl;
		this.starredControl = new FormControl;
		this.excludeControl = new FormControl;
		this.subscriptions = new Subscription();
	}

	ngOnInit(): void {
		const scoreSub = this.scoreControl.valueChanges.subscribe(scoreValue => {

			this.filteredValues['score'] = scoreValue.length > 0 ? scoreValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const genreSub = this.genreControl.valueChanges.subscribe(genreValue => {
			this.filteredValues['genre'] = genreValue.length > 0 ? genreValue : null;
			this.dataSource.filter = JSON.stringify(this.filteredValues);
		});

		const readSub = this.readControl.valueChanges.subscribe(readValue => {
			this.filteredValues['read'] = readValue;
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

		const books = this.tablesStore.getBooks();

		const sub = combineLatest([books])
		.subscribe(async ([bookList]) => {
			this.dataSource.data = bookList.slice();
			this.data = bookList.slice();
			this.applyFilter('');
			if (this.dataSource.paginator) {
				this.dataSource.paginator.firstPage();
			}
			this.loading = false;
		});

		this.subscriptions.add(sub);
		this.subscriptions.add(scoreSub);
		this.subscriptions.add(genreSub);
		this.subscriptions.add(readSub);
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
		const lessonFilter = (data: IBookList, filter: string): boolean => {

			let parsedSearch = JSON.parse(filter);

			const score = parsedSearch.score;
			const hasScore = score ? score.some((entry: any) => this.calculateScore(entry.type, entry.predicate, data.score)) : true;

			const genre = parsedSearch.genre;
			const hasGenre = genre ? data.genre.filter(entry => genre.includes(entry)).length > 0 : true;

			const read = parsedSearch.read;
			const hasRead = read !== null ? data.checkbox === read : true;

			const starred = parsedSearch.starred;
			const hasStarred = starred !== null ? data.starred === starred : true;

			const excludes = parsedSearch.excludes;
			const hasExcludeGenre = excludes != null ? data.genre.every(entry => !excludes.includes(entry)) : true;

			let selectMatch = hasScore && hasGenre && hasRead && hasStarred && hasExcludeGenre;

			let globalMatch = !this.globalFilter;

			if (this.globalFilter) {
				const lowerCaseFilter = this.globalFilter.trim().toLowerCase();
				const nameIncludes = data.name != '' && data.name.toLowerCase().includes(lowerCaseFilter);
				const authorIncludes = data.author != '' && data.author.toLocaleLowerCase().includes(lowerCaseFilter);
				const genreIncludes = data.genre != [] && data.genre.some(entry => entry.toLocaleLowerCase().includes(lowerCaseFilter));

				globalMatch = nameIncludes || authorIncludes || genreIncludes;
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

	randomizeEntry(starred: boolean) {
		let filteredEntries = starred ? this.dataSource.data.filter(data => data.starred) : this.dataSource.filteredData;
		const element = randomElement(filteredEntries);
		this.dialogService.open(RandomDialog, {
			context: {
				data: {
					name: element.name,
					genre: this.getValue(element, 'genre'),
					whereTo: element.author,
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
		return columnData === -1 ? '-' : column === 'recommendation' ?  `${columnData}%` : columnData;
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
			case 'starred':
				return 'Star';
			case 'checkbox':
				return 'Read';
			case 'recommendation':
				return 'Rec %';
			default:
				return column;
		}
	}

	add() {
		this.dialogService.open(BooksEditboxDialog, {
			context: {
				data : {
					id: uuid.v4(),
					name: '',
					author: '',
					score:  -1,
					genre: [],
					checkbox: false,
					starred: false,
					recommendation: -1,
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

			this.data.push(res as IBookList);
			this.saveToLocalStorage();
		});
	}

	edit(row: IBookList) {
		const data = row;
		this.dialogService.open(BooksEditboxDialog, {context : {
			data: {
				id: row.id,
				name: data.name,
				author: data.author,
				score:  data.score,
				genre: data.genre,
				checkbox: data.checkbox,
				starred: data.starred,
				recommendation: data.recommendation,
			}
		}}).onClose.subscribe((res: IBookList) => {
			if (!res) {
				return;
			}

			const index = this.data.findIndex(entry => entry.id === data.id);

			this.data[index] = res as IBookList;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: IBookList) {
		const index = this.data.findIndex(entry => entry.id === row.id);
		this.data.splice(index, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		this.loading = true;
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name));
		this.tablesStore.setBookData(this.data);
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "booksList.json");
	}

}
