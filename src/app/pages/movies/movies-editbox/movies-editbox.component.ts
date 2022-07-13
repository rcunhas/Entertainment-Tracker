import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NbDialogRef, NbToastrService, NbGlobalPhysicalPosition } from '@nebular/theme';
import { IMovieList, MOVIE_GENRES, MOVIE_TYPES, WHERE_TO_STREAM } from 'src/app/shared/models/lists.model';
import { BooksEditboxDialog } from '../../books/books-editbox/books-editbox.component';

@Component({
	selector: 'app-movies-editbox',
	templateUrl: './movies-editbox.component.html',
	styleUrls: ['./movies-editbox.component.scss']
})
export class MoviesEditboxDialog implements OnInit {

	@Input() data!: IMovieList

	nameControl!: FormControl;
	scoreControl!: FormControl;
	genreControl!: FormControl;
	streamControl!: FormControl;
	typeControl!: FormControl;
	watchWithControl!: FormControl;
	checkboxControl!: FormControl;
	starredControl!: FormControl;

	movieGenres: string[] = MOVIE_GENRES;
	whereToStream: string[] = WHERE_TO_STREAM;
	movieTypes: string[] = MOVIE_TYPES;

	constructor(
		protected ref: NbDialogRef<BooksEditboxDialog>,
		private toastrService: NbToastrService
	) {
	}

	ngOnInit(): void {
		this.nameControl = new FormControl(this.data?.name || '', Validators.required);
		this.scoreControl = new FormControl(this.data?.score || -1, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.genreControl = new FormControl(this.data?.genre || [], Validators.required);
		this.streamControl = new FormControl(this.data?.whereToStream || [], Validators.required);
		this.typeControl = new FormControl(this.data?.type || [], Validators.required);
		this.watchWithControl = new FormControl(this.data?.watchWithGF || false);
		this.checkboxControl = new FormControl(this.data?.checkbox || false);
		this.starredControl = new FormControl(this.data?.starred || false);
	}

	close() {
		this.ref.close();
	}

	submit() {
		let canSubmit = true;

		this.data.name = this.nameControl.value;
		this.data.score = this.scoreControl.value;
		this.data.genre = (this.genreControl.value as any[]).sort((a,b) => a.localeCompare(b));
		this.data.whereToStream = (this.streamControl.value as any[]).sort((a,b) => a.localeCompare(b));
		this.data.checkbox = this.checkboxControl.value;
		this.data.type = (this.typeControl.value as any[]).sort((a,b) => a.localeCompare(b));
		this.data.watchWithGF = this.watchWithControl.value;
		this.data.starred = this.starredControl.value;

		if (this.data.name === '') {
			this.nameControl.markAllAsTouched();
			this.toastrService.danger('Name cannot be empty', 'Name Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT })
			canSubmit = false;
		}

		if (this.data.score === null) {
			this.scoreControl.markAllAsTouched();
			this.toastrService.danger('Score must be between -1 and 10', 'Score Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT })
			canSubmit = false;
		}

		if (this.data.whereToStream.length === 0) {
			this.streamControl.markAllAsTouched();
			this.toastrService.danger('Must select at least one location', 'Where To Play Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT })
			canSubmit = false;
		}

		if (this.data.genre.length === 0) {
			this.genreControl.markAllAsTouched();
			this.toastrService.danger('Must select at least one genre', 'Genre Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT })
			canSubmit = false;
		}

		if (canSubmit) {
			this.ref.close(this.data);
		}
	}

}
