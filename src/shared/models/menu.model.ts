import { NbMenuItem } from "@nebular/theme";

export const MENU_ITEMS : NbMenuItem[] = [
	{
		title: 'Home',
		icon: 'home-outline',
		link: '/',
	},
	{
		title: 'Pages',
		icon: 'grid-outline',
		children: [
			{
				title: 'Games',
				icon: 'play-circle-outline',
				link: '/list/games'
			},
			{
				title: 'Movies',
				icon: 'film-outline',
				link: '/list/movies'
			},
			{
				title: 'Books',
				icon: 'book-outline',
				link: '/list/books'
			}
		]
	}
];
