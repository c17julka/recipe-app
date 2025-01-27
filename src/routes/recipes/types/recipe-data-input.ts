export interface Recipe {
	type?: string;
	category?: string;
	group?: string;
	key?: Key;
	pattern?: string[];
	ingredients?: (ItemGroup | ItemGroup[])[];
	ingredient?: ItemGroup | ItemGroup[];
	addition?: ItemGroup;
	base?: ItemGroup;
	result?: Result | string;
}

export interface Result {
	count?: number;
	item?: string;
}

export interface Key {
	[key: string]: ItemGroup | ItemGroup[];
}

export interface ItemGroup {
	item?: string;
	tag?: string;
}
