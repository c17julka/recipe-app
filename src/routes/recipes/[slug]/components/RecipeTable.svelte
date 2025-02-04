<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { RecipeProgressData } from '../../types/types';
	import RecipePanel from './../components/RecipePanel.svelte';
	import { CHECKMARK_ICON_PATH, CLOSE_ICON_PATH, EXTERNAL_LINK_ICON_PATH, HELP_ICON_PATH } from '../../../../../static/icons/icons';
	import { getCookie, IS_SIDE_PANEL_OPEN_COOKIE_NAME, SELECTED_DATA_COOKIE_NAME, setCookie, splitByUnderscore } from '../../../utils';

	let { data }: { data: RecipeProgressData[] } = $props();

	const mcWikiLink = (recipe: string) => `https://minecraft.wiki/w/Special:Search?search=${recipe}`;

	let isSidePanelOpen = $state(false);
	let selectedData: RecipeProgressData | undefined = $state(undefined);

	let scrollToElementName: string | undefined = $state(undefined);

	$effect(() => {
		const elementName = scrollToElementName;
		if (!elementName) {
			return;
		}
		const element = document.querySelector(`a[href='${mcWikiLink(elementName)}'].recipe-link`) as HTMLElement;
		const parentRow = element?.closest('tr');
		if (!parentRow) {
			return;
		}
		parentRow.focus();
	});

	$effect(() => {
		const selectedDataRecipeName = selectedData?.craftingRecipeName;
		if (!selectedDataRecipeName) {
			return;
		}
		setCookie(selectedDataRecipeName, SELECTED_DATA_COOKIE_NAME);
		console.log(document.cookie);
	});

	$effect(() => {
		const isSidePanelOpenValue = isSidePanelOpen;

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

	function separateByFrom(value: string): string {
		return value.split('_from_')[0];
	}

	// async function favourite(progressData: RecipeProgressData, isFavourite: boolean) {
	// progressData.meta.favourite = isFavourite;
	// data = data.sort((first, second) => {
	// 	if (first.meta.favourite && !second.meta.favourite) {
	// 		return -1;
	// 	} else {
	// 		return 1;
	// 	}
	// });
	// const response = await fetch('favourites', {
	// 	method: 'POST',
	// 	body: JSON.stringify([
	// 		{
	// 			cake: {
	// 				isFavourite: true
	// 			}
	// 		}
	// 	]),
	// 	headers: {
	// 		'content-type': 'application/json'
	// 	}
	// });
	// const jsonResponse = await response.json();
	// console.log(jsonResponse);
	// writeFile('testy.json', JSON.stringify({ testy: 'meow' }), (err) => {
	// 	if (err) {
	// 		console.error(String(err));
	// 	}
	// });
	// }

	// function saveAsCookie(progressData: RecipeProgressData, cookieProps: { isFavourite: boolean }) {
	// 	const cookieValue = document.cookie
	// 		.split('; ')
	// 		.find((row) => row.startsWith('favourites='))
	// 		?.split('=')[1];
	// 	const cookieValueArray = Array.from(cookieValue ?? []);

	// 	if (!cookieProps.isFavourite) {
	// 		const dataIndex = cookieValueArray.indexOf(progressData.craftingRecipeName);
	// 		cookieValueArray.splice(dataIndex, 1);
	// 	} else {
	// 		cookieValueArray.push(progressData.craftingRecipeName);
	// 	}

	// 	const newFavouritesCookieValue = `favourites=${cookieValueArray.toString()}`;
	// 	if (document.cookie === '' || !cookieValue) {
	// 		document.cookie = newFavouritesCookieValue;
	// 	} else {
	// 		document.cookie.replace(`favourites=${cookieValue}`, newFavouritesCookieValue);
	// 	}
	// }

	function getRelatedRecipesButtonColor(progressData: RecipeProgressData): string {
		const relatedLockedRecipesAmount = progressData.meta.relatedLockedRecipesAmount;

		if (!relatedLockedRecipesAmount || relatedLockedRecipesAmount === 0) {
			return 'bg-slate-600/50';
		} else if (relatedLockedRecipesAmount <= 3) {
			return 'bg-violet-500/30';
		} else if (relatedLockedRecipesAmount <= 10) {
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
				<th class="w-1/6 border border-slate-500 p-2">Type</th>
			{/if}
			<th class="border border-slate-500 p-2">Recipe</th>
			<th class="border border-slate-500 p-2">Item</th>
			<th class=" w-1/12 border border-slate-500 p-2">Is craftable</th>
			<th class=" w-1/12 border border-slate-500 p-2">Related locked recipes</th>
			<!-- <th class=" w-1/12 border border-slate-500 p-2"></th> -->
		</tr>
	</thead>
	<tbody>
		{#each data as progressData}
			<tr tabindex="0" class="bg-slate-800 focus:border-2 focus:border-purple-500">
				{#if page.params.slug === 'all'}
					<td class="border border-slate-500 p-2">{splitByUnderscore(progressData.type)}</td>
				{/if}
				<td class="border border-slate-500 p-2">
					<a class="recipe-link flex w-fit gap-2" target="_blank" href={mcWikiLink(separateByFrom(progressData.craftingRecipeName))}
						>{splitByUnderscore(progressData.craftingRecipeName)}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="invisible w-4 fill-white">
							{@html EXTERNAL_LINK_ICON_PATH}
						</svg>
					</a></td
				>
				<td class="border border-slate-500 p-2"
					>{#if progressData.isUnlocked}
						<a class="result-link flex w-fit gap-2" target="_blank" href={mcWikiLink(separateByFrom(progressData.result))}
							>{splitByUnderscore(progressData.result)}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="invisible w-4 fill-white">
								{@html EXTERNAL_LINK_ICON_PATH}
							</svg>
						</a>
					{/if}</td
				>
				<td class="border border-slate-500 p-2">
					<div class="flex w-full justify-center text-3xl">
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
							<button class="rounded-full px-3 py-1 {getRelatedRecipesButtonColor(progressData)}" onclick={() => openSidePanel(progressData)}>
								{progressData.meta.relatedLockedRecipesAmount}
							</button>
						{/if}
					</div>
				</td>
				<!-- <td class="border border-slate-500 p-3">
					<button class="w-full" aria-label="Favourite" onclick={() => favourite(progressData, !progressData.meta.favourite)}>
						{#if progressData.meta.favourite}
							<ion-icon name="star"></ion-icon>
						{:else}
							<ion-icon name="star-outline"></ion-icon>
						{/if}
					</button>
				</td> -->
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
