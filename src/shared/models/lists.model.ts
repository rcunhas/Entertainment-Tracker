export interface IList {
	checkbox: boolean;
	name: string;
	score: number;
}

export interface IFranchise extends IList {
	children: IList;
}

export interface IBookList extends IList {
	author: string;
	genre: string[];
}

export interface IGameList extends IList {
	whereToPlay: string[];
	genre: string[];
	singleplayer: boolean;
	multiplayer: boolean;
	recommended: boolean;
}

export interface IMovieList extends IList {
	whereToStream: string[];
	genre: string[];
	watchWithGF: boolean;
}

export interface TreeNode<T> {
	data: T;
	children?: TreeNode<T>[];
	expanded?: boolean;
  }


export const BOOK_GENRES = ['Action and Adventure', 'Classic', 'Comic Book or Manga', 'Mystery', 'Fantasy', 'Fiction', 'Horror', 'Romance', 'Sci-Fi', 'Short Stories', 'Thriller', 'History', 'True Crime']

export const WHERE_TO_PLAY = ['Ubisoft', 'EA', 'Game Pass', 'Steam', 'Epic', 'Battle.net', 'Fitgirl'];

export const GAME_GENRES = ['Action', 'Adventure', 'Arcade', "Beat'em Up", 'City Building', 'Co-op', 'Horror', 'Open World', 'Other', 'Platform', 'Puzzle', 'Racing', 'RTS', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Survival', 'TD', 'Turn Based'];

export const WHERE_TO_STREAM = ['Netflix', 'Prime Video', 'HBO Max', 'Disney+', 'Crunchyroll'];

export const MOVIE_GENRES = ['Action', 'Anime', 'Asian', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Kids', 'Movie', 'Mystery', 'Reality TV', 'Police', 'Marvel', 'STAR WARS', 'Pixar', 'Romance', 'Sci-Fi', 'Sports', 'Teen', 'Thriller', 'TV Show']
