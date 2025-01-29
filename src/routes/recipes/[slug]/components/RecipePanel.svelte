<script lang="ts">
	import type { RecipeProgressData } from '../../types/types';

	interface InputProps {
		isChecked: boolean;
		data: RecipeProgressData | undefined;
		scrollToElementName: string | undefined;
	}

	function setScrolledToElementName(name: string) {
		scrollToElementName = name
	}

	let { isChecked = $bindable(),scrollToElementName = $bindable(), data }: InputProps = $props();
</script>

<div class="flex h-full">
	<div
		class:-translate-x-0={isChecked && data}
		class=" fixed inset-y-0 right-0 h-full w-1/4 translate-x-full transform bg-white transition-all duration-300"
	>
		<button class="m-4" type="button" aria-label="Close panel" onclick={() => (isChecked = false)}>
			<ion-icon class="visible fill-slate-900 text-3xl" name="close"> </ion-icon>
		</button>
		<div class="mx-12 flex flex-col text-4xl text-slate-900">
			<h1 class="my-1 font-semibold">{data?.craftingRecipeName.split('_').join(' ')}</h1>
			<div class="align-center mb-8 flex text-4xl">
				<ion-icon class="visible mt-1.5" name="arrow-forward-outline"></ion-icon>
				<h1 class="font-semibold">{data?.result.split('_').join(' ')}</h1>
			</div>
			{#if data?.meta.relatedLockedRecipesAmount}
				<h2 class="text-2xl font-semibold">Result used in:</h2>
				<ul class="ml-5 list-disc text-lg font-semibold text-slate-500">
					{#each data?.meta.relatedLockedRecipes ?? [] as relatedRecipe}
						<li class="cursor-pointer w-fit hover:text-slate-900" onclick={() => setScrolledToElementName(relatedRecipe.craftingRecipeName)}>
							{relatedRecipe.craftingRecipeName.split('_').join(' ')}
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
