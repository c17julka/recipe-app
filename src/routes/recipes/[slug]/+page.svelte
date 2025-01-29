<script lang="ts">
	import type { PageProps } from './$types';
	import RecipeTable from './components/RecipeTable.svelte';
	('./components/RecipePanel.svelte');

	let { data }: PageProps = $props();
</script>

<RecipeTable data={data.recipeProgressData}></RecipeTable>
