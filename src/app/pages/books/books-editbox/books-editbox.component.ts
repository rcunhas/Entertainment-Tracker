import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NbDialogRef, NbGlobalPhysicalPosition, NbOptionComponent, NbToastrService } from '@nebular/theme';
import { BOOK_GENRES, IBookList,  } from 'src/shared/models/lists.model';

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
	selectedControl!: FormControl;
	checkboxControl!: FormControl;

	bookGenres: string[] = BOOK_GENRES;

	constructor(
		protected ref: NbDialogRef<BooksEditboxDialog>,
		private toastrService: NbToastrService
	) {
	}

	ngOnInit(): void {
		this.nameControl = new FormControl(this.data?.name || '', Validators.required);
		this.scoreControl = new FormControl(this.data?.score || -1, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.authorControl = new FormControl(this.data?.author || '', Validators.required);
		this.selectedControl = new FormControl(this.data?.genre || [], Validators.required);
		this.checkboxControl = new FormControl(this.data?.checkbox || false);
	}

	close() {
		this.ref.close();
	}

	submit() {
		let canSubmit = true;

		this.data.name = this.nameControl.value;
		this.data.score = this.scoreControl.value;
		this.data.author = this.authorControl.value;
		this.data.genre = this.selectedControl.value;
		this.data.checkbox = this.checkboxControl.value;

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

		if (this.data.author === '') {
			this.authorControl.markAllAsTouched();
			this.toastrService.danger('Author cannot be empty', 'Author Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT})
			canSubmit = false;
		}

		if (this.data.genre.length === 0) {
			this.selectedControl.markAllAsTouched();
			this.toastrService.danger('Must select at least one genre', 'Genre Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT})
			canSubmit = false;
		}

		if (canSubmit) {
			this.ref.close(this.data);
		}
	}

}
