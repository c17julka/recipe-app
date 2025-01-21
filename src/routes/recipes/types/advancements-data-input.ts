export interface Advancement {
	[key: string]: AdvancementProps;
}

export interface AdvancementProps {
	criteria?: Criteria;
	done?: boolean;
}

export interface Criteria {
	[key: string]: string;
}
