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
import { MoviesEditboxDialog } from './pages/movies/movies-editbox/movies-editbox.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
@NgModule({
	declarations: [
		AppComponent,
		GamesComponent,
		MoviesComponent,
		BooksComponent,
		BooksEditboxDialog,
 		GamesEditboxDialog,
   		MoviesEditboxDialog,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		NbThemeModule.forRoot(),
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
		MatTableModule,
		MatFormFieldModule,
		MatPaginatorModule,
		MatSortModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
