# Recipe app

Lists the locked/unlocked recipes for the [Minecraft Crafting-Recipe Randomizer](https://fasguy.net/minecraft_toolbox/crafting-recipe-randomizer).

## Setup

1. Place app directory in same directory where your minecraft server directory is located
   - e.g. if the server is located at `../documents/minecraft_server`, the app path should be `../documents/recipe-app`
2. Run `npm i` in root
3. Go to `src/routes/recipes/[slug]/+page.server.ts` and locate the following code:

   - ```typescript
     async function loadAllUnlockedAdvancements(): Promise<Advancements> {
     const modules = import.meta.glob(`/../minecraft_server/world/advancements/*.json`);
     ```

   and replace `minecraft_server` with the name of your minecraft server directory if necessary

5. Copy over all recipe `.json` files to `src/static/recipes/data`. You can find these in the randomizer datapack directory: `data/minecraft/recipes`

4. Run `npm run dev`
