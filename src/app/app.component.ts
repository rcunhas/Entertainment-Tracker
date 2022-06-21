import { Component } from '@angular/core';
import { NbMenuItem, NbSidebarState } from '@nebular/theme';
import { SidebarState } from 'src/shared/models/interfaces.model';
import { MENU_ITEMS } from 'src/shared/models/menu.model';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	sideBarState: NbSidebarState = SidebarState.EXPANDED;
	menuItems : NbMenuItem[] = MENU_ITEMS;

}
