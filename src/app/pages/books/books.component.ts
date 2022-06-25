import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NbDialogService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import { IBookList, IList } from 'src/shared/models/lists.model';
import booksList from '../../../files/booksList.json'
import { BooksEditboxDialog } from './books-editbox/books-editbox.component';

@Component({
	selector: 'app-books',
	templateUrl: './books.component.html',
	styleUrls: ['./books.component.scss']
})
export class BooksComponent implements AfterViewInit {

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	data : IBookList[] = []

	allColumns: string[] = [ 'Actions', 'name', 'score', 'author', 'genre', 'checkbox', 'starred'];

	dataSource: MatTableDataSource<IBookList>;

	globalFilter: string = '';

	constructor(
		private dialogService: NbDialogService,
	) {
		const storage = localStorage.getItem('booksList');
		this.data = (storage !== null ? JSON.parse(storage) : booksList) as IBookList[];
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

	getValue(row: IList, column: string) {
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

			this.data.push(res as IBookList);
			this.saveToLocalStorage();
		});
	}

	edit(row: IBookList) {
		const data = row;
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

			const dataIndex = this.data.findIndex(data => data.name === row.name);

			this.data[dataIndex] = res as IBookList;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(row: IBookList) {
		const dataIndex = this.data.findIndex(data => data.name === row.name);
		this.data.splice(dataIndex, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		this.data = this.data.sort((a,b) => a.name.localeCompare(b.name));
		this.dataSource = new MatTableDataSource(this.data);
		localStorage.setItem('booksList', JSON.stringify(this.data));
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "booksList.json");
	}

}
