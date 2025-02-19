import { RECIPE_TYPES, SLUG_TYPES, type RecipeType, type SlugType } from './types';

export const SELECTED_DATA_COOKIE_NAME = 'selectedData';
export const IS_SIDE_PANEL_OPEN_COOKIE_NAME = 'isSidePanelOpen';
export const FOCUSED_TABLE_ROW_COOKIE_NAME = 'focusedTableRow';
export const SORT_DATA_COOKIE_NAME = 'sortData';

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

export function splitByFrom(value: string): string {
	return value.split('_from_')[0];
}

export function setCookie(newValue: string, cookieName: string): void {
	document.cookie = `${cookieName}=${newValue};path=/;`;
}

export function getCookie(cookieName: string): string | undefined {
	const cookieValue = document.cookie
		.split('; ')
		.find((row) => row.startsWith(`${cookieName}=`))
		?.split('=')[1];
	return cookieValue;
}

export function deleteCookie(cookieName: string): void {
	document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

export function extractFieldByPath<T>(obj: T, path: string): unknown {
	const segments = path.split('.');

	let current: unknown = obj;
	for (const segment of segments) {
		if (!!current && typeof current === 'object') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			current = (current as any)[segment];
		}
	}

	return current;
}
