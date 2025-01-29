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
	recipeIngredients: RecipeIngredients;
	meta: {
		favourite?: boolean;
		isCraftable?: boolean | null;
		relatedLockedRecipesAmount?: number;
		relatedLockedRecipes?: RecipeProgressData[];
	};
}

export interface RecipeIngredients {
	requiredItems: string[]; // all items are required
	optionalItems: string[]; // only one of these items are required
}

export interface RecipeAdvancement {
	recipeName: string;
	isUnlocked: boolean;
}
