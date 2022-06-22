import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbTreeGridDataSource, NbSortDirection, NbTreeGridDataSourceBuilder, NbSortRequest, NbDialogService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import { IBookList, IList, TreeNode } from 'src/shared/models/lists.model';
import booksList from '../../../files/booksList.json'
import { BooksEditboxDialog } from './books-editbox/books-editbox.component';

@Component({
	selector: 'app-books',
	templateUrl: './books.component.html',
	styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit {

	data : TreeNode<IBookList>[] = []

	allColumns: string[] = [ 'Actions', 'Name', 'Score', 'Author', 'Genre', 'Read'];

	dataSource: NbTreeGridDataSource<TreeNode<IList>>;

	dataSourceData!: TreeNode<IList>[];

	sortColumn!: string;
 	sortDirection: NbSortDirection = NbSortDirection.NONE;

	constructor(
		private readonly router: Router,
		private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeNode<IBookList>>,
		private dialogService: NbDialogService,
	) {
		const storage = localStorage.getItem('booksList');
		this.data = (storage !== null ? JSON.parse(storage) : booksList) as TreeNode<IBookList>[];
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

	getValue(row: TreeNode<IList>, column: string) {
		const data = row.data;
		const columnData = (data as any)[this.convert(column)];
		return columnData === -1 ? '-' : columnData;
	}

	convert(column: string) : string {
		switch(column) {
			case 'Name':
				return 'name';
			case 'Score':
				return 'score';
			case 'Author':
				return 'author';
			case 'Genre':
				return 'genre';
			case 'Where To Play':
				return 'whereToPlay';
			case 'SinglePlayer':
				return 'singleplayer';
			case 'MultiPlayer':
				return 'multiplayer';
			case 'Where To Stream':
				return 'whereToStream';
			case 'Watch With GF':
				return 'watchWithGF';
			case 'Read':
			case 'Watched':
			case 'Played':
				return 'checkbox';
			default:
				return '';
		}
	}

	add() {
		this.dialogService.open(BooksEditboxDialog, {
			context: {
				data : {
					name: '',
					author: '',
					score:  -1,
					genre: [],
					checkbox: false,
				}
			}
		}).onClose.subscribe(res => {
			if (!res) {
				return;
			}

			this.data.push({
				data: res,
			} as TreeNode<IBookList>);
			this.saveToLocalStorage();
		});
	}

	edit(index: number, row: TreeNode<IBookList>) {
		const data = row.data;
		this.dialogService.open(BooksEditboxDialog, {context : {
			data: {
				name: data.name,
				author: data.author,
				score:  data.score,
				genre: data.genre,
				checkbox: data.checkbox,
			}
		}}).onClose.subscribe(res => {
			if (!res) {
				return;
			}

			this.data[index] = {
				data: res,
			} as TreeNode<IBookList>;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(index: number) {
		this.data.splice(index, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		localStorage.setItem('booksList', JSON.stringify(this.data));
		this.dataSource = this.dataSourceBuilder.create(this.data);
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "books.json");
	}

}
