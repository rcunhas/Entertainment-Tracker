import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbTreeGridDataSource, NbSortDirection, NbTreeGridDataSourceBuilder, NbSortRequest, NbDialogService } from '@nebular/theme';
import * as saveAs from 'file-saver';
import { TreeNode, IList, IMovieList } from 'src/shared/models/lists.model';
import moviesList from '../../../files/moviesList.json'

@Component({
	selector: 'app-movies',
	templateUrl: './movies.component.html',
	styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit {

	data : TreeNode<IMovieList>[] = []

	allColumns: string[] = [ 'Actions', 'Name', 'Score', 'Where To Stream', 'Genre', 'Watch With GF', 'Watched'];

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

	}

	edit(index: number, row: TreeNode<IList>) {

	}

	deleteEntry(index: number) {
		this.data.splice(index, 1);
		this.saveToLocalStorage();
	}

	saveToLocalStorage() {
		localStorage.setItem('moviesList', JSON.stringify(this.data));
		this.router.navigate(['list/movies']);
	}

	save() {
		const blob = new Blob([JSON.stringify(this.data)], {type: "application/json"});
		saveAs(blob, "movies.json");
	}

}
