import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbSidebarModule, NbMenuModule, NbIconModule, NbButtonModule, NbCardModule, NbTreeGridModule, NbInputModule, NbCheckboxModule, NbDialogModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { GamesComponent } from './pages/games/games.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { BooksComponent } from './pages/books/books.component';
import { BooksEditboxDialog } from './pages/books/books-editbox/books-editbox.component';

@NgModule({
	declarations: [
		AppComponent,
		GamesComponent,
		MoviesComponent,
		BooksComponent,
		BooksEditboxDialog,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		NbThemeModule.forRoot({ name: 'dark' }),
		NbSidebarModule.forRoot(),
		NbMenuModule.forRoot(),
		NbDialogModule.forRoot(),
		NbLayoutModule,
		NbEvaIconsModule,
		NbIconModule,
		NbButtonModule,
		NbCardModule,
		NbTreeGridModule,
		NbInputModule,
		NbCheckboxModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
