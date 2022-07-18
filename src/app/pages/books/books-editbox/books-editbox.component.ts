import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NbDialogRef, NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { BOOK_GENRES, IBookList,  } from 'src/app/shared/models/lists.model';

@Component({
	selector: 'app-books-editbox',
	templateUrl: './books-editbox.component.html',
	styleUrls: ['./books-editbox.component.scss']
})
export class BooksEditboxDialog implements OnInit {

	@Input() data!: IBookList

	nameControl!: FormControl;
	scoreControl!: FormControl;
	authorControl!: FormControl;
	genreControl!: FormControl;
	checkboxControl!: FormControl;
	starredControl!: FormControl;
	franchiseControl!: FormControl;

	bookGenres: string[] = BOOK_GENRES;

	constructor(
		protected ref: NbDialogRef<BooksEditboxDialog>,
		private toastrService: NbToastrService
	) {
	}

	ngOnInit(): void {
		this.nameControl = new FormControl(this.data?.name || '', Validators.required);
		this.scoreControl = new FormControl(this.data?.score || -1, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.franchiseControl = new FormControl(this.data?.franchise || '', Validators.required);
		this.authorControl = new FormControl(this.data?.owner || '', Validators.required);
		this.genreControl = new FormControl(this.data?.genre || [], Validators.required);
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
		this.data.franchise = this.franchiseControl.value;
		this.data.owner = this.authorControl.value;
		this.data.genre = (this.genreControl.value as any[]).sort((a,b) => a.localeCompare(b));
		this.data.checkbox = this.checkboxControl.value;
		this.data.starred = this.starredControl.value;

		if (this.data.name === '') {
			this.nameControl.markAllAsTouched();
			this.toastrService.danger('Name cannot be empty', 'Name Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT})
			canSubmit = false;
		}

		if (this.data.score === null) {
			this.scoreControl.markAllAsTouched();
			this.toastrService.danger('Score must be between -1 and 10', 'Score Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT})
			canSubmit = false;
		}

		if (this.data.owner === '') {
			this.authorControl.markAllAsTouched();
			this.toastrService.danger('Author cannot be empty', 'Author Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT})
			canSubmit = false;
		}

		if (this.data.genre.length === 0) {
			this.genreControl.markAllAsTouched();
			this.toastrService.danger('Must select at least one genre', 'Genre Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT})
			canSubmit = false;
		}

		if (canSubmit) {
			this.ref.close(this.data);
		}
	}

}
