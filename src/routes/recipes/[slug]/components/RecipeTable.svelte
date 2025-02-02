<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { RecipeProgressData } from '../../types/types';
	import RecipePanel from './../components/RecipePanel.svelte';

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
            return
        }
        parentRow.focus();
	});

	$effect(() => {
		const selectedDataRecipeName = selectedData?.craftingRecipeName;
		const selectedDataCookieValue = document.cookie
			.split('; ')
			.find((row) => row.startsWith('selectedData='))
			?.split('=')[1];

		if (selectedDataRecipeName && selectedDataCookieValue) {
			document.cookie = document.cookie.replace(`selectedData=${selectedDataCookieValue}`, `selectedData=${selectedDataRecipeName}`);
		} else if (selectedDataRecipeName) {
			document.cookie = `selectedData=${selectedDataRecipeName}`;
		} else {
			document.cookie = ``;
		}
	});

	function getSelectedData(): RecipeProgressData | undefined {
		const selectedDataCookieValue = document.cookie
			.split('; ')
			.find((row) => row.startsWith('selectedData='))
			?.split('=')[1];
		const recipeData = data.find((recipe) => recipe.craftingRecipeName === selectedDataCookieValue);
		return recipeData;
	}


	function openSidePanel(data: RecipeProgressData) {
		selectedData = data;
		isSidePanelOpen = true;
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
	});
</script>

<h1>Recipes unlocked: {data.filter((recipe) => recipe.isUnlocked).length}/{data.length}</h1>
<table class="my-8 w-full table-fixed overflow-scroll text-left font-sans text-slate-300">
	<thead class="bg-slate-700">
		<tr>
			{#if page.params.slug === 'all'}
				<th class="w-1/6 border border-slate-500 p-3">Type</th>
			{/if}
			<th class="border border-slate-500 p-3">Recipe</th>
			<th class="border border-slate-500 p-3">Item</th>
			<th class=" w-1/12 border border-slate-500 p-3">Is craftable</th>
			<th class=" w-1/12 border border-slate-500 p-3">Related locked recipes</th>
			<!-- <th class=" w-1/12 border border-slate-500 p-3"></th> -->
		</tr>
	</thead>
	<tbody>
		{#each data as progressData}
        <!-- TODO: give classes async -->
			<tr tabindex="0" class="bg-slate-800 focus:border-2 focus:border-purple-500">
				{#if page.params.slug === 'all'}
					<td class="border border-slate-500 p-3">{progressData.type.split('_').join(' ')}</td>
				{/if}
				<td class="border border-slate-500 p-3">
					<a class="recipe-link flex w-fit gap-2" target="_blank" href={mcWikiLink(progressData.craftingRecipeName)}
						>{progressData.craftingRecipeName.split('_').join(' ')} <ion-icon class="invisible pt-1" name="open-outline"></ion-icon></a
					></td
				>
				<td class="border border-slate-500 p-3"
					>{#if progressData.isUnlocked}
						<a class="result-link flex w-fit gap-2" target="_blank" href={mcWikiLink(progressData.result)}
							>{progressData.result.split('_').join(' ')} <ion-icon class="invisible pt-1" name="open-outline"></ion-icon></a
						>
					{/if}</td
				>
				<td class="border border-slate-500 p-3">
					<div class="flex w-full justify-center text-3xl">
						{#if progressData.meta.isCraftable}
							<ion-icon class="visible fill-teal-500" name="checkbox"></ion-icon>
						{:else if progressData.meta.isCraftable === false}
							<ion-icon class="visible fill-rose-500" name="close-circle"></ion-icon>
						{:else}
							<ion-icon class="visible fill-slate-400" name="help-circle"></ion-icon>
						{/if}
					</div>
				</td>
				<td class="border border-slate-500 p-3 font-bold">
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
	.recipe-link, .result-link {
		&:hover ion-icon {
			visibility: inherit;
		}
	}
</style>
