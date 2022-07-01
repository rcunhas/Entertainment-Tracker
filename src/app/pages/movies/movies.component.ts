import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import { IList, IMovieList } from 'src/shared/models/lists.model';
import { randomElement } from 'src/shared/models/utils';
import { RandomDialog } from 'src/shared/random/random.component';
import moviesList from '../../../files/moviesList.json'
import { MoviesEditboxDialog } from './movies-editbox/movies-editbox.component';

@Component({
	selector: 'app-movies',
	templateUrl: './movies.component.html',
	styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements AfterViewInit {

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	data : IMovieList[] = []

	allColumns: string[] = [ 'Actions', 'name', 'score', 'whereToStream', 'genre', 'movie', 'watchWithGF', 'checkbox', 'starred'];

	dataSource: MatTableDataSource<IMovieList>;

	globalFilter: string = '';

	constructor(
		private dialogService: NbDialogService,
		private toastrService: NbToastrService,
	) {
		const storage = localStorage.getItem('moviesList');
		this.data = (storage !== null ? JSON.parse(storage) : moviesList) as IMovieList[];
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name)).map((a, index) => { a.id = index; return a;});
		this.dataSource = new MatTableDataSource(this.data);
	}

	ngAfterViewInit() {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	applyFilter(event: string) {
		this.dataSource.filter = event.trim().toLowerCase();

		if (this.dataSource.paginator) {
		  this.dataSource.paginator.firstPage();
		}
	}

	randomizeEntry(forMe: boolean, starred: boolean = false) {
		let filteredEntries = starred ? this.dataSource.data.filter(data => data.starred) : this.dataSource.filteredData;
		filteredEntries = forMe ? filteredEntries : filteredEntries.filter(data => data.watchWithGF);
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
		return columnData === -1 ? '-' : columnData;
	}

	convert(column: string) : string {
		switch(column) {
			case 'name':
				return 'Name';
			case 'score':
				return 'Score';
			case 'genre':
				return 'Genre';
			case 'whereToStream':
				return 'Where To Stream';
			case 'watchWithGF':
				return 'Watch With GF';
			case 'starred':
				return 'Starred';
			case 'checkbox':
				return 'Watched';
			case 'movie':
				return 'Movie or Series';
			default:
				return column;
		}
	}

	add() {
		this.dialogService.open(MoviesEditboxDialog, {
			context: {
				data : {
					id: this.data.length,
					name: '',
					score:  -1,
					watchWithGF: false,
					whereToStream: [],
					genre: [],
					movie: false,
					checkbox: false,
					starred: false,
				}
			}
		}).onClose.subscribe(res => {
			if (!res) {
				return;
			}

			const index = this.data.findIndex(entry => entry.name = res.name);

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
				watchWithGF: data.watchWithGF,
				whereToStream: data.whereToStream,
				genre: data.genre,
				movie: data.movie,
				checkbox: data.checkbox,
				starred: data.starred,
			}
		}}).onClose.subscribe((res: IMovieList) => {
			if (!res) {
				return;
			}

			this.data[row.id] = res as IMovieList;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: IMovieList) {
		this.data.splice(row.id, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name)).map((a, index) => { a.id = index; return a;});
		this.dataSource.data = this.data;
		this.applyFilter('');
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
		localStorage.setItem('moviesList', JSON.stringify(this.data));
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "moviesList.json");
	}

}
