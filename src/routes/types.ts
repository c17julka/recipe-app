export const SLUG_TYPES = [
	'all',
	'blasting',
	'campfire_cooking',
	'crafting_shaped',
	'crafting_shapeless',
	'smelting',
	'smithing_transform',
	'smoking',
	'stonecutting'
] as const;

export type SlugType = (typeof SLUG_TYPES)[number];

export const RECIPE_TYPES = [
	'blasting',
	'campfire_cooking',
	'crafting_shaped',
	'crafting_shapeless',
	'smelting',
	'smithing_transform',
	'smoking',
	'stonecutting'
] as const;

export type RecipeType = (typeof RECIPE_TYPES)[number];
