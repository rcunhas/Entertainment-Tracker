import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BooksComponent } from './pages/books/books.component';
import { GamesComponent } from './pages/games/games.component';
import { MoviesComponent } from './pages/movies/movies.component';

const routes: Routes = [
	{
		path: 'list/games',
		component: GamesComponent,
	},
	{
		path: 'list/movies',
		component: MoviesComponent,
	},
	{
		path: 'list/books',
		component: BooksComponent,
	},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
