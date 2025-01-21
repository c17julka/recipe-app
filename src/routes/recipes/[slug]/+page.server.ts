import type { ExtendedRecipe, RecipeProgressData, RecipeAdvancement } from '../types/types';
import type { Advancement as Advancements } from '../types/advancements-data-input';
import { isValidRecipeType, isValidSlug } from '../../utils';

export async function load({ params }): Promise<{ recipeProgressData: RecipeProgressData[] }> {
	if (!isValidSlug(params.slug)) {
		throw new Error(`Recipe type ${params.slug} not found.`);
	}
	const recipeProgress = await getRecipeProgress();
	if (params.slug === 'all') {
		return { recipeProgressData: recipeProgress };
	} else {
		return { recipeProgressData: recipeProgress.filter((recipe) => recipe.type === params.slug) };
	}
}

async function getRecipeProgress(): Promise<RecipeProgressData[]> {
	const allRecipes = await loadAllCondensedRecipes();
	const unlockedAdvancements = await loadAllUnlockedAdvancements();
	const recipeProgress = extractRecipeProgress(allRecipes, unlockedAdvancements);
	const sortedByIsUnlocked = recipeProgress.sort((recipe) => (recipe.isUnlocked ? 1 : -1));
	return sortedByIsUnlocked;
}

async function loadAllCondensedRecipes(): Promise<ExtendedRecipe[]> {
	const modules = import.meta.glob(`/static/recipes/*.json`);
	const paths = Object.keys(modules);
	const recipes = await Promise.all(
		paths.map(async (path) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const data: any = await modules[path]();
			const recipeName = path.split('/')[3].slice(0, -5);
			return { recipeName: recipeName, ...data.default };
		})
	);
	return recipes;
}

async function loadAllUnlockedAdvancements(): Promise<Advancements> {
	const modules = import.meta.glob(`/../minecraft random p2/world/advancements/*.json`);
	const paths = Object.keys(modules);
	const advancements: Advancements[] = await Promise.all(
		paths.map(async (path) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const data: any = await modules[path]();
			return data.default;
		})
	);

	const totalAdvancements: Advancements = advancements.reduce((previous, current) => {
		const prevNames = Object.keys(previous);
		const currAdvancementsPair = Object.entries(current);

		const newAdvancementsPair = currAdvancementsPair.filter(([key]) => !prevNames.includes(key));
		const combinedAdvancementsPair = currAdvancementsPair.concat(newAdvancementsPair);

		return { ...previous, ...Object.fromEntries(combinedAdvancementsPair) };
	});

	return totalAdvancements;
}

function extractRecipeProgress(allRecipes: ExtendedRecipe[], unlockedAdvancements: Advancements): RecipeProgressData[] {
	const unlockedRecipes: RecipeAdvancement[] = Object.entries(unlockedAdvancements)
		.filter(([advancementFullName]) => advancementFullName.startsWith('minecraft:recipes'))
		.map(([recipeFullName, advancementProps]) => {
			const recipeCondensedName = recipeFullName.split('/')[2];
			return {
				recipeName: recipeCondensedName,
				isUnlocked: !!advancementProps.done
			};
		})
		.filter((recipe) => recipe.isUnlocked);

	const recipeProgressData: RecipeProgressData[] = allRecipes
		.map((recipe) => {
			const isUnlocked = !!unlockedRecipes.find((unlockedRecipe) => unlockedRecipe.recipeName === recipe.recipeName);
			const condensedType = recipe.type?.split(':')[1];

			if (!condensedType || !isValidRecipeType(condensedType)) {
				throw new Error(`Could not find a valid type for recipe: ${recipe.recipeName}.`);
			}

			const progressData: RecipeProgressData = {
				craftingRecipeName: recipe.recipeName,
				result: extractRecipeResultItem(recipe),
				isUnlocked: isUnlocked,
				type: condensedType
			};
			return progressData;
		})
		.sort((recipe1, recipe2) => recipe2.craftingRecipeName.localeCompare(recipe1.craftingRecipeName))
		.sort((recipe1, recipe2) => recipe2.type.localeCompare(recipe1.type));

	return recipeProgressData;
}

function extractRecipeResultItem(recipe: ExtendedRecipe): string {
	const errorMessage = (recipeName: string) => {
		return `No item result found for recipe: ${recipeName}.`;
	};
	if (!recipe.result) {
		throw new Error(errorMessage(recipe.recipeName));
	}

	if (typeof recipe.result === 'string') {
		return recipe.result.split(':')[1];
	}

	if (!recipe.result.item) {
		throw new Error(errorMessage(recipe.recipeName));
	}

	return recipe.result.item.split(':')[1];
}
