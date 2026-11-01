# 🥗 NutriPlan

A free calorie tracker and diet planner. Enter your age, height, weight, food preference and allergies, and NutriPlan shows your optimal weight, daily calorie target, macros and a daily meal plan with Indian food options.

**Live site:** https://nutrii-plan.netlify.app/

## Features

- Optimal weight and healthy range from your height (BMI 18.5 to 24.9)
- Optional goal weight, with the time needed to reach it
- Daily calories (Mifflin-St Jeor equation) with a safe minimum, plus protein, carb and fat targets
- Meal plans for Vegan, Vegetarian, Eggetarian and Non-vegetarian diets
- Allergy filters: dairy, gluten, nuts, soy, eggs, fish
- Daily calorie tracker with quick "add" buttons
- Share the plan or download it as a PDF (built in the browser, no library)
- Light and dark mode, works on phones, tablets and desktops
- Legal information: health disclaimer, privacy, terms and copyright

## Project structure

```
nutriplan/
├── index.html   Page structure and legal text
├── style.css    All styling, colours and responsive layout
├── data.js      Settings, food list and Useful tools links (edit this most often)
├── script.js    App logic: calculations, rendering, tracker, share and PDF
├── README.md
└── LICENSE
```

No build step and no dependencies. `data.js` must load before `script.js`.

## Run it locally

Download the repository and open `index.html` in your browser.

## Edit it

| What you want to change | File |
| --- | --- |
| Foods and calories | `data.js` (`FOODS`) |
| Diet types, allergies, meal split, activity levels | `data.js` |
| Useful tools and affiliate links | `data.js` (`TOOLS`, `DISCLOSURE`) |
| Colours and layout | `style.css` (theme section at the top) |
| Calculations and behaviour | `script.js` |
| Page text and legal sections | `index.html` |

## Deploy

Drag the whole folder onto [Netlify Drop](https://app.netlify.com/drop), or turn on GitHub Pages (Settings, then Pages, then deploy from the `main` branch).

## Privacy

NutriPlan has no accounts, ads, analytics or cookies. What you enter is processed in your browser and saved only on your own device using local storage. Nothing is sent to a server.

## Disclaimer

NutriPlan gives general guidance and is not medical advice. Talk to a doctor or dietitian if you have a health condition or are pregnant. Always check food labels for allergens.

Some links in the Useful tools section are affiliate links. As an Amazon Associate, I earn from qualifying purchases.

## License

Copyright (c) 2026 Gaurav Patil. All rights reserved. See [LICENSE](LICENSE).

Created by Gaurav Patil.
