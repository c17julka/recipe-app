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
	meta: RecipeProgressMetaData;
}

export interface RecipeIngredients {
	requiredItems: string[]; // all items are required
	optionalItems: string[]; // only one of these items are required
	isUnlockedWithItems: string[]; // need to be obtained by the player in order to unlock the recipe
}

export interface RecipeAdvancement {
	recipeName: string;
	isUnlocked: boolean;
}

export interface RecipeProgressMetaData {
	favourite?: boolean;
	isCraftable?: boolean | null;
	relatedLockedRecipes?: RecipeProgressData[];
	relatedUnlockedRecipes?: RecipeProgressData[];
	unlocksRecipes?: RecipeProgressData[];
}