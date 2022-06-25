import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import gamesList from '../../../files/gamesList.json'

import { IGameList } from 'src/shared/models/lists.model';
import { GamesEditboxDialog } from './games-editbox/games-editbox.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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
	) {
		const storage = localStorage.getItem('gamesList');
		this.data = (storage !== null ? JSON.parse(storage) : gamesList) as IGameList[];
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name));
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

			this.data.push(res);
			this.saveToLocalStorage();
		});
	}

	edit(row: IGameList) {
		const data = row;
		this.dialogService.open(GamesEditboxDialog, {context : {
			data: {
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

			const dataIndex = this.data.findIndex(data => data.name === row.name);

			this.data[dataIndex] = res as IGameList;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: IGameList) {
		const dataIndex = this.data.findIndex(data => data.name === row.name);
		this.data.splice(dataIndex, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name));
		this.dataSource = new MatTableDataSource(this.data);
		localStorage.setItem('gamesList', JSON.stringify(this.data));
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "gamesList.json");
	}

}
