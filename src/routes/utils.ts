import { RECIPE_TYPES, SLUG_TYPES, type RecipeType, type SlugType } from './types';

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
