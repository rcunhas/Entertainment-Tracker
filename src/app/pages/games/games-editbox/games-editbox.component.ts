import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NbDialogRef, NbToastrService, NbGlobalPhysicalPosition } from '@nebular/theme';
import { GAME_GENRES, IGameList, WHERE_TO_PLAY } from 'src/app/shared/models/lists.model';
import { BooksEditboxDialog } from '../../books/books-editbox/books-editbox.component';

@Component({
  selector: 'app-games-editbox',
  templateUrl: './games-editbox.component.html',
  styleUrls: ['./games-editbox.component.scss']
})
export class GamesEditboxDialog implements OnInit {

	@Input() data!: IGameList

	nameControl!: FormControl;
	scoreControl!: FormControl;
	genreControl!: FormControl;
	playControl!: FormControl;
	singleControl!: FormControl;
	multiControl!: FormControl;
	recommendedControl!: FormControl;
	checkboxControl!: FormControl;
	starredControl!: FormControl;

	gameGenres: string[] = GAME_GENRES;
	whereToPlay: string[] = WHERE_TO_PLAY;

	constructor(
		protected ref: NbDialogRef<BooksEditboxDialog>,
		private toastrService: NbToastrService
	) {
	}

	ngOnInit(): void {
		this.nameControl = new FormControl(this.data?.name || '', Validators.required);
		this.scoreControl = new FormControl(this.data?.score || -1, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.genreControl = new FormControl(this.data?.genre || [], Validators.required);
		this.playControl = new FormControl(this.data?.whereToPlay || [], Validators.required);
		this.singleControl = new FormControl(this.data?.singleplayer || false);
		this.multiControl = new FormControl(this.data?.multiplayer || false);
		this.recommendedControl = new FormControl(this.data?.recommended || false);
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
		this.data.whereToPlay = (this.playControl.value as any[]).sort((a,b) => a.localeCompare(b));
		this.data.checkbox = this.checkboxControl.value;
		this.data.singleplayer = this.singleControl.value;
		this.data.multiplayer = this.multiControl.value;
		this.data.recommended = this.recommendedControl.value;
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

		if (this.data.whereToPlay.length === 0) {
			this.playControl.markAllAsTouched();
			this.toastrService.danger('Must select at least one location', 'Where To Play Control', { position: NbGlobalPhysicalPosition.BOTTOM_RIGHT})
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
