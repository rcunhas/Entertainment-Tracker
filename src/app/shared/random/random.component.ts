import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

export interface RandomChoice {
	name: string;
	genre: string;
	whereTo: string;
}

@Component({
	selector: 'app-random',
	templateUrl: './random.component.html',
	styleUrls: ['./random.component.scss']
})
export class RandomDialog implements OnInit {

	@Input() data!: RandomChoice;

	constructor(
		protected ref: NbDialogRef<RandomDialog>,
	) { }

	ngOnInit(): void {

	}

	close() {
		this.ref.close();
	}

}
