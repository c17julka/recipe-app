import type { RequestHandler } from '@sveltejs/kit';
import { writeFile } from 'fs';
// import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
	const json = await request.json();

	await writeFile('testy.json', JSON.stringify(json), (err) => {
		if (err) {
			console.log(err);
		}
	});
	return new Response(JSON.stringify({ lol: 'lol' }));
};
