import { isValidRecipeType, isValidSlug } from '../../utils';
import type { Advancement as Advancements } from '../types/advancements-data-input';
import type { ItemGroup } from '../types/recipe-data-input';
import type { ExtendedRecipe, RecipeAdvancement, RecipeIngredients, RecipeProgressData } from '../types/types';

export async function load({ params }): Promise<{ recipeProgressData: RecipeProgressData[] }> {
	if (!isValidSlug(params.slug)) {
		throw new Error(`Recipe type ${params.slug} not found.`);
	}
	// const favouritesCookieData = cookie.get('favourites');
	const recipeProgress = await getRecipeProgress();
	const recipeProgressDataFromSlug = extractProgressDataFromSlug(params.slug, recipeProgress);
	const recipeProgressDataWithMeta = extractProgressDataWithMeta(recipeProgressDataFromSlug);

	return {
		recipeProgressData: recipeProgressDataWithMeta
	};
}

function extractProgressDataWithMeta(progressData: RecipeProgressData[]): RecipeProgressData[] {
	const unlockedRecipes = progressData.filter((data) => data.isUnlocked);
	const lockedRecipes = progressData.filter((data) => !data.isUnlocked);

	const unlockedRecipeResults = unlockedRecipes.map((data) => data.result);
	const lockedRecipeResults = lockedRecipes.map((data) => data.result);

	const progressDataWithMeta = progressData.map((data) => {
		const isCraftable = extractIsCraftableMetaData(data, unlockedRecipeResults, lockedRecipeResults);
		const relatedLockedRecipes = extractRelatedLockedRecipesMetaData(data, lockedRecipes);
		const relatedLockedRecipesAmount = relatedLockedRecipes.length;

		return {
			...data,
			meta: {
				...data.meta,
				isCraftable: isCraftable,
				relatedLockedRecipesAmount: relatedLockedRecipesAmount,
				relatedLockedRecipes: relatedLockedRecipes
			}
		};
	});
	return progressDataWithMeta;
}

function extractIsCraftableMetaData(data: RecipeProgressData, unlockedRecipeResults: string[], lockedRecipeResults: string[]): boolean | null {
	const optionalIngredientItems = data.recipeIngredients.optionalItems;
	const requiredIngredientItems = data.recipeIngredients.requiredItems;

	const hasAllRequiredItems =
		!requiredIngredientItems.length || requiredIngredientItems.every((ingredient) => unlockedRecipeResults.includes(ingredient));
	const hasAllOptionalItems =
		!optionalIngredientItems.length || optionalIngredientItems.some((ingredient) => unlockedRecipeResults.includes(ingredient));

	const isRecipeCraftable = hasAllRequiredItems && hasAllOptionalItems;
	const isRequiredItemsCraftable =
		!requiredIngredientItems.length ||
		requiredIngredientItems.every((item) => unlockedRecipeResults.includes(item) || lockedRecipeResults.includes(item));

	const isOptionalItemsCraftable =
		!optionalIngredientItems.length ||
		optionalIngredientItems.some((item) => unlockedRecipeResults.includes(item) || lockedRecipeResults.includes(item));
	const isItemsCraftable = isRequiredItemsCraftable && isOptionalItemsCraftable;

	return !isItemsCraftable ? null : isRecipeCraftable;
}

function extractRelatedLockedRecipesMetaData(data: RecipeProgressData, lockedRecipeResults: RecipeProgressData[]): RecipeProgressData[] {
	const relatedLockedRecipes = lockedRecipeResults.filter((recipe) => {
		const requiredItems = recipe.recipeIngredients.requiredItems;
		const optionalItems = recipe.recipeIngredients.optionalItems;
		const hasItems = requiredItems.includes(data.result) ?? optionalItems.includes(data.result);
		return hasItems;
	});
	return relatedLockedRecipes;
}

function extractProgressDataFromSlug(slug: string, recipeProgressData: RecipeProgressData[]): RecipeProgressData[] {
	if (slug === 'all') {
		return recipeProgressData;
	} else {
		return recipeProgressData.filter((recipe) => recipe.type === slug);
	}
}

async function getRecipeProgress(): Promise<RecipeProgressData[]> {
	const allRecipes = await loadAllCondensedRecipes();
	const unlockedAdvancements = await loadAllUnlockedAdvancements();
	const recipeProgress = extractRecipeProgress(allRecipes, unlockedAdvancements);
	const sortedByIsUnlocked = recipeProgress.sort((recipe) => (recipe.isUnlocked ? -1 : 1));
	return sortedByIsUnlocked;
}

async function loadAllCondensedRecipes(): Promise<ExtendedRecipe[]> {
	const modules = import.meta.glob(`/static/recipes/data/*.json`);
	const paths = Object.keys(modules);
	const recipes = await Promise.all(
		paths.map(async (path) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const data: any = await modules[path]();
			const recipeName = path.split('/')[4].slice(0, -5);
			return { recipeName: recipeName, ...data.default };
		})
	);
	return recipes;
}

async function loadAllUnlockedAdvancements(): Promise<Advancements> {
	const modules = import.meta.glob(`/../minecraft random PART THREE OPMG/world/advancements/*.json`);
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

			const recipeIngredients = extractRecipeIngredients(recipe);

			const progressData: RecipeProgressData = {
				craftingRecipeName: recipe.recipeName,
				result: extractRecipeResultItem(recipe),
				isUnlocked: isUnlocked,
				type: condensedType,
				recipeIngredients: recipeIngredients,
				meta: {}
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

function extractRecipeIngredients(recipe: ExtendedRecipe): RecipeIngredients {
	const hasRecipeIngredientsArray = recipe.ingredients?.some((ingredient) => Array.isArray(ingredient));

	const itemGroupsFromKey = Object.values(recipe.key ?? {});
	const recipeKeyHasArray = itemGroupsFromKey.some((ingredient) => Array.isArray(ingredient));
	if (recipe.ingredient) {
		if (Array.isArray(recipe.ingredient)) {
			return {
				requiredItems: [...new Set(recipe.ingredient.map((ingredient) => extractItemsFromItemGroup(ingredient, recipe.recipeName)))],
				optionalItems: []
			};
		} else {
			return {
				requiredItems: [...new Set([extractItemsFromItemGroup(recipe.ingredient, recipe.recipeName)])],
				optionalItems: []
			};
		}
	} else if (recipe.ingredients && !hasRecipeIngredientsArray) {
		return {
			requiredItems: [...new Set(recipe.ingredients.map((ingredient) => extractItemsFromItemGroup(ingredient as ItemGroup, recipe.recipeName)))],
			optionalItems: []
		};
	} else if (recipe.ingredients && hasRecipeIngredientsArray) {
		const requiredItemGroups = recipe.ingredients.filter((ingredient): ingredient is ItemGroup => !Array.isArray(ingredient));
		const requiredItems = requiredItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		const optionalItemGroups = recipe.ingredients.filter((ingredient): ingredient is ItemGroup[] => Array.isArray(ingredient)).flat();
		const optionalItems = optionalItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		return {
			requiredItems: [...new Set(requiredItems)],
			optionalItems: [...new Set(optionalItems)]
		};
	} else if (recipe.key && !recipeKeyHasArray) {
		const itemGroupsFromKey = Object.values(recipe.key);
		return {
			requiredItems: [...new Set(itemGroupsFromKey.map((itemGroup) => extractItemsFromItemGroup(itemGroup as ItemGroup, recipe.recipeName)))],
			optionalItems: []
		};
	} else if (recipe.key && recipeKeyHasArray) {
		const requiredItemGroups = itemGroupsFromKey.filter((ingredient): ingredient is ItemGroup => !Array.isArray(ingredient));
		const requiredItems = requiredItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		const optionalItemGroups = itemGroupsFromKey.filter((ingredient): ingredient is ItemGroup[] => Array.isArray(ingredient)).flat();
		const optionalItems = optionalItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		return {
			requiredItems: [...new Set(requiredItems)],
			optionalItems: [...new Set(optionalItems)]
		};
	} else if (recipe.base && recipe.addition) {
		const baseItems = [extractItemsFromItemGroup(recipe.base, recipe.recipeName)];
		const additionItems = [extractItemsFromItemGroup(recipe.addition, recipe.recipeName)];
		return {
			requiredItems: [...new Set(baseItems.concat(additionItems))],
			optionalItems: []
		};
	} else {
		throw new Error(`No valid data type when extracting required items in recipe: ${recipe.recipeName}.`);
	}
}

function extractItemsFromItemGroup(itemGroup: ItemGroup, recipeName: string): string {
	const item = itemGroup.item ?? itemGroup.tag;
	if (!item) {
		throw Error(`No item found when extracting recipe.ingredient for recipe: ${recipeName}.`);
	}
	return item.split(':')[1];
}
