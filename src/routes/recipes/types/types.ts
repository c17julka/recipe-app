import type { RecipeType } from '../../types';
import type { Recipe } from './recipe-data-input';

export type ExtendedRecipe = Recipe & {
	recipeName: string;
};

export interface RecipeProgressData {
	craftingRecipeName: string;
	result: string;
	isUnlocked: boolean;
	iconPath?: string;
	type: RecipeType;
}

export interface RecipeAdvancement {
	recipeName: string;
	isUnlocked: boolean;
}
