import { isValidRecipeType, isValidSlug } from '../../utils';
import type { Advancement as Advancements } from '../types/advancements-data-input';
import type { ItemGroup } from '../types/recipe-data-input';
import type { ExtendedRecipe, RecipeAdvancement, RecipeIngredients, RecipeProgressData, RecipeProgressMetaData } from '../types/types';

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
		const relatedRecipes = extractRelatedRecipesMetaData(data, progressData);

		return {
			...data,
			meta: {
				...data.meta,
				isCraftable: isCraftable,
				relatedLockedRecipes: relatedRecipes.relatedLockedRecipes,
				relatedUnlockedRecipes: relatedRecipes.relatedUnlockedRecipes,
				unlocksRecipes: relatedRecipes.unlocksRecipes
			}
		};
	});
	return progressDataWithMeta;
}

function extractIsCraftableMetaData(data: RecipeProgressData, unlockedRecipeResults: string[], lockedRecipeResults: string[]): boolean | null {
	const requiredIngredientItems = data.recipeIngredients.requiredItems;
	const optionalIngredientItems = data.recipeIngredients.optionalItems;

	const hasAllRequiredItems =
		!requiredIngredientItems.length || requiredIngredientItems.every((ingredient) => unlockedRecipeResults.includes(ingredient));
	const hasSomeOptionalItems =
		!optionalIngredientItems.length || optionalIngredientItems.some((ingredient) => unlockedRecipeResults.includes(ingredient));

	const isRecipeCraftable = hasAllRequiredItems && hasSomeOptionalItems;
	const isRequiredItemsCraftable =
		!requiredIngredientItems.length ||
		requiredIngredientItems.every((item) => unlockedRecipeResults.includes(item) || lockedRecipeResults.includes(item));

	const isOptionalItemsCraftable =
		!optionalIngredientItems.length ||
		optionalIngredientItems.some((item) => unlockedRecipeResults.includes(item) || lockedRecipeResults.includes(item));
	const isItemsCraftable = isRequiredItemsCraftable && isOptionalItemsCraftable;

	return !isItemsCraftable ? null : isRecipeCraftable;
}

function extractRelatedRecipesMetaData(
	data: RecipeProgressData,
	allRecipes: RecipeProgressData[]
): Pick<RecipeProgressMetaData, 'relatedLockedRecipes' | 'relatedUnlockedRecipes' | 'unlocksRecipes'> {
	const relatedRecipes = allRecipes.filter((recipe) => {
		const requiredItems = recipe.recipeIngredients.requiredItems;
		const optionalItems = recipe.recipeIngredients.optionalItems;
		const hasItems = requiredItems.includes(data.result) ?? optionalItems.includes(data.result);
		return hasItems;
	});
	const relatedLockedRecipes = relatedRecipes.filter((recipe) => !recipe.isUnlocked);
	const relatedUnlockedRecipes = relatedRecipes.filter((recipe) => recipe.isUnlocked);
	const unlocksRecipes = relatedLockedRecipes.filter((recipe) => recipe.recipeIngredients.isUnlockedWithItems.includes(data.result));
	return {
		relatedLockedRecipes: relatedLockedRecipes,
		relatedUnlockedRecipes: relatedUnlockedRecipes,
		unlocksRecipes: unlocksRecipes
	};
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
	if (recipe.ingredient) {
		if (Array.isArray(recipe.ingredient)) {
			const requiredItems = recipe.ingredient.map((ingredient) => extractItemsFromItemGroup(ingredient, recipe.recipeName));
			return {
				requiredItems: [...new Set(requiredItems)],
				optionalItems: [],
				isUnlockedWithItems: [...new Set(requiredItems)]
			};
		} else {
			const requiredItems = [extractItemsFromItemGroup(recipe.ingredient, recipe.recipeName)];
			return {
				requiredItems: [...new Set(requiredItems)],
				optionalItems: [],
				isUnlockedWithItems: [...new Set(requiredItems)]
			};
		}
	} else if (recipe.ingredients) {
		const requiredItemGroups = recipe.ingredients.filter((ingredient): ingredient is ItemGroup => !Array.isArray(ingredient));
		const requiredItems = requiredItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		const optionalItemGroups = recipe.ingredients.filter((ingredient): ingredient is ItemGroup[] => Array.isArray(ingredient)).flat();
		const optionalItems = optionalItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		// TODO: find the other edge-cases, then extract from method in a cleaner way
		const isMinecartItem = requiredItems.includes('minecart');

		return {
			requiredItems: [...new Set(requiredItems)],
			optionalItems: [...new Set(optionalItems)],
			isUnlockedWithItems: isMinecartItem ? ['minecart'] : [...new Set([...requiredItems, ...optionalItems])]
		};
	} else if (recipe.key) {
		const itemGroupsFromKey = Object.values(recipe.key ?? {});

		const requiredItemGroups = itemGroupsFromKey.filter((ingredient): ingredient is ItemGroup => !Array.isArray(ingredient));
		const requiredItems = requiredItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		const optionalItemGroups = itemGroupsFromKey.filter((ingredient): ingredient is ItemGroup[] => Array.isArray(ingredient)).flat();
		const optionalItems = optionalItemGroups.map((itemGroup) => extractItemsFromItemGroup(itemGroup, recipe.recipeName));

		const isArmorTemplate = recipe.recipeName.endsWith('armor_trim_smithing_template');

		return {
			requiredItems: [...new Set(requiredItems)],
			optionalItems: [...new Set(optionalItems)],
			// the recipe to craft armor templates are the ones that duplicate themselves
			isUnlockedWithItems: isArmorTemplate ? [recipe.recipeName] : [...new Set([...requiredItems, ...optionalItems])]
		};
	}
	// this is only used for type: "minecraft:smithing_transform" recipes, with netherite ingot as "addition"
	else if (recipe.base && recipe.addition) {
		const baseItems = [extractItemsFromItemGroup(recipe.base, recipe.recipeName)];
		const additionItems = [extractItemsFromItemGroup(recipe.addition, recipe.recipeName)];

		return {
			requiredItems: [...new Set(baseItems.concat(additionItems))],
			optionalItems: [],
			isUnlockedWithItems: [...new Set(additionItems)]
		};
	} else {
		throw new Error(`No valid data type when extracting ingredients in recipe: ${recipe.recipeName}.`);
	}
}

function extractItemsFromItemGroup(itemGroup: ItemGroup, recipeName: string): string {
	const item = itemGroup.item ?? itemGroup.tag;
	if (!item) {
		throw Error(`No item found when extracting ingredients for recipe: ${recipeName}.`);
	}
	return item.split(':')[1];
}
