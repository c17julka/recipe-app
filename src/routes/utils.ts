import { RECIPE_TYPES, SLUG_TYPES, type RecipeType, type SlugType } from './types';

export const SELECTED_DATA_COOKIE_NAME = 'selectedData';
export const IS_SIDE_PANEL_OPEN_COOKIE_NAME = 'isSidePanelOpen';

export function isValidRecipeType(value: unknown): value is RecipeType {
	for (const recipe of RECIPE_TYPES) {
		if (recipe === value) {
			return true;
		}
	}
	return false;
}

export function isValidSlug(value: unknown): value is SlugType {
	for (const slug of SLUG_TYPES) {
		if (slug === value) {
			return true;
		}
	}
	return false;
}

export function splitByUnderscore(value: string | undefined): string | undefined {
	return value?.split('_').join(' ');
}

export function setCookie(newValue: string, cookieName: string): void {
	const cookieValue = document.cookie
		.split('; ')
		.find((row) => row.startsWith(`${cookieName}=`))
		?.split('=')[1];

	if (newValue && cookieValue) {
		document.cookie = document.cookie.replace(`${cookieName}=${cookieValue}`, `${cookieName}=${newValue}`);
	} else if (newValue) {
		document.cookie = `${cookieName}=${newValue}`;
	} else {
		document.cookie = ``;
	}
}

export function getCookie(cookieName: string) {
	const cookieValue = document.cookie
		.split('; ')
		.find((row) => row.startsWith(`${cookieName}=`))
		?.split('=')[1];
	return cookieValue;
}
