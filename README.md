# 🥗 NutriPlan

A free calorie tracker and diet planner. Enter your age, height, weight, food preference and allergies, and NutriPlan shows your optimal weight, daily calorie target, macros and a daily meal plan with Indian food options.

**Live site:** https://nutrii-plan.netlify.app/

## Features

- Optimal weight and healthy range from your height (BMI 18.5 to 24.9)
- Optional goal weight, with the time needed to reach it
- Daily calories (Mifflin-St Jeor equation) with a safe minimum, plus protein, carb and fat targets
- Meal plan for Vegan, Vegetarian, Eggetarian and Non-vegetarian diets
- Allergy filters: dairy, gluten, nuts, soy, eggs, fish
- Daily calorie tracker with quick "add" buttons
- Share the plan or download it as a PDF (built in the browser, no library)
- Light and dark mode, works on phones, tablets and desktops
- Legal pages: health disclaimer, privacy, terms and copyright

## Tech

One file, no build step, no dependencies: plain HTML, CSS and JavaScript in `index.html`.

## Run it locally

Download the repository and open `index.html` in your browser.

## Edit it

Everything you are likely to change is in the `CONFIG` area at the top of the script in `index.html`:

| What | Where |
| --- | --- |
| Foods and calories | `FOODS` list |
| Diet types, allergies, meal split | `DIETS`, `ALLERGENS`, `MEALS` |
| Useful tools (affiliate links) | `TOOLS` list and `DISCLOSURE` |
| Colours | theme section at the top of the CSS |

## Deploy

Drag the folder onto [Netlify Drop](https://app.netlify.com/drop), or turn on GitHub Pages in the repository settings (Settings, then Pages, then deploy from the `main` branch).

## Privacy

NutriPlan has no accounts, ads, analytics or cookies. What you enter is processed in your browser and saved only on your own device using local storage. Nothing is sent to a server.

## Disclaimer

NutriPlan gives general guidance and is not medical advice. Talk to a doctor or dietitian if you have a health condition or are pregnant. Always check food labels for allergens.

Some links in the Useful tools section are affiliate links. As an Amazon Associate, I earn from qualifying purchases.

## License

Copyright (c) 2026 Gaurav Patil. All rights reserved. See [LICENSE](LICENSE).

Created by Gaurav Patil.
