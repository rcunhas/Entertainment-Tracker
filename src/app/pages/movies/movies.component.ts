import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbTreeGridDataSource, NbSortDirection, NbTreeGridDataSourceBuilder, NbSortRequest, NbDialogService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import { TreeNode, IList, IMovieList } from 'src/shared/models/lists.model';
import moviesList from '../../../files/moviesList.json'
import { MoviesEditboxDialog } from './movies-editbox/movies-editbox.component';

@Component({
	selector: 'app-movies',
	templateUrl: './movies.component.html',
	styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit {

	data : TreeNode<IMovieList>[] = []

	allColumns: string[] = [ 'Actions', 'name', 'score', 'whereToStream', 'genre', 'watchWithGF', 'watched', 'starred'];

	dataSource: NbTreeGridDataSource<TreeNode<IList>>;

	dataSourceData!: TreeNode<IList>[];

	sortColumn!: string;
 	sortDirection: NbSortDirection = NbSortDirection.NONE;

	constructor(
		private readonly router: Router,
		private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeNode<IMovieList>>,
		private dialogService: NbDialogService,

	) {
		const storage = localStorage.getItem('moviesList');
		this.data = (storage !== null ? JSON.parse(storage) : moviesList) as TreeNode<IMovieList>[];
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
			default:
				return column;
		}
	}

	add() {
		this.dialogService.open(MoviesEditboxDialog, {
			context: {
				data : {
					name: '',
					score:  -1,
					watchWithGF: false,
					whereToStream: [],
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
			} as TreeNode<IMovieList>);
			this.saveToLocalStorage();
		});
	}

	edit(index: number, row: TreeNode<IMovieList>) {
		const data = row.data;
		this.dialogService.open(MoviesEditboxDialog, {context : {
			data: {
				name: data.name,
				score:  data.score,
				watchWithGF: data.watchWithGF,
				whereToStream: data.whereToStream,
				genre: data.genre,
				checkbox: data.checkbox,
				starred: data.starred,
			}
		}}).onClose.subscribe(res => {
			if (!res) {
				return;
			}

			this.data[index] = {
				data: res,
			} as TreeNode<IMovieList>;
			this.saveToLocalStorage();
		})
	}

	deleteEntry(index: number) {
		this.data.splice(index, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		localStorage.setItem('moviesList', JSON.stringify(this.data));
		this.dataSource = this.dataSourceBuilder.create(this.data);
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "movies.json");
	}

}
