import { Component, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
	selector: "app-delete-confirmation",
	templateUrl: "./delete-confirmation.component.html",
	styleUrls: ["./delete-confirmation.component.scss"],
})
export class DeleteConfirmationDialog implements OnInit {

	constructor(
		protected ref: NbDialogRef<DeleteConfirmationDialog>,
		) {
	}

	ngOnInit() {}

	cancel() {
		this.ref.close(false);
	}

	confirm() {
		this.ref.close(true);
	}
}
