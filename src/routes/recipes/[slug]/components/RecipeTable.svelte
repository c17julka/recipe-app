<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { RecipeProgressData } from '../../types/types';
	import RecipePanel from './../components/RecipePanel.svelte';
	import { ARROW_DOWN_PATH, CHECKMARK_ICON_PATH, CLOSE_ICON_PATH, EXTERNAL_LINK_ICON_PATH, HELP_ICON_PATH } from '../../../../../static/icons/icons';
	import {
		extractFieldByPath,
		FOCUSED_TABLE_ROW_COOKIE_NAME,
		getCookie,
		IS_SIDE_PANEL_OPEN_COOKIE_NAME,
		SELECTED_DATA_COOKIE_NAME,
		setCookie,
		SORT_DATA_COOKIE_NAME,
		splitByFrom,
		splitByUnderscore
	} from '../../../utils';

	let { data }: { data: RecipeProgressData[] } = $props();

	const mcWikiLink = (recipe: string) => `https://minecraft.wiki/w/Special:Search?search=${recipe}`;

	let isSidePanelOpen: boolean | undefined = $state(undefined);
	let selectedData: RecipeProgressData | undefined = $state(undefined);
	let scrollToElementName: string | undefined = $state(undefined);
	let sortData: { sortField: string; direction: 'asc' | 'dsc' } | undefined = $state(undefined);

	let modifiedData: RecipeProgressData[] = $state(data);

	$effect(() => {
		modifiedData = data;
	});

	$effect(() => {
		const elementName = scrollToElementName;
		if (!elementName) {
			return;
		}
		setCookie(elementName, FOCUSED_TABLE_ROW_COOKIE_NAME);
		const tableRowElement = getFocusableTableRowElement(elementName);

		if (!tableRowElement) {
			return;
		}
		tableRowElement.focus();
		scrollToElementName = undefined;
	});

	$effect(() => {
		const selectedDataRecipeName = selectedData?.craftingRecipeName;
		if (!selectedDataRecipeName) {
			return;
		}
		setCookie(selectedDataRecipeName, SELECTED_DATA_COOKIE_NAME);
	});

	$effect(() => {
		const isSidePanelOpenValue = isSidePanelOpen;
		if (isSidePanelOpenValue === undefined) {
			return;
		}
		setCookie(isSidePanelOpenValue.toString(), IS_SIDE_PANEL_OPEN_COOKIE_NAME);
	});

	$effect(() => {
		if (!sortData) {
			return;
		}
		setCookie(JSON.stringify(sortData), SORT_DATA_COOKIE_NAME);

		const sortableStringFields = ['craftingRecipeName', 'type'];
		const sortableBooleanFields = ['isUnlocked', 'meta.isCraftable'];
		const sortableArrayNumberFields = ['meta.unlocksRecipes'];
		modifiedData.sort((a, b) => {
			if (!sortData?.sortField) {
				return 0;
			}

			const fieldA = extractFieldByPath(a, sortData.sortField);
			const fieldB = extractFieldByPath(b, sortData.sortField);

			if (sortableStringFields.includes(sortData.sortField)) {
				const stringA = fieldA as string;
				const stringB = fieldB as string;
				return sortData.direction === 'asc' ? stringB.localeCompare(stringA) : stringA.localeCompare(stringB);
			} else if (sortableBooleanFields.includes(sortData.sortField)) {
				const booleanA = fieldA as boolean | null;
				const booleanB = fieldB as boolean | null;
				if (booleanA === booleanB) {
					return 0;
				}
				if (booleanA === null) {
					return sortData.direction === 'asc' ? -1 : 1;
				}
				if (booleanB === null) {
					return sortData.direction === 'asc' ? 1 : -1;
				}

				return sortData.direction === 'asc' ? Number(booleanA) - Number(booleanB) : Number(booleanB) - Number(booleanA);
			} else if (sortableArrayNumberFields.includes(sortData.sortField)) {
				const numberA = (fieldA as any[]).length;
				const numberB = (fieldB as any[]).length;

				if (sortData.sortField === 'meta.unlocksRecipes') {
					const isRecipesUnlocked = a.isUnlocked && b.isUnlocked;
					if (isRecipesUnlocked && sortData.direction === 'asc') {
						return (a.meta.unlocksRecipes?.length ?? 0) - (b.meta.unlocksRecipes?.length ?? 0);
					} else if (isRecipesUnlocked && sortData.direction === 'dsc') {
						return (b.meta.unlocksRecipes?.length ?? 0) - (a.meta.unlocksRecipes?.length ?? 0);
					} else if (a.isUnlocked) {
						// Unlocked items come before locked items
						return -1;
					} else {
						// Locked items come after unlocked items
						return 1;
					}
				}

				return sortData.direction === 'asc' ? numberA - numberB : numberB - numberA;
			} else return 0;
		});
	});

	function getSelectedData(): RecipeProgressData | undefined {
		const selectedDataCookieValue = getCookie(SELECTED_DATA_COOKIE_NAME);
		const recipeData = modifiedData.find((recipe) => recipe.craftingRecipeName === selectedDataCookieValue);
		return recipeData;
	}

	function getIsSidePanelOpen() {
		const isSidePanelOpenValue = getCookie(IS_SIDE_PANEL_OPEN_COOKIE_NAME);
		return isSidePanelOpenValue === 'true';
	}

	function getSortData() {
		const sortData = getCookie(SORT_DATA_COOKIE_NAME);
		return sortData ? JSON.parse(sortData) : sortData;
	}

	function openSidePanel(data: RecipeProgressData) {
		selectedData = data;
		isSidePanelOpen = true;
	}

	function getFocusableTableRowElement(elementName: string): HTMLElement | undefined {
		const elementNameShortened = splitByFrom(elementName);
		const elements = document.querySelectorAll<HTMLElement>(`a[href='${mcWikiLink(elementNameShortened)}'].recipe-link`);
		if (!elements.length) {
			return undefined;
		}

		if (elements.length === 1) {
			const parentRow = elements[0].closest('tr');
			if (!parentRow) {
				return;
			}
			return parentRow;
		}

		const findElementByInnerText = elements.values().find((element) => element.innerText === splitByUnderscore(elementName));
		if (!findElementByInnerText) {
			return undefined;
		}
		const parentRow = findElementByInnerText.closest('tr');
		if (!parentRow) {
			return undefined;
		}
		return parentRow;
	}

	function getRelatedRecipesButtonColor(progressData: RecipeProgressData): string {
		const unlocksRecipesAmount = progressData.meta.unlocksRecipes?.length;

		if (!unlocksRecipesAmount || unlocksRecipesAmount === 0) {
			return 'bg-slate-600/50';
		} else if (unlocksRecipesAmount <= 3) {
			return 'bg-violet-500/30';
		} else if (unlocksRecipesAmount <= 8) {
			return 'bg-violet-600/50';
		} else {
			return 'bg-violet-600';
		}
	}

	function setSortData(sortField: string) {
		if (!sortData || sortData.sortField !== sortField || (sortData.sortField === sortField && sortData.direction === 'asc')) {
			sortData = {
				sortField: sortField as keyof RecipeProgressData,
				direction: 'dsc'
			};
		} else {
			sortData.direction = 'asc';
		}
	}

	onMount(() => {
		selectedData = getSelectedData();
		isSidePanelOpen = getIsSidePanelOpen();
		sortData = getSortData();
	});
</script>

<h1>Recipes unlocked: {modifiedData.filter((recipe) => recipe.isUnlocked).length}/{modifiedData.length}</h1>
<table class="mb-8 mt-4 w-3/4 table-auto overflow-scroll text-left font-sans text-slate-300">
	<thead class="bg-slate-700">
		<tr>
			{#if page.params.slug === 'all'}
				<th class="w-1/6 cursor-pointer border border-slate-500 p-2" onclick={() => setSortData('type')}>
					<div class="flex flex-row gap-1">
						Type <svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							class="w-[18px] stroke-white transition-transform duration-300"
							class:rotate-180={sortData?.direction === 'asc'}
							class:invisible={sortData?.sortField !== 'type'}
						>
							{@html ARROW_DOWN_PATH}
						</svg>
					</div>
				</th>
			{/if}
			<th class="cursor-pointer border border-slate-500 p-2" onclick={() => setSortData('craftingRecipeName')}>
				<div class="flex flex-row gap-1">
					Recipe <svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						class="w-[18px] stroke-white transition-transform duration-300"
						class:rotate-180={sortData?.direction === 'asc'}
						class:invisible={sortData?.sortField !== 'craftingRecipeName'}
					>
						{@html ARROW_DOWN_PATH}
					</svg>
				</div>
			</th>
			<th class="cursor-pointer border border-slate-500 p-2" onclick={() => setSortData('isUnlocked')}>
				<div class="flex flex-row gap-1">
					Item <svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						class="w-[18px] stroke-white transition-transform duration-300"
						class:rotate-180={sortData?.direction === 'asc'}
						class:invisible={sortData?.sortField !== 'isUnlocked'}
					>
						{@html ARROW_DOWN_PATH}
					</svg>
				</div>
			</th>
			{#if page.params.slug === 'all'}
				<th class=" w-1/12 cursor-pointer border border-slate-500 p-2" onclick={() => setSortData('meta.isCraftable')}>
					<div class="flex flex-row gap-1">
						Is craftable <svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							class="w-[18px] stroke-white transition-transform duration-300"
							class:rotate-180={sortData?.direction === 'asc'}
							class:invisible={sortData?.sortField !== 'meta.isCraftable'}
						>
							{@html ARROW_DOWN_PATH}
						</svg>
					</div>
				</th>
				<th class=" w-1/12 cursor-pointer border border-slate-500 p-2" onclick={() => setSortData('meta.unlocksRecipes')}>
					<div class="flex flex-row gap-1">
						<p class="w-max">Unlocks recipes</p>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							class="w-[18px] stroke-white transition-transform duration-300"
							class:rotate-180={sortData?.direction === 'asc'}
							class:invisible={sortData?.sortField !== 'meta.unlocksRecipes'}
						>
							{@html ARROW_DOWN_PATH}
						</svg>
					</div>
				</th>
			{/if}
		</tr>
	</thead>
	<tbody>
		{#each modifiedData as progressData}
			<tr tabindex="0" class="bg-slate-800 focus:border-2 focus:border-solid focus:border-purple-500">
				{#if page.params.slug === 'all'}
					<td class="border border-slate-500 p-2">{splitByUnderscore(progressData.type)}</td>
				{/if}
				<td class="border border-slate-500 p-3">
					<a class="recipe-link flex w-fit gap-2 hover:underline" target="_blank" href={mcWikiLink(splitByFrom(progressData.craftingRecipeName))}
						>{splitByUnderscore(progressData.craftingRecipeName)}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="invisible w-4 fill-white">
							{@html EXTERNAL_LINK_ICON_PATH}
						</svg>
					</a></td
				>
				<td class="border border-slate-500 p-2"
					>{#if progressData.isUnlocked}
						<a class="result-link flex w-fit gap-2 hover:underline" target="_blank" href={mcWikiLink(splitByFrom(progressData.result))}
							>{splitByUnderscore(progressData.result)}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="invisible w-4 fill-white">
								{@html EXTERNAL_LINK_ICON_PATH}
							</svg>
						</a>
					{/if}</td
				>
				{#if page.params.slug === 'all'}
					<td class="border border-slate-500 p-2">
						<div class="flex w-full justify-center">
							{#if progressData.meta.isCraftable}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-9 fill-teal-500">
									{@html CHECKMARK_ICON_PATH}
								</svg>
							{:else if progressData.meta.isCraftable === false}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-9 fill-rose-500">
									{@html CLOSE_ICON_PATH}
								</svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-9 fill-slate-400">
									{@html HELP_ICON_PATH}
								</svg>
							{/if}
						</div>
					</td>
					<td class="border border-slate-500 p-2 font-bold">
						<div class="flex w-full justify-center">
							{#if progressData.isUnlocked}
								<button
									class="rounded-full px-3 py-1 hover:underline {getRelatedRecipesButtonColor(progressData)}"
									onclick={() => openSidePanel(progressData)}
								>
									{progressData.meta.unlocksRecipes?.length}
								</button>
							{/if}
						</div>
					</td>
				{/if}
			</tr>
		{/each}
	</tbody>
</table>

<RecipePanel bind:isChecked={isSidePanelOpen} bind:scrollToElementName data={selectedData}></RecipePanel>

<style>
	.recipe-link,
	.result-link {
		&:hover svg {
			visibility: visible;
		}
	}
</style>
