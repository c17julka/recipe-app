<script lang="ts">
	import { ARROW_DOWN_TURN_RIGHT, CLOSE_OUTLINE_ICON_PATH } from '../../../../../static/icons/icons';
	import { splitByUnderscore } from '../../../utils';
	import type { RecipeProgressData } from '../../types/types';

	interface InputProps {
		isChecked: boolean;
		data: RecipeProgressData | undefined;
		scrollToElementName: string | undefined;
	}

	function setScrolledToElementName(name: string) {
		scrollToElementName = name;
	}

	let { isChecked = $bindable(), scrollToElementName = $bindable(), data }: InputProps = $props();
</script>

<div class="flex h-full">
	<div
		class="fixed inset-y-0 right-0 h-full w-1/4 transform resize overflow-auto bg-white transition-all duration-300"
		class:-translate-x-0={isChecked && data}
		class:translate-x-full={!isChecked || !data}
	>
		<button class="m-3" type="button" aria-label="Close panel" onclick={() => (isChecked = false)}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="visible w-8 stroke-slate-900 stroke-2">
				{@html CLOSE_OUTLINE_ICON_PATH}
			</svg>
		</button>
		<div class="mx-12 mb-6 flex flex-col text-4xl text-slate-900">
			<h1 class="mb-1 font-semibold">{splitByUnderscore(data?.craftingRecipeName)}</h1>
			<div class="align-center mb-8 flex text-4xl">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="visible w-8 stroke-slate-900 stroke-2">
					{@html ARROW_DOWN_TURN_RIGHT}
				</svg>
				<h1 class="font-semibold">{splitByUnderscore(data?.result)}</h1>
			</div>
			{#if data?.meta.relatedLockedRecipesAmount}
				<h2 class="text-2xl font-semibold">Result used in:</h2>
				<ul class="ml-5 list-disc text-lg font-semibold text-slate-500">
					{#each data?.meta.relatedLockedRecipes ?? [] as relatedRecipe}
						<li class="w-fit cursor-pointer hover:text-slate-900" onclick={() => setScrolledToElementName(relatedRecipe.craftingRecipeName)}>
							{splitByUnderscore(relatedRecipe.craftingRecipeName)}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<!-- <div class="mx-12 flex flex-col text-slate-900">
			<div class="flex">
				<h2 class="text-lg font-semibold">{data?.result.split('_').join(' ')}</h2>
				{#if data?.meta.relatedLockedRecipesAmount}
					<button aria-label="Expand">
						<ion-icon class="visible ml-2 text-3xl" name="chevron-down-outline"></ion-icon>
					</button>
				{/if}
			</div>
			<ul class="list-point ml-5 text-lg font-semibold text-slate-500">
				{#each data?.meta.relatedLockedRecipes ?? [] as relatedRecipe}
					<li class="my-1 flex">
						{relatedRecipe.craftingRecipeName.split('_').join(' ')}
						{#if relatedRecipe?.meta.relatedLockedRecipesAmount}
							<button aria-label="Expand">
								<ion-icon class="visible ml-2 text-3xl" name="chevron-down-outline"></ion-icon>
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		</div> -->
	</div>
</div>
