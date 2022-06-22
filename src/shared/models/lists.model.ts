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
