"use strict";
/*
  NutriPlan data and settings
  Created by Gaurav Patil. © 2026 Gaurav Patil. All rights reserved.

  Edit this file to change foods, diet types, allergies, meal split, activity levels
  and the Useful tools affiliate links. The app logic is in script.js.
  This file must load before script.js (see the script tags at the bottom of index.html).
*/

/* ============ 1. CONFIG: edit these lists to change the app ============ */
const ACTIVITY = [
  ["Sedentary – little exercise", 1.2],
  ["Light – 1–3 days/week", 1.375],
  ["Moderate – 3–5 days/week", 1.55],
  ["Very active – 6–7 days/week", 1.725],
];
const PACE = [
  ["Gentle – 0.25 kg/week", 0.25],
  ["Steady – 0.5 kg/week", 0.5],
  ["Faster – 0.75 kg/week", 0.75],
];
const DIETS = ["Vegan", "Vegetarian", "Eggetarian", "Non-vegetarian"]; // list position = level (a food is shown if its level <= yours)
const ALLERGENS = [
  ["dairy", "Dairy"],
  ["gluten", "Gluten"],
  ["nuts", "Nuts"],
  ["soy", "Soy"],
  ["eggs", "Eggs"],
  ["fish", "Fish"],
];
const MEALS = [
  ["Breakfast", "b", 0.25, "🌅"],
  ["Lunch", "l", 0.35, "🍛"],
  ["Snack", "s", 0.1, "🍎"],
  ["Dinner", "d", 0.3, "🌙"],
]; // name, key, share of daily kcal, icon
const LIMITS = {
  age: [18, 90, "Age"],
  h: [120, 230, "Height"],
  w: [30, 300, "Weight"],
};

// USEFUL TOOLS (affiliate links). Paste your own link between the quotes after "link:".
// A product only appears when its link starts with https://. With no links, the whole section stays hidden.
// Change DISCLOSURE if you join a different program (it is shown next to the links and in the footer).
const DISCLOSURE = "As an Amazon Associate, I earn from qualifying purchases.";
const TOOLS = [
  {
    icon: "⚖️",
    name: "Digital kitchen scale",
    why: "Weigh portions so your calorie count is accurate.",
    link: "https://link.amazon/B05edxAK6",
  },
  {
    icon: "🥄",
    name: "Measuring cups and spoons",
    why: "Measure rice, oil and dal without guessing.",
    link: "https://link.amazon/B04Ytg8Dz",
  },
  {
    icon: "🍱",
    name: "Meal-prep containers",
    why: "Prepare your meals ahead and carry them with you.",
    link: "https://link.amazon/B046Mhp5S",
  },
  {
    icon: "🥤",
    name: "Gym shaker bottle",
    why: "Mix drinks and carry them to the gym.",
    link: "https://link.amazon/B0282iPUI",
  },
  {
    icon: "💧",
    name: "Water bottle",
    why: "Keep track of how much water you drink.",
    link: "https://link.amazon/B060WLON9",
  },
  {
    icon: "⌚",
    name: "Fitness band",
    why: "Track your steps and daily activity.",
    link: "https://link.amazon/B0aUjJNU2",
  },
];

// Food list: [meal, name, one serving, kcal per serving, diet level (0 vegan … 3 non-veg), allergens]
const FOODS = [
  ["b", "Vegetable poha", "1 plate", 230, 0, ""],
  ["b", "Idli with sambar", "3 idlis", 240, 0, ""],
  ["b", "Dosa with chutney", "2 dosas", 260, 0, ""],
  ["b", "Besan chilla with veggies", "2 chillas", 220, 0, ""],
  ["b", "Fruit & chia bowl", "1 bowl", 190, 0, ""],
  ["b", "Vegetable upma", "1 plate", 250, 0, "gluten"],
  ["b", "Oats with fruit", "1 bowl", 220, 0, "gluten"],
  ["b", "Peanut butter toast", "2 slices", 330, 0, "nuts,gluten"],
  ["b", "Tofu scramble", "1 plate", 220, 0, "soy"],
  ["b", "Greek yogurt with fruit", "1 bowl", 220, 1, "dairy"],
  ["b", "Paneer paratha", "1 paratha", 320, 1, "dairy,gluten"],
  ["b", "Veg omelette with toast", "2 eggs", 290, 2, "eggs,gluten"],
  ["b", "Boiled eggs with fruit", "2 eggs", 210, 2, "eggs"],
  ["l", "Dal, rice & sabzi", "1 plate", 480, 0, ""],
  ["l", "Rajma with rice", "1 plate", 520, 0, ""],
  ["l", "Chole with brown rice", "1 plate", 500, 0, ""],
  ["l", "Quinoa veggie bowl", "1 bowl", 420, 0, ""],
  ["l", "Roti, dal & veg curry", "1 plate", 450, 0, "gluten"],
  ["l", "Chickpea salad wrap", "1 wrap", 400, 0, "gluten"],
  ["l", "Tofu stir-fry with rice", "1 plate", 450, 0, "soy"],
  ["l", "Paneer bhurji with roti", "1 plate", 490, 1, "dairy,gluten"],
  ["l", "Veg khichdi with curd", "1 bowl", 400, 1, "dairy"],
  ["l", "Egg curry with rice", "1 plate", 480, 2, "eggs"],
  ["l", "Grilled chicken, rice & salad", "1 plate", 500, 3, ""],
  ["l", "Chicken curry with roti", "1 plate", 520, 3, "gluten"],
  ["l", "Fish curry with rice", "1 plate", 480, 3, "fish"],
  ["s", "Roasted chana", "1 handful", 120, 0, ""],
  ["s", "Fresh fruit", "1 medium", 90, 0, ""],
  ["s", "Sprouts salad", "1 bowl", 130, 0, ""],
  ["s", "Roasted makhana", "1 bowl", 110, 0, ""],
  ["s", "Hummus with veggie sticks", "1 bowl", 140, 0, ""],
  ["s", "Almonds & walnuts", "1 handful", 170, 0, "nuts"],
  ["s", "Edamame", "1 cup", 120, 0, "soy"],
  ["s", "Buttermilk", "1 glass", 60, 1, "dairy"],
  ["s", "Greek yogurt", "1 cup", 100, 1, "dairy"],
  ["s", "Protein shake", "1 scoop", 130, 1, "dairy"],
  ["s", "Boiled egg", "1 egg", 75, 2, "eggs"],
  ["d", "Lentil soup with salad", "1 bowl", 300, 0, ""],
  ["d", "Moong dal khichdi", "1 bowl", 380, 0, ""],
  ["d", "Rice & sambar", "1 plate", 420, 0, ""],
  ["d", "Sweet potato & chickpea salad", "1 plate", 380, 0, ""],
  ["d", "Mixed veg curry with roti", "1 plate", 400, 0, "gluten"],
  ["d", "Tofu & veg curry with rice", "1 plate", 420, 0, "soy"],
  ["d", "Grilled paneer with veggies", "1 plate", 380, 1, "dairy"],
  ["d", "Veg pulao with raita", "1 plate", 430, 1, "dairy"],
  ["d", "Egg bhurji with roti", "1 plate", 400, 2, "eggs,gluten"],
  ["d", "Grilled fish with veggies", "1 plate", 380, 3, "fish"],
  ["d", "Chicken tikka, salad & roti", "1 plate", 450, 3, "gluten"],
];
