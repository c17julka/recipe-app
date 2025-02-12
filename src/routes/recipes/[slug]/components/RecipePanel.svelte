<script lang="ts">
	import { ARROW_DOWN_TURN_RIGHT, CLOSE_OUTLINE_ICON_PATH, LOCKED_PATH, UNLOCKED_PATH } from '../../../../../static/icons/icons';
	import { splitByUnderscore } from '../../../utils';
	import type { RecipeProgressData } from '../../types/types';

	interface InputProps {
		isChecked: boolean | undefined;
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
		class="fixed inset-y-0 right-0 h-full w-1/4 transform resize overflow-auto bg-violet-300 text-slate-950 transition-all duration-300"
		class:-translate-x-0={isChecked && data}
		class:translate-x-full={!isChecked || !data}
	>
		<button class="m-3" type="button" aria-label="Close panel" onclick={() => (isChecked = false)}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="visible w-8 stroke-slate-950 stroke-2">
				{@html CLOSE_OUTLINE_ICON_PATH}
			</svg>
		</button>
		<div class="mx-12 mb-6 flex flex-col text-4xl font-semibold">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<h1 class="mb-1 cursor-pointer hover:underline" onclick={() => setScrolledToElementName(data?.craftingRecipeName ?? '')}>
				{splitByUnderscore(data?.craftingRecipeName)}
			</h1>
			<div class="align-center mb-8 flex text-4xl">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="visible w-8 stroke-slate-950 stroke-2">
					{@html ARROW_DOWN_TURN_RIGHT}
				</svg>
				<h1>{splitByUnderscore(data?.result)}</h1>
			</div>
			<p class="mb-6 text-lg">
				Obtaining <span class="font-bold">{splitByUnderscore(data?.result)}</span> unlocks
				<span class="font-bold">{data?.meta.unlocksRecipes?.length ?? 0}</span> recipe(s).
			</p>
			{#if data?.meta.relatedLockedRecipes?.length}
				<h2 class="flex flex-row gap-1 text-2xl">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-5 stroke-slate-900 stroke-2 pt-1">
						{@html LOCKED_PATH}
					</svg>
					Result used in locked recipes:
				</h2>
				<ul class="mb-6 ml-5 list-disc text-lg">
					{#each data?.meta.relatedLockedRecipes ?? [] as relatedRecipe}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li
							class="w-fit cursor-pointer text-slate-950 hover:hover:underline"
							onclick={() => setScrolledToElementName(relatedRecipe.craftingRecipeName)}
						>
							{splitByUnderscore(relatedRecipe.craftingRecipeName)}
						</li>
					{/each}
				</ul>
			{/if}
			{#if data?.meta.relatedUnlockedRecipes?.length}
				<h2 class="flex flex-row gap-1 text-2xl">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-5 stroke-slate-900 stroke-2 pt-1">
						{@html UNLOCKED_PATH}
					</svg>
					Result used in unlocked recipes:
				</h2>
				<ul class="ml-5 list-disc text-lg">
					{#each data?.meta.relatedUnlockedRecipes ?? [] as relatedRecipe}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li class="w-fit cursor-pointer hover:hover:underline" onclick={() => setScrolledToElementName(relatedRecipe.craftingRecipeName)}>
							{splitByUnderscore(relatedRecipe.craftingRecipeName)}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
