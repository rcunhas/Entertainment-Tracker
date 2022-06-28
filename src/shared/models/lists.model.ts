export interface IList {
	checkbox: boolean;
	name: string;
	score: number;
	starred: boolean;
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
	movie: boolean;
	genre: string[];
	watchWithGF: boolean;
}

export const BOOK_GENRES = ['Action and Adventure', 'Classic', 'Comic Book or Manga', 'Drama', 'Fantasy', 'Fiction', 'Horror', 'Mystery', 'Post-Apocalyptic', 'Romance', 'Sci-Fi', 'Short Stories', 'Thriller', 'History', 'True Crime', 'Cyberpunk']

export const WHERE_TO_PLAY = ['Ubisoft', 'EA', 'Game Pass', 'Steam', 'Epic', 'Battle.net', 'Fitgirl', 'PS5'];

export const GAME_GENRES = ['Action', 'Action RPG', 'Adventure', 'Arcade', "Beat'em Up", 'City Building', 'Co-op', 'Horror', 'Hack and Slash', 'Open World', 'Other', 'Platform', 'Puzzle', 'Racing', 'Roguelike', 'RTS', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Strategy', 'Survival', 'Soulslike', 'TD', 'Turn Based', 'Cyberpunk', 'Japanese', 'Story Rich', 'Zombies'];

export const WHERE_TO_STREAM = ['Netflix', 'Prime Video', 'HBO Max', 'Disney+', 'Crunchyroll', 'Pirate Bay'];

export const MOVIE_GENRES = ['Action', 'Anime', 'Animation', 'Asian', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Kids', 'Mystery', 'Musical', 'Reality TV', 'Police', 'Marvel', 'Spy', 'Super Hero', 'STAR WARS', 'Pixar', 'Romance', 'Sci-Fi', 'Sports', 'Teen', 'Thriller']
