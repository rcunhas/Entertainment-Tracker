import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbTreeGridDataSource, NbSortDirection, NbTreeGridDataSourceBuilder, NbSortRequest, NbDialogService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import gamesList from '../../../files/gamesList.json'

import { TreeNode, IList, IGameList } from 'src/shared/models/lists.model';
import { GamesEditboxDialog } from './games-editbox/games-editbox.component';

@Component({
	selector: 'app-games',
	templateUrl: './games.component.html',
	styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {

	data : TreeNode<IGameList>[] = []

	allColumns: string[] = [ 'Actions', 'name', 'score', 'whereToPlay', 'genre', 'singleplayer', 'multiplayer', 'recommended', 'checkbox', 'starred'];

	dataSource: NbTreeGridDataSource<TreeNode<IList>>;

	dataSourceData!: TreeNode<IGameList>[];

	sortColumn!: string;
 	sortDirection: NbSortDirection = NbSortDirection.NONE;

	constructor(
		private readonly router: Router,
		private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeNode<IGameList>>,
		private dialogService: NbDialogService,
	) {
		const storage = localStorage.getItem('gamesList');
		this.data = (storage !== null ? JSON.parse(storage) : gamesList) as TreeNode<IGameList>[];
		this.dataSource = this.dataSourceBuilder.create(this.data);
	}

	ngOnInit(): void {
	}

	updateSort(sortRequest: NbSortRequest): void {
		this.sortColumn = sortRequest.column;
		this.sortDirection = sortRequest.direction;
	}

	getSortDirection(column: string): NbSortDirection {
		if (this.sortColumn === column) {
			return this.sortDirection;
		}
		return NbSortDirection.NONE;
	}

	getValue(row: TreeNode<IGameList>, column: string) {
		const data = row.data;
		const columnData = (data as any)[column];
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

			this.data.push({
				data: res,
			} as TreeNode<IGameList>);
			this.saveToLocalStorage();
		});
	}

	edit(index: number, row: TreeNode<IGameList>) {
		const data = row.data;
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

			const dataIndex = this.data.findIndex(data => data.data.name === row.data.name);

			this.data[dataIndex] = {
				data: res,
			} as TreeNode<IGameList>;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(index: number) {
		this.data.splice(index, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		localStorage.setItem('gamesList', JSON.stringify(this.data));
		this.dataSource = this.dataSourceBuilder.create(this.data);
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "gamesList.json");
	}

}
