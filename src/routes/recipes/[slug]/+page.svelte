<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import type { RecipeProgressData } from '../types/types';

	let { data }: PageProps = $props();

	let modifiedData: RecipeProgressData[] = $state([]);

	// async function favourite(progressData: RecipeProgressData, isFavourite: boolean) {
	// progressData.meta.favourite = isFavourite;
	// modifiedData = modifiedData.sort((first, second) => {
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

	$effect(() => {
		modifiedData = data.recipeProgressData;
	});
</script>

<h1>Recipes unlocked: {modifiedData.filter((recipe) => recipe.isUnlocked).length}/{modifiedData.length}</h1>
<table class="my-8 w-full table-fixed overflow-scroll text-left font-sans text-slate-300">
	<thead class="bg-slate-700">
		<tr>
			{#if page.params.slug === 'all'}
				<th class="w-1/6 border border-slate-500 p-3">Type</th>
			{/if}
			<th class="border border-slate-500 p-3">Recipe</th>
			<th class="border border-slate-500 p-3">Item</th>
			<th class=" w-1/12 border border-slate-500 p-3">Is craftable</th>
			<!-- <th class=" w-1/12 border border-slate-500 p-3"></th> -->
		</tr>
	</thead>
	<tbody>
		{#each modifiedData as progressData}
			<tr class="bg-slate-800">
				{#if page.params.slug === 'all'}
					<td class="border border-slate-500 p-3">{progressData.type.split('_').join(' ')}</td>
				{/if}
				<td class="border border-slate-500 p-3">
					<a target="_blank" href="https://minecraft.wiki/w/Special:Search?search={progressData.craftingRecipeName}"
						>{progressData.craftingRecipeName.split('_').join(' ')}</a
					></td
				>
				<td class="border border-slate-500 p-3"
					>{#if progressData.isUnlocked}
						<a target="_blank" href="https://minecraft.wiki/w/Special:Search?search={progressData.result}"
							>{progressData.result.split('_').join(' ')}</a
						>
					{/if}</td
				>
				<td class="border border-slate-500 p-3">
					{#if progressData.meta.isCraftable}
						<ion-icon class="w-full fill-teal-500" name="checkbox"></ion-icon>
					{:else if progressData.meta.isCraftable === false}
						<ion-icon class="w-full fill-rose-500" name="close-circle"></ion-icon>
					{:else}
						<ion-icon class="w-full fill-slate-400" name="help-circle"></ion-icon>
					{/if}</td
				>
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

<style>
	ion-icon {
		font-size: 30px;
	}
</style>
