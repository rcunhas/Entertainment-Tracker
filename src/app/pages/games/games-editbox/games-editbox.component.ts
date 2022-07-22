import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NbDialogRef, NbToastrService, NbGlobalPhysicalPosition } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { GAME_GENRES, IGameList, WHERE_TO_PLAY } from 'src/app/shared/models/lists.model';
import { BooksEditboxDialog } from '../../books/books-editbox/books-editbox.component';

@Component({
  selector: 'app-games-editbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
	franchiseControl!: FormControl;

	franchiseOrderControl!: FormControl;
	releaseYearControl!: FormControl;
	extraFeaturesControl!: FormControl;
	studioControl!: FormControl;

	characterControl!: FormControl;
	plotControl!: FormControl;
	endingControl!: FormControl;
	gameplayControl!: FormControl;
	performanceControl!: FormControl;
	graphicsControl!: FormControl;
	overallControll!: FormControl;

	scoreData = {
		character: 0,
		plot: 0,
		ending: 0,
		gameplay: 0,
		performance: 0,
		graphics: 0,
		overall: 0,
	}

	subscriptions: Subscription;

	gameGenres: string[] = GAME_GENRES;
	whereToPlay: string[] = WHERE_TO_PLAY;

	flipped=false;

	constructor(
		protected ref: NbDialogRef<BooksEditboxDialog>,
		private toastrService: NbToastrService
	) {
		this.subscriptions = new Subscription();
	}

	ngOnInit(): void {
		this.nameControl = new FormControl(this.data?.name || '', Validators.required);
		this.scoreControl = new FormControl(this.data?.score || -1, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.franchiseControl = new FormControl(this.data?.franchise || '', Validators.required);
		this.genreControl = new FormControl(this.data?.genre || [], Validators.required);
		this.playControl = new FormControl(this.data?.whereToPlay || [], Validators.required);
		this.singleControl = new FormControl(this.data?.singleplayer || false);
		this.multiControl = new FormControl(this.data?.multiplayer || false);
		this.recommendedControl = new FormControl(this.data?.recommended || false);
		this.checkboxControl = new FormControl(this.data?.checkbox || false);
		this.starredControl = new FormControl(this.data?.starred || false);

		this.releaseYearControl = new FormControl(this.data?.releaseYear || -1, Validators.compose([Validators.min(-1), Validators.required]));
		this.studioControl = new FormControl(this.data?.owner || '', Validators.required);
		this.franchiseOrderControl = new FormControl(this.data?.franchiseOrder || -1, Validators.compose([Validators.min(-1), Validators.required]));
		this.extraFeaturesControl = new FormControl(this.data?.extraFeatures || [], Validators.required);

		this.characterControl = new FormControl(this.scoreData.character, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.plotControl = new FormControl(this.scoreData.plot, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.endingControl = new FormControl(this.scoreData.ending, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.gameplayControl = new FormControl(this.scoreData.gameplay, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.performanceControl = new FormControl(this.scoreData.performance, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.graphicsControl = new FormControl(this.scoreData.graphics, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));
		this.overallControll = new FormControl(this.scoreData.overall, Validators.compose([Validators.min(-1), Validators.max(10), Validators.required]));

		this.initializeWatchers();
	}

	initializeWatchers(): void {
		const charSub = this.characterControl.valueChanges.subscribe(value => this.calculateScore());
		const plotSub = this.plotControl.valueChanges.subscribe(value => this.calculateScore());
		const endgSub = this.endingControl.valueChanges.subscribe(value => this.calculateScore());
		const gameSub = this.gameplayControl.valueChanges.subscribe(value => this.calculateScore());
		const perfSub = this.performanceControl.valueChanges.subscribe(value => this.calculateScore());
		const grapSub = this.graphicsControl.valueChanges.subscribe(value => this.calculateScore());
		const overSub = this.overallControll.valueChanges.subscribe(value => this.calculateScore());

		this.subscriptions.add(charSub);
		this.subscriptions.add(plotSub);
		this.subscriptions.add(endgSub);
		this.subscriptions.add(gameSub);
		this.subscriptions.add(perfSub);
		this.subscriptions.add(grapSub);
		this.subscriptions.add(overSub);
	}

	calculateScore() {
		const score = (this.characterControl.value * 0.15) +
		(this.plotControl.value * 0.25) +
		(this.endingControl.value * 0.15) +
		(this.gameplayControl.value * 0.15) +
		(this.performanceControl.value * 0.10) +
		(this.graphicsControl.value * 0.10) +
		(this.overallControll.value * 0.10);

		this.scoreControl.setValue(Math.round((score + Number.EPSILON) * 100) / 100)
	}

	close() {
		this.ref.close();
	}

	submit() {
		let canSubmit = true;

		this.data.name = this.nameControl.value;
		this.data.score = this.scoreControl.value;
		this.data.franchise = this.franchiseControl.value;
		this.data.genre = (this.genreControl.value as any[]).sort((a,b) => a.localeCompare(b));
		this.data.whereToPlay = (this.playControl.value as any[]).sort((a,b) => a.localeCompare(b));
		this.data.checkbox = this.checkboxControl.value;
		this.data.singleplayer = this.singleControl.value;
		this.data.multiplayer = this.multiControl.value;
		this.data.recommended = this.recommendedControl.value;
		this.data.starred = this.starredControl.value;

		this.data.releaseYear = this.releaseYearControl.value;
		this.data.owner = this.studioControl.value;
		this.data.franchiseOrder = this.franchiseOrderControl.value;

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
