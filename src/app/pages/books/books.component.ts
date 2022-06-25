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

	allColumns: string[] = [ 'Actions', 'name', 'score', 'author', 'genre', 'checkbox', 'starred'];

	dataSource: NbTreeGridDataSource<TreeNode<IList>>;

	dataSourceData!: TreeNode<IList>[];

	sortColumn: string = 'name';
 	sortDirection: NbSortDirection = NbSortDirection.ASCENDING;

	constructor(
		private readonly router: Router,
		private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeNode<IBookList>>,
		private dialogService: NbDialogService,
	) {
		const storage = localStorage.getItem('booksList');
		this.data = (storage !== null ? JSON.parse(storage) : booksList) as TreeNode<IBookList>[];
		this.dataSource = this.dataSourceBuilder.create(this.data);
		this.dataSource.sort({
			column: this.sortColumn,
			direction: this.sortDirection,
		});
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
			case 'starred':
				return 'Starred';
			case 'checkbox':
				return 'Read';
			default:
				return column;
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
					starred: false,
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

	edit(row: TreeNode<IBookList>) {
		const data = row.data;
		this.dialogService.open(BooksEditboxDialog, {context : {
			data: {
				name: data.name,
				author: data.author,
				score:  data.score,
				genre: data.genre,
				checkbox: data.checkbox,
				starred: data.starred,
			}
		}}).onClose.subscribe((res: IBookList) => {
			if (!res) {
				return;
			}

			const dataIndex = this.data.findIndex(data => data.data.name === row.data.name);

			this.data[dataIndex] = {
				data: res,
			} as TreeNode<IBookList>;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: TreeNode<IBookList>) {
		const dataIndex = this.data.findIndex(data => data.data.name === row.data.name);
		this.data.splice(dataIndex, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		localStorage.setItem('booksList', JSON.stringify(this.data));
		this.dataSource = this.dataSourceBuilder.create(this.data);
		this.dataSource.sort({
			column: this.sortColumn,
			direction: this.sortDirection,
		});
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "booksList.json");
	}

}
