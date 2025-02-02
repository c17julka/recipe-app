<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { SLUG_TYPES } from './types';

	let { children } = $props();
</script>

<div class="w-[95vw] px-8">
	<nav class="my-5 w-4/6">
		<ol class="flex flex-wrap gap-4">
			{#each SLUG_TYPES as slug}
				<li class="rounded bg-slate-800 px-4 py-2 font-medium" class:bg-teal-800={page.params.slug === slug}>
					<a href="/recipes/{slug}">{slug}</a>
				</li>
			{/each}
		</ol>
	</nav>
	{@render children()}
</div>
