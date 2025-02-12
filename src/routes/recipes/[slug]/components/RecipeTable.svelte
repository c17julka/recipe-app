<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { RecipeProgressData } from '../../types/types';
	import RecipePanel from './../components/RecipePanel.svelte';
	import { CHECKMARK_ICON_PATH, CLOSE_ICON_PATH, EXTERNAL_LINK_ICON_PATH, HELP_ICON_PATH } from '../../../../../static/icons/icons';
	import {
		FOCUSED_TABLE_ROW_COOKIE_NAME,
		getCookie,
		IS_SIDE_PANEL_OPEN_COOKIE_NAME,
		SELECTED_DATA_COOKIE_NAME,
		setCookie,
		splitByFrom,
		splitByUnderscore
	} from '../../../utils';

	let { data }: { data: RecipeProgressData[] } = $props();

	const mcWikiLink = (recipe: string) => `https://minecraft.wiki/w/Special:Search?search=${recipe}`;

	let isSidePanelOpen: boolean | undefined = $state(undefined);
	let selectedData: RecipeProgressData | undefined = $state(undefined);
	let scrollToElementName: string | undefined = $state(undefined);

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

	function getSelectedData(): RecipeProgressData | undefined {
		const selectedDataCookieValue = getCookie(SELECTED_DATA_COOKIE_NAME);
		const recipeData = data.find((recipe) => recipe.craftingRecipeName === selectedDataCookieValue);
		return recipeData;
	}

	function getIsSidePanelOpen() {
		const isSidePanelOpenValue = getCookie(IS_SIDE_PANEL_OPEN_COOKIE_NAME);
		return isSidePanelOpenValue === 'true';
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
		} else if (unlocksRecipesAmount <= 10) {
			return 'bg-violet-600/50';
		} else {
			return 'bg-violet-600';
		}
	}

	onMount(() => {
		selectedData = getSelectedData();
		isSidePanelOpen = getIsSidePanelOpen();
	});
</script>

<h1>Recipes unlocked: {data.filter((recipe) => recipe.isUnlocked).length}/{data.length}</h1>
<table class="mb-8 mt-4 w-3/4 table-auto overflow-scroll text-left font-sans text-slate-300">
	<thead class="bg-slate-700">
		<tr>
			{#if page.params.slug === 'all'}
				<th class="w-2/12 border border-slate-500 p-2">Type</th>
			{/if}
			<th class="w-5/12 border border-slate-500 p-2">Recipe</th>
			<th class="border border-slate-500 p-2">Item</th>
			{#if page.params.slug === 'all'}
				<th class=" w-1/12 border border-slate-500 p-2">Is craftable</th>
				<th class=" w-1/12 border border-slate-500 p-2">Unlocks recipes</th>
			{/if}
		</tr>
	</thead>
	<tbody>
		{#each data as progressData}
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
