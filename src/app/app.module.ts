import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbSidebarModule, NbMenuModule, NbIconModule, NbButtonModule, NbCardModule, NbTreeGridModule, NbInputModule, NbCheckboxModule, NbDialogModule, NbSelectModule, NbToastrModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { GamesComponent } from './pages/games/games.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { BooksComponent } from './pages/books/books.component';
import { BooksEditboxDialog } from './pages/books/books-editbox/books-editbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GamesEditboxDialog } from './pages/games/games-editbox/games-editbox.component';

@NgModule({
	declarations: [
		AppComponent,
		GamesComponent,
		MoviesComponent,
		BooksComponent,
		BooksEditboxDialog,
 		GamesEditboxDialog,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		NbThemeModule.forRoot({ name: 'dark' }),
		NbSidebarModule.forRoot(),
		NbMenuModule.forRoot(),
		NbDialogModule.forRoot(),
		NbToastrModule.forRoot(),
		NbLayoutModule,
		NbEvaIconsModule,
		NbIconModule,
		NbButtonModule,
		NbCardModule,
		NbTreeGridModule,
		NbInputModule,
		NbSelectModule,
		NbCheckboxModule,
		FormsModule,
		FormsModule,
		ReactiveFormsModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
