# 🌿 Healthy Ways

A healthy recipe website that recommends nutritious alternatives to popular comfort foods — with full macro/micro breakdowns, ingredients, and step-by-step instructions.

## Stack

Pure HTML + CSS + JS. No frameworks, no build tools, no backend.

- `index.html` — Homepage with pinned recipes
- `recipes.html` — All recipes with fuzzy search and ingredient filter
- `data/recipes.json` — Recipe database (add new recipes here)
- `fonts/` — Self-hosted Inter + Playfair Display (no external requests)

## Adding Recipes

If you wish to suggest entries to the project you can provide them in Issues or fork the repository and edit the `data/recipes.json` by following this schema:

```json
{
  "id": "recipe-slug",
  "emoji": "🍛",
  "title": "Recipe Name",
  "alt": "unhealthy food it replaces",
  "pinned": false,
  "macros": { "Protein": "20g", "Carbs": "35g", "Fat": "10g", "Fiber": "5g" },
  "kcal": 310,
  "micros": { "Vitamin A": "15%", "Iron": "12%" },
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "steps": ["Step 1.", "Step 2."]
}
```
We would test the recipe and add if it aligns with our catalogue.
