import { page } from '$app/stores';
import { derived } from 'svelte/store';

const ROUTES_WITHOUT_NAVBAR = ['/login', '/register', '/garden'];

export const showNavbar = derived(page, ($page) => {
	return !ROUTES_WITHOUT_NAVBAR.some((route) => $page.url.pathname.startsWith(route));
});

export function shouldHideNavbar(pathname: string): boolean {
	return ROUTES_WITHOUT_NAVBAR.some((route) => pathname.startsWith(route));
}

export function addRouteWithoutNavbar(route: string): void {
	if (!ROUTES_WITHOUT_NAVBAR.includes(route)) {
		ROUTES_WITHOUT_NAVBAR.push(route);
	}
}

export function removeRouteWithoutNavbar(route: string): void {
	const index = ROUTES_WITHOUT_NAVBAR.indexOf(route);
	if (index > -1) {
		ROUTES_WITHOUT_NAVBAR.splice(index, 1);
	}
}