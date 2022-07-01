import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NbDialogService, NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import gamesList from '../../../files/gamesList.json'

import { IGameList } from 'src/shared/models/lists.model';
import { GamesEditboxDialog } from './games-editbox/games-editbox.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { randomElement } from 'src/shared/models/utils';
import { RandomDialog } from 'src/shared/random/random.component';

@Component({
	selector: 'app-games',
	templateUrl: './games.component.html',
	styleUrls: ['./games.component.scss']
})
export class GamesComponent implements AfterViewInit  {

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	data : IGameList[] = []

	allColumns: string[] = [ 'Actions', 'name', 'score', 'whereToPlay', 'genre', 'singleplayer', 'multiplayer', 'recommended', 'checkbox', 'starred'];

	dataSource: MatTableDataSource<IGameList>;

	globalFilter: string = '';

	constructor(
		private dialogService: NbDialogService,
		private toastrService: NbToastrService,
	) {
		const storage = localStorage.getItem('gamesList');
		this.data = (storage !== null ? JSON.parse(storage) : gamesList) as IGameList[];
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
				return 'Where To Play';
			case 'singleplayer':
				return 'SinglePlayer';
			case 'multiplayer':
				return 'MultiPlayer';
			case 'recommended':
				return 'Recommended';
			case 'starred':
				return 'Starred';
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
					id: this.data.length,
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

			const index = this.data.findIndex(entry => entry.name = res.name);

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

			this.data[row.id] = res as IGameList;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: IGameList) {
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
		localStorage.setItem('gamesList', JSON.stringify(this.data));
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "gamesList.json");
	}

}
