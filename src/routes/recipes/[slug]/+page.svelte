<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	let { data }: PageProps = $props();
</script>

<table class="my-8 w-full table-fixed overflow-scroll text-left font-sans text-slate-300">
	<thead class="bg-slate-700">
		<tr>
			{#if page.params.slug === 'all'}
				<th class="w-1/6 border border-slate-500 p-3">Type</th>
			{/if}
			<th class="border border-slate-500 p-3">Recipe</th>
			<th class="border border-slate-500 p-3">Item</th>
		</tr>
	</thead>
	<tbody>
		{#each data.recipeProgressData as progressData}
			<tr class="bg-slate-800">
				{#if page.params.slug === 'all'}
					<td class="border border-slate-500 p-3">{progressData.type}</td>
				{/if}
				<td class="border border-slate-500 p-3">{progressData.craftingRecipeName}</td>
				<td class="border border-slate-500 p-3"
					>{#if progressData.isUnlocked}
						{progressData.result}
					{/if}</td
				>
			</tr>
		{/each}
	</tbody>
</table>
