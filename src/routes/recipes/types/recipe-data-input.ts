export interface Recipe {
	type?: string;
	category?: string;
	group?: string;
	key?: Key;
	pattern?: string[];
	ingredients?: Ingredient[];
	result?: Result | string;
}

export interface Result {
	count?: number;
	item?: string;
}

export interface Key {
	[key: string]: ItemGroup;
}

export interface ItemGroup {
	item?: string;
	tag?: string;
}

export interface Ingredient {
	item?: string;
}
