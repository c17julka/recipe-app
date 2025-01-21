<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="container mx-auto my-10">
	<h1>{page.status}: {page.error?.message}</h1>
</div>
