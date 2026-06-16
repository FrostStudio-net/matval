// Matval — app logic
// State

const STORES = [
  { id: "kronan", name: "Krónan", available: true, note: "Eina verslunin í boði núna", logo: "public/KRO_Logo_Emblem_2023.png" },
  { id: "bonus", name: "Bónus", available: false, note: "Kemur síðar", logo: "public/Bonus_The_Piglet_fc_RGB.webp"  },
  { id: "netto", name: "Nettó", available: false, note: "Kemur síðar", logo: "public/NETTÓ-LÓGÓ-01-1.jpg"  },
  { id: "hagkaup", name: "Hagkaup", available: false, note: "Kemur síðar", logo: "public/hagkaup-seeklogo.png"  },
];

const GOALS = [
  { id: "cheap", label: "Borða ódýrt", icon: "💰" },
  { id: "healthy", label: "Borða hollara", icon: "🥗" },
  { id: "weight_loss", label: "Léttast", icon: "📉" },
  { id: "muscle_gain", label: "Byggja vöðva", icon: "💪" },
  { id: "high_protein", label: "Próteinríkt", icon: "🍗" },
  { id: "dairy_free", label: "Mjólkurlaust", icon: "🥛" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "vegetarian", label: "Grænmetisfæði", icon: "🥕" },
  { id: "quick", label: "Fljótlegur matur", icon: "⏱️" },
  { id: "family", label: "Fjölskyldumatur", icon: "👨‍👩‍👧" },
];

const PEOPLE_OPTIONS = [
  { id: 1, label: "1 manneskja" },
  { id: 2, label: "2 manneskjur" },
  { id: 4, label: "Fjölskylda (3–5 manns)" },
];

const DAY_OPTIONS = [3, 5, 7];

const DAY_NAMES = ["Mánudagur", "Þriðjudagur", "Miðvikudagur", "Fimmtudagur", "Föstudagur", "Laugardagur", "Sunnudagur"];
const STEP_LABELS = ["Markmið", "Verslun", "Kostnaður", "Fólk", "Dagar", "Til heima", "Forðast"];

const PANTRY_SUGGESTIONS = ["oats", "rice", "pasta", "eggs", "chicken_breast", "tuna", "oil", "milk", "oatmilk", "garlic", "onion"];
const FOOD_DISLIKES_STORAGE_KEY = "matval.foodDislikes.v1";
const SAVED_PLANS_STORAGE_KEY = "matval.savedPlans.v1";
const AVOID_FOOD_SUGGESTIONS = [
  "Hnetur",
  "Jarðhnetur",
  "Trjáhnetur",
  "Möndlur",
  "Cashew",
  "Mjólk",
  "Egg",
  "Fiskur",
  "Skelfiskur",
  "Gluten",
  "Hveiti",
  "Soja",
  "Sesam",
  "Tófú",
  "Sveppir",
  "Ólífur",
  "Kóríander",
  "Túnfiskur",
  "Lax",
  "Baunir",
  "Skyr",
  "Kotasæla",
];
const AVOID_QUICK_CHIPS = [
  "Mjólk",
  "Egg",
  "Hnetur",
  "Jarðhnetur",
  "Gluten",
  "Soja",
  "Fiskur",
  "Skelfiskur",
  "Sesam",
];
const AVOID_ALIAS_GROUPS = {
  Hnetur: ["hnetur", "trjáhnetur", "möndlur", "cashew", "valhnetur", "heslihnetur", "hnetusmjör"],
  Mjólk: ["mjólk", "ostur", "skyr", "jógúrt", "rjómi", "smjör", "kotasæla"],
  Egg: ["egg"],
  Gluten: ["hveiti", "brauð", "pasta", "núðlur", "tortilla"],
  Fiskur: ["fiskur", "lax", "túnfiskur", "ýsa", "þorskur"],
  Skelfiskur: ["rækjur", "humar", "skelfiskur"],
  Soja: ["soja", "sojasósa", "tófú"],
};
const FOOD_DISLIKE_OPTIONS = [
  { id: "nuts", label: "Hnetur" },
  { id: "peanuts", label: "Jarðhnetur", matchWords: ["jarðhnetur", "peanuts", "hnetusmjör"] },
  { id: "tree_nuts", label: "Trjáhnetur", matchWords: ["trjáhnetur", "möndlur", "cashew", "valhnetur"] },
  { id: "almonds", label: "Möndlur", matchWords: ["möndlur", "almonds"] },
  { id: "cashew", label: "Cashew", matchWords: ["cashew"] },
  { id: "milk", label: "Mjólk" },
  { id: "eggs", label: "Egg", ingredientKeys: ["eggs"] },
  { id: "fish", label: "Fiskur" },
  { id: "shellfish", label: "Skelfiskur" },
  { id: "gluten", label: "Gluten" },
  { id: "wheat", label: "Hveiti", matchWords: ["hveiti", "wheat"] },
  { id: "soy", label: "Soja" },
  { id: "sesame", label: "Sesam", matchWords: ["sesam", "sesame"] },
  { id: "tofu", label: "Tófú", ingredientKeys: ["tofu"] },
  { id: "olives", label: "Ólífur", ingredientKeys: [], matchWords: ["ólífur", "olives"] },
  { id: "mushrooms", label: "Sveppir", ingredientKeys: [], matchWords: ["sveppir", "mushrooms"] },
  { id: "coriander", label: "Kóríander", ingredientKeys: [], matchWords: ["kóríander", "coriander"] },
  { id: "tuna", label: "Túnfiskur", ingredientKeys: ["tuna"] },
  { id: "salmon", label: "Lax", ingredientKeys: ["salmon"] },
  { id: "beans", label: "Baunir", ingredientKeys: ["lentils", "chickpeas", "black_beans", "kidney_beans"] },
  { id: "cottage_cheese", label: "Kotasæla", ingredientKeys: ["cottage_cheese"] },
  { id: "skyr", label: "Skyr", ingredientKeys: ["yogurt_skyr"] },
];

const state = {
  step: 0, // 0..6 quiz, 7 = results, 8 = saved plans
  goals: [],
  store: "kronan",
  budget: 18000,
  people: 2,
  days: 5,
  pantry: [],
  foodDislikes: loadFoodDislikes(),
  plan: null,
  pricingStatus: "idle",
  pricingError: null,
  traceId: null,
};

const fmt = (n) => Math.round(n).toLocaleString("is-IS") + " kr";
const pricingRequest = { id: 0 };
const PLAN_ERROR_MESSAGE = "Ekki tókst að búa til plan með þessum skilyrðum. Prófaðu hærra budget eða færri takmarkanir.";
const IS_BROWSER = typeof window !== "undefined" && typeof document !== "undefined";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createTraceId() {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clearInteractionState() {
  if (!IS_BROWSER) return;
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function scrollToPageTop() {
  if (!IS_BROWSER) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

if (typeof window !== "undefined" && window.history && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function navigateToStep(step) {
  state.step = step;
  render();
  scrollToPageTop();
}

// ---------- Plan generation ----------

function loadFoodDislikes() {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FOOD_DISLIKES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? normalizeAvoidSelections(parsed) : [];
  } catch (error) {
    console.warn("[Food dislikes] could not read local preferences:", error);
    return [];
  }
}

function saveFoodDislikes() {
  if (typeof localStorage === "undefined") return;
  state.foodDislikes = normalizeAvoidSelections(state.foodDislikes);
  localStorage.setItem(FOOD_DISLIKES_STORAGE_KEY, JSON.stringify(state.foodDislikes));
}

function normalizeFoodText(value) {
  return String(value || "")
    .toLocaleLowerCase("is-IS")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9þæðöüø\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function avoidOptionForValue(value) {
  const normalized = normalizeFoodText(value);
  return FOOD_DISLIKE_OPTIONS.find((option) => (
    option.id === value
    || normalizeFoodText(option.label) === normalized
    || normalizeFoodText(option.id) === normalized
  ));
}

function avoidLabel(value) {
  const option = avoidOptionForValue(value);
  return option ? option.label : String(value || "").trim();
}

function normalizeAvoidSelections(values) {
  const seen = new Set();
  return values
    .map((value) => avoidLabel(value))
    .filter(Boolean)
    .filter((label) => {
      const key = normalizeFoodText(label);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function selectedDislikeOptions(dislikes = state.foodDislikes) {
  return normalizeAvoidSelections(dislikes).map((value) => {
    const option = avoidOptionForValue(value);
    return option || { id: normalizeFoodText(value), label: value };
  });
}

function avoidAliasesForSelection(value) {
  const option = avoidOptionForValue(value);
  const label = option ? option.label : String(value || "").trim();
  const aliases = [
    label,
    ...(AVOID_ALIAS_GROUPS[label] || []),
    ...(option?.matchWords || []),
  ];
  return [...new Set(aliases.map(normalizeFoodText).filter(Boolean))];
}

function foodTextContainsAvoidAlias(text, alias) {
  if (!text || !alias) return false;
  if (alias.includes(" ")) return text.includes(alias);
  return text.split(" ").includes(alias);
}

function foodTextMatchesDislikes(text, dislikes = state.foodDislikes) {
  const normalizedText = normalizeFoodText(text);
  return selectedDislikeOptions(dislikes).some((option) => (
    avoidAliasesForSelection(option.label).some((alias) => foodTextContainsAvoidAlias(normalizedText, alias))
  ));
}

function ingredientMatchesDislikes(key, dislikes = state.foodDislikes) {
  const product = PRODUCTS[key];
  const productText = normalizeFoodText(`${key} ${product ? product.name : ""} ${product ? product.unit : ""}`);
  return selectedDislikeOptions(dislikes).some((option) => {
    if ((option.ingredientKeys || []).includes(key)) return true;
    return foodTextMatchesDislikes(productText, [option.label]);
  });
}

function shoppingItemMatchesDislikes(item, dislikes = state.foodDislikes) {
  if (item.key && ingredientMatchesDislikes(item.key, dislikes)) return true;
  return foodTextMatchesDislikes([
    item.ingredientName,
    item.matchedProductName,
    item.productName,
    item.nameFromStore,
    item.name,
  ].filter(Boolean).join(" "), dislikes);
}

function recipeContainsDislikedFood(recipe, dislikes = state.foodDislikes) {
  return recipe.ingredients.some((ing) => ingredientMatchesDislikes(ing.key, dislikes));
}

function selectedGoal(goals, ...ids) {
  return ids.some((id) => goals.includes(id));
}

function recipeMatchesGoals(recipe, goals) {
  if (goals.length === 0) return 1;
  let score = 0;
  goals.forEach((g) => {
    if ((g === "weight_loss" || g === "weightloss") && (recipe.tags.includes("weight_loss") || recipe.tags.includes("healthy") || recipe.calories <= 450)) score += 1;
    else if ((g === "muscle_gain" || g === "muscle") && (recipe.tags.includes("muscle_gain") || recipe.protein >= 25)) score += 1;
    else if ((g === "high_protein" || g === "protein") && (recipe.tags.includes("high_protein") || recipe.tags.includes("protein"))) score += 1;
    else if ((g === "dairy_free" || g === "dairyfree") && (recipe.tags.includes("dairy_free") || recipe.tags.includes("dairyfree"))) score += 1;
    else if (recipe.tags.includes(g)) score += 1;
  });
  return score;
}

function recipePrice(recipe, servingsNeeded) {
  const multiplier = servingsNeeded / recipe.servingsBase;
  let total = 0;
  recipe.ingredients.forEach((ing) => {
    const product = PRODUCTS[ing.key];
    total += product.price * ing.amount * multiplier;
  });
  return total;
}

function ownedIngredientCoverage(recipe, pantry) {
  if (pantry.length === 0) return 0;
  let matches = 0;
  recipe.ingredients.forEach((ing) => {
    if (pantry.includes(ing.key)) matches++;
  });
  return matches;
}

const MEAL_SLOT_CONFIG = {
  morgunmatur: { scoreKey: "breakfastScore", fallbackType: "morgunmatur" },
  hádegismatur: { scoreKey: "lunchScore", fallbackType: "hádegismatur" },
  kvöldmatur: { scoreKey: "dinnerScore", fallbackType: "kvöldmatur" },
};

function recipeSlotScore(recipe, slot) {
  const config = MEAL_SLOT_CONFIG[slot];
  if (!config) return 0;
  const explicitScore = Number(recipe[config.scoreKey]);
  if (Number.isFinite(explicitScore)) return explicitScore;
  return recipe.type === config.fallbackType ? 60 : 0;
}

function scoreRecipeForSlot(recipe, slot, goals, pantry, people) {
  const slotScore = recipeSlotScore(recipe, slot);
  const goalScore = recipeMatchesGoals(recipe, goals) * 25;
  const pantryScore = ownedIngredientCoverage(recipe, pantry) * 5;
  const price = recipePrice(recipe, people);
  const dinnerSizeScore = slot === "kvöldmatur" ? Math.min(recipe.calories / 20, 35) : 0;
  const lunchEaseScore = slot === "hádegismatur" && recipe.time <= 20 ? 15 : 0;
  const breakfastEaseScore = slot === "morgunmatur" && recipe.time <= 10 ? 15 : 0;
  return {
    recipe,
    score: slotScore + goalScore + pantryScore + dinnerSizeScore + lunchEaseScore + breakfastEaseScore,
    slotScore,
    price,
  };
}

function sortRecipesForSlot(recipes, slot, goals, pantry, people) {
  return recipes
    .map((recipe) => scoreRecipeForSlot(recipe, slot, goals, pantry, people))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.slotScore !== a.slotScore) return b.slotScore - a.slotScore;
      return a.price - b.price;
    })
    .map((entry) => entry.recipe);
}

function chooseRecipeForSlot(recipes, slot, usageCounts, blockedIds = new Set()) {
  const minSlotScore = slot === "morgunmatur" ? 45 : slot === "hádegismatur" ? 35 : 45;
  const preferred = recipes.find((recipe) => {
    const used = usageCounts[recipe.id] || 0;
    return used < 2 && !blockedIds.has(recipe.id) && recipeSlotScore(recipe, slot) >= minSlotScore;
  });
  return preferred
    || recipes.find((recipe) => (usageCounts[recipe.id] || 0) < 2 && !blockedIds.has(recipe.id))
    || recipes.find((recipe) => !blockedIds.has(recipe.id))
    || null;
}

function markRecipeUsed(recipe, usageCounts) {
  usageCounts[recipe.id] = (usageCounts[recipe.id] || 0) + 1;
}

function buildWeeklyStructure(goals, days) {
  const vegan = selectedGoal(goals, "vegan");
  const vegetarian = selectedGoal(goals, "vegetarian");
  const cheap = selectedGoal(goals, "cheap");
  const highProtein = selectedGoal(goals, "high_protein", "protein", "muscle_gain");
  const quick = selectedGoal(goals, "quick");

  const targets = {
    fishMeals: vegan || vegetarian ? 0 : days >= 5 ? 1 : 0,
    chickenMeals: vegan || vegetarian ? 0 : highProtein ? Math.min(2, days) : days >= 5 ? 1 : 0,
    vegetarianMeals: vegan || vegetarian ? days : Math.max(1, Math.round(days * (cheap ? 0.45 : 0.3))),
    leftoverLunches: days >= 5 ? (cheap || quick ? 2 : 1) : days >= 3 ? 1 : 0,
  };

  return {
    breakfastStrategy: vegan
      ? ["oats", "oatmilk", "fruit", "peanut_butter"]
      : ["oats", "eggs", "toast", "skyr", "fruit"],
    lunchStrategy: quick
      ? ["leftovers", "wraps", "bowls", "sandwiches"]
      : ["leftovers", "rice bowls", "soups", "wraps"],
    dinnerStrategy: highProtein
      ? ["cooked mains", "chicken", "fish", "tofu", "rice dishes"]
      : ["cooked mains", "pasta", "curries", "chili", "stir fry"],
    leftoverStrategy: ["cook dinner once", "eat leftovers for lunch next day"],
    targets,
  };
}

function candidateRecipesForSlot(recipes, slot) {
  if (slot === "morgunmatur") {
    return recipes.filter((recipe) => (
      recipe.mealRole !== "dinner"
      && recipe.breakfastScore >= 55
      && recipe.dinnerScore <= recipe.breakfastScore + 25
    ));
  }

  if (slot === "hádegismatur") {
    return recipes.filter((recipe) => (
      recipe.mealRole !== "breakfast"
      && (
        recipe.lunchScore >= 35
        || (recipe.time <= 25 && recipe.dinnerScore <= 115)
      )
    ));
  }

  return recipes.filter((recipe) => (
    recipe.mealRole !== "breakfast"
    && recipe.dinnerScore >= 65
  ));
}

function deterministicJitter(recipe, attempt, dayIndex, slot) {
  const text = `${recipe.id}:${attempt}:${dayIndex}:${slot}`;
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 997;
  return (hash % 37) / 10;
}

function currentProteinStreak(proteinHistory, protein) {
  if (!protein) return 0;
  let streak = 0;
  for (let i = proteinHistory.length - 1; i >= 0; i--) {
    if (proteinHistory[i] !== protein) break;
    streak++;
  }
  return streak;
}

function selectWeeklyRecipe(candidates, slot, context, structure, options = {}) {
  const available = candidates.filter((recipe) => !options.blockedIds || !options.blockedIds.has(recipe.id));
  const underRepeatLimit = available.filter((recipe) => (context.recipeCounts[recipe.id] || 0) < 2);
  const selectionPool = underRepeatLimit.length ? underRepeatLimit : available;
  const scored = selectionPool
    .map((recipe) => {
      const used = context.recipeCounts[recipe.id] || 0;
      const protein = recipe.primaryProtein || "none";
      const proteinStreak = currentProteinStreak(context.proteinHistory, protein);
      let score = scoreRecipeForSlot(recipe, slot, context.goals, context.pantry, context.people).score;

      if ((context.avoidRecipeIds || []).includes(recipe.id)) score -= 140;
      score -= used * 45;
      if (used >= 2) score -= 240;
      if (protein !== "none" && proteinStreak >= 2) score -= proteinStreak * 25;
      if (recipe.isBeanHeavy && context.beanStreak >= 2) score -= context.beanStreak * 45;
      if (!selectedGoal(context.goals, "vegan") && recipe.tags.includes("vegan")) score -= 12;

      if (slot === "hádegismatur" && recipe.time <= 20) score += 15;
      if (slot === "kvöldmatur" && recipe.leftoverFriendly && context.leftoverLunches < structure.targets.leftoverLunches) score += 35;
      if (slot === "kvöldmatur" && recipe.isFishMeal && context.fishMeals < structure.targets.fishMeals) score += 45;
      if (slot === "kvöldmatur" && recipe.isChickenMeal && context.chickenMeals < structure.targets.chickenMeals) score += 45;
      if (slot === "kvöldmatur" && recipe.isVegetarianMeal && context.vegetarianMeals < structure.targets.vegetarianMeals) score += 25;

      score += deterministicJitter(recipe, context.attempt, context.dayIndex, slot);
      return { recipe, score };
    })
    .sort((a, b) => b.score - a.score);

  const pickWindow = Math.min(4, scored.length);
  if (!pickWindow) return null;
  const index = Math.floor((context.attempt + context.dayIndex + slot.length) % pickWindow);
  return scored[index].recipe;
}

function addMealToContext(recipe, context, slot, isLeftover = false) {
  context.recipeCounts[recipe.id] = (context.recipeCounts[recipe.id] || 0) + 1;
  const protein = recipe.primaryProtein || "none";
  context.proteinHistory.push(protein);
  context.beanStreak = recipe.isBeanHeavy ? context.beanStreak + 1 : 0;
  if (slot === "hádegismatur" && isLeftover) context.leftoverLunches++;
  if (slot === "kvöldmatur") {
    if (recipe.isFishMeal) context.fishMeals++;
    if (recipe.isChickenMeal) context.chickenMeals++;
    if (recipe.isVegetarianMeal) context.vegetarianMeals++;
  }
}

function buildCandidateWeek(structure, pools, options) {
  const context = {
    attempt: options.attempt,
    goals: options.goals,
    pantry: options.pantry,
    people: options.people,
    dayIndex: 0,
    recipeCounts: {},
    proteinHistory: [],
    beanStreak: 0,
    fishMeals: 0,
    chickenMeals: 0,
    vegetarianMeals: 0,
    leftoverLunches: 0,
    avoidRecipeIds: options.avoidRecipeIds || [],
  };
  const planDays = [];
  const leftoverMap = {};

  for (let i = 0; i < options.days; i++) {
    context.dayIndex = i;
    const dayMeals = {};

    const breakfast = selectWeeklyRecipe(pools.morgunmatur, "morgunmatur", context, structure);
    if (!breakfast) return null;
    dayMeals.morgunmatur = { recipe: breakfast, leftover: false };
    addMealToContext(breakfast, context, "morgunmatur");

    if (leftoverMap[i] && context.leftoverLunches < structure.targets.leftoverLunches && (context.recipeCounts[leftoverMap[i].id] || 0) < 2) {
      dayMeals.hádegismatur = {
        recipe: leftoverMap[i],
        leftover: true,
        fromDinner: true,
        sourceRecipeId: leftoverMap[i].usesLeftovers || leftoverMap[i].id,
      };
      addMealToContext(leftoverMap[i], context, "hádegismatur", true);
    } else {
      const lunch = selectWeeklyRecipe(pools.hádegismatur, "hádegismatur", context, structure, {
        blockedIds: new Set([breakfast.id]),
      });
      if (!lunch) return null;
      dayMeals.hádegismatur = { recipe: lunch, leftover: false };
      addMealToContext(lunch, context, "hádegismatur");
    }

    const dinner = selectWeeklyRecipe(pools.kvöldmatur, "kvöldmatur", context, structure, {
      blockedIds: new Set([breakfast.id, dayMeals.hádegismatur.recipe.id]),
    });
    if (!dinner) return null;
    dayMeals.kvöldmatur = { recipe: dinner, leftover: false };
    addMealToContext(dinner, context, "kvöldmatur");

    if (dinner.leftoverFriendly && i + 1 < options.days && context.leftoverLunches < structure.targets.leftoverLunches) {
      leftoverMap[i + 1] = linkedLeftoverRecipe(dinner, options.leftoverRecipes || []) || dinner;
    }

    planDays.push(dayMeals);
  }

  return planDays;
}

function scoreWholeWeek(planDays, structure, goals, people, pantry, budget) {
  const recipeCounts = {};
  const proteinHistory = [];
  let score = 0;
  let beanStreak = 0;
  let veganMeals = 0;
  let fishMeals = 0;
  let chickenMeals = 0;
  let vegetarianMeals = 0;
  let leftoverLunches = 0;
  let beanHeavyDinners = 0;
  let riceBasedDinners = 0;
  let pastaDinners = 0;
  let bowlStyleDinners = 0;

  planDays.forEach((day) => {
    [
      ["morgunmatur", day.morgunmatur],
      ["hádegismatur", day.hádegismatur],
      ["kvöldmatur", day.kvöldmatur],
    ].forEach(([slot, meal]) => {
      const recipe = meal.recipe;
      recipeCounts[recipe.id] = (recipeCounts[recipe.id] || 0) + 1;
      score += recipeSlotScore(recipe, slot);
      score += recipeMatchesGoals(recipe, goals) * 18;
      score += ownedIngredientCoverage(recipe, pantry) * 4;

      if (slot === "morgunmatur") {
        if (recipe.mealRole === "dinner" || recipe.dinnerScore > recipe.breakfastScore + 35) score -= 260;
        if (recipe.breakfastScore < 55) score -= 120;
      }
      if (slot === "hádegismatur") {
        if (meal.leftover && meal.fromDinner) score += 70;
        if (!meal.leftover && recipe.time <= 20) score += 20;
        if (!meal.leftover && recipe.dinnerScore > recipe.lunchScore + 45) score -= 45;
      }
      if (slot === "kvöldmatur") {
        if (recipe.dinnerScore < 65) score -= 90;
        score += Math.min(recipe.calories / 18, 40);
        if (recipe.protein >= 25) score += 20;
        if (recipe.isBeanHeavy) beanHeavyDinners++;
        if (recipe.isRiceBased) riceBasedDinners++;
        if (recipe.isPastaBased) pastaDinners++;
        if (recipe.isBowlStyle) bowlStyleDinners++;
      }

      if (recipe.tags.includes("vegan")) veganMeals++;
      if (recipe.isFishMeal) fishMeals++;
      if (recipe.isChickenMeal) chickenMeals++;
      if (recipe.isVegetarianMeal) vegetarianMeals++;
      if (recipe.isBeanHeavy) {
        beanStreak++;
        if (beanStreak > 2) score -= beanStreak * 45;
      } else {
        beanStreak = 0;
      }

      const protein = recipe.primaryProtein || "none";
      proteinHistory.push(protein);
      const streak = currentProteinStreak(proteinHistory.slice(0, -1), protein) + 1;
      if (protein !== "none" && streak > 4) score -= (streak - 4) * 80;
    });

    if (day.hádegismatur.leftover && day.hádegismatur.fromDinner) leftoverLunches++;
  });

  Object.values(recipeCounts).forEach((count) => {
    if (count > 2) score -= (count - 2) * 95;
  });

  const totalMeals = planDays.length * 3;
  if (!selectedGoal(goals, "vegan")) {
    const veganLimit = Math.ceil(totalMeals * 0.45);
    if (veganMeals > veganLimit) score -= (veganMeals - veganLimit) * 28;
  }

  score -= Math.abs(fishMeals - structure.targets.fishMeals) * 45;
  score -= Math.abs(chickenMeals - structure.targets.chickenMeals) * 45;
  if (vegetarianMeals < structure.targets.vegetarianMeals) score -= (structure.targets.vegetarianMeals - vegetarianMeals) * 35;
  if (leftoverLunches < structure.targets.leftoverLunches) score -= (structure.targets.leftoverLunches - leftoverLunches) * 70;
  if (beanHeavyDinners > 2) score -= (beanHeavyDinners - 2) * 110;
  if (riceBasedDinners > 3) score -= (riceBasedDinners - 3) * 90;
  if (pastaDinners > 2) score -= (pastaDinners - 2) * 90;
  if (bowlStyleDinners > 2) score -= (bowlStyleDinners - 2) * 90;

  const localCost = estimateShoppingList(planDays, people, pantry).totalPrice;
  if (budget && localCost > budget) score -= Math.min((localCost - budget) / 100, 120);
  if (selectedGoal(goals, "cheap") && budget && localCost <= budget) score += 35;

  return score;
}

function estimateShoppingList(planDays, people, pantry) {
  const aggregate = {};
  const dinnerLeftoverIds = new Set();

  planDays.forEach((day) => {
    if (day.hádegismatur && day.hádegismatur.fromDinner) {
      dinnerLeftoverIds.add(day.hádegismatur.sourceRecipeId || day.hádegismatur.recipe.id);
    }
  });

  planDays.forEach((day) => {
    Object.values(day).forEach(({ recipe, leftover, fromDinner }) => {
      const multiplier = people / recipe.servingsBase;
      if (leftover && fromDinner && !recipe.usesLeftovers) return;

      recipe.ingredients.forEach((ing) => {
        let amount = ing.amount * multiplier;
        if (recipe.doubleBatch && dinnerLeftoverIds.has(recipe.id)) amount *= 2;
        aggregate[ing.key] = (aggregate[ing.key] || 0) + amount;
      });
    });
  });

  const shoppingList = [];
  let totalPrice = 0;
  Object.entries(aggregate).forEach(([key, amount]) => {
    const product = PRODUCTS[key];
    if (!product || pantry.includes(key)) return;
    if (ingredientMatchesDislikes(key)) return;
    const price = product.price * amount;
    totalPrice += price;
    shoppingList.push({
      key,
      name: product.name,
      ingredientName: product.name,
      matchedProductName: null,
      sku: null,
      unit: product.unit,
      amount,
      price,
      mockPrice: price,
      unitPrice: product.price,
      totalPrice: price,
      packageSize: null,
      packageCount: null,
      image: null,
      sourceLabel: "Áætlað verð",
      estimated: true,
      isEstimated: true,
      kronanProduct: null,
    });
  });

  shoppingList.sort((a, b) => b.price - a.price);
  return { shoppingList, totalPrice };
}

function nutritionTotals(planDays) {
  return planDays.reduce((totals, day) => {
    Object.values(day).forEach(({ recipe }) => {
      totals.calories += recipe.calories;
      totals.protein += recipe.protein;
    });
    return totals;
  }, { calories: 0, protein: 0 });
}

function countRecipesInPlan(plan) {
  const counts = {};
  plan.days.forEach((day) => {
    Object.values(day).forEach(({ recipe }) => {
      counts[recipe.id] = (counts[recipe.id] || 0) + 1;
    });
  });
  return counts;
}

function replacementPoolForSlot(slot, plan, dayIndex) {
  const previousDinner = dayIndex > 0 ? plan.days[dayIndex - 1].kvöldmatur.recipe : null;
  return RECIPES.filter((recipe) => {
    if (recipe.usesLeftovers) {
      return slot === "hádegismatur" && previousDinner && recipe.usesLeftovers === previousDinner.id;
    }
    return candidateRecipesForSlot([recipe], slot).length > 0;
  });
}

function replacementScore(candidate, currentRecipe, slot, goals, pantry, people) {
  const candidatePrice = recipePrice(candidate, people);
  const currentPrice = recipePrice(currentRecipe, people);
  let score = scoreRecipeForSlot(candidate, slot, goals, pantry, people).score;

  score -= Math.abs(candidate.calories - currentRecipe.calories) / 8;
  score -= Math.abs(candidate.protein - currentRecipe.protein) * 1.8;
  score -= Math.abs(candidatePrice - currentPrice) / 120;

  if (candidate.primaryProtein && candidate.primaryProtein === currentRecipe.primaryProtein) score += 26;
  else if (candidate.protein >= currentRecipe.protein - 5 && candidate.protein <= currentRecipe.protein + 8) score += 10;

  if (candidate.primaryCarb && candidate.primaryCarb === currentRecipe.primaryCarb) score += 8;
  if (candidate.mealRole === currentRecipe.mealRole) score += 10;
  if (candidate.isBeanHeavy === currentRecipe.isBeanHeavy) score += 4;
  if (candidate.isPastaBased === currentRecipe.isPastaBased) score += 3;
  if (candidate.isRiceBased === currentRecipe.isRiceBased) score += 3;
  if (candidate.isBowlStyle === currentRecipe.isBowlStyle) score += 3;

  return score;
}

function findReplacementRecipe(plan, dayIndex, slot) {
  const meal = plan.days[dayIndex][slot];
  const currentRecipe = meal.recipe;
  const recipeCounts = countRecipesInPlan(plan);
  const replacedRecipeIds = new Set(plan.replacedRecipeIds || []);
  const pool = replacementPoolForSlot(slot, plan, dayIndex)
    .filter((recipe) => recipe.id !== currentRecipe.id)
    .filter((recipe) => !replacedRecipeIds.has(recipe.id))
    .filter((recipe) => leftoverRecipeAllowedForGoals(recipe, state.goals))
    .filter((recipe) => (recipeCounts[recipe.id] || 0) < 2);

  const fallbackPool = replacementPoolForSlot(slot, plan, dayIndex)
    .filter((recipe) => recipe.id !== currentRecipe.id)
    .filter((recipe) => !replacedRecipeIds.has(recipe.id))
    .filter((recipe) => leftoverRecipeAllowedForGoals(recipe, state.goals));

  const candidates = (pool.length ? pool : fallbackPool)
    .map((recipe) => ({
      recipe,
      score: replacementScore(recipe, currentRecipe, slot, state.goals, state.pantry, state.people),
    }))
    .sort((a, b) => b.score - a.score);

  console.log("[Meal replacement] candidates", {
    dayIndex,
    slot,
    currentRecipe: currentRecipe.id,
    candidates: candidates.slice(0, 8).map((candidate) => ({
      id: candidate.recipe.id,
      score: Math.round(candidate.score),
      calories: candidate.recipe.calories,
      protein: candidate.recipe.protein,
      price: Math.round(recipePrice(candidate.recipe, state.people)),
    })),
  });

  return candidates[0] ? candidates[0].recipe : null;
}

function refreshPlanTotals(plan) {
  const { shoppingList, totalPrice } = estimateShoppingList(plan.days, plan.people, state.pantry);
  plan.shoppingList = shoppingList;
  plan.totalPrice = totalPrice;
  plan.nutritionTotals = nutritionTotals(plan.days);
  console.log("[Meal replacement] recalculated plan", {
    totalPrice: plan.totalPrice,
    nutritionTotals: plan.nutritionTotals,
    shoppingListItems: plan.shoppingList.length,
  });
}

function replaceMeal(dayIndex, slot) {
  const plan = state.plan;
  if (!plan || plan.error || !plan.days[dayIndex] || !plan.days[dayIndex][slot]) return;

  const currentMeal = plan.days[dayIndex][slot];
  const currentRecipe = currentMeal.recipe;
  const replacement = findReplacementRecipe(plan, dayIndex, slot);
  if (!replacement) {
    console.warn("[Meal replacement] no replacement found", { dayIndex, slot, currentRecipe: currentRecipe.id });
    return;
  }

  plan.replacedRecipeIds = [...new Set([...(plan.replacedRecipeIds || []), currentRecipe.id])];
  plan.days[dayIndex][slot] = {
    recipe: replacement,
    leftover: Boolean(replacement.usesLeftovers),
    fromDinner: Boolean(replacement.usesLeftovers),
    sourceRecipeId: replacement.usesLeftovers || null,
  };

  if (slot === "kvöldmatur" && plan.days[dayIndex + 1]?.hádegismatur?.sourceRecipeId === currentRecipe.id) {
    plan.days[dayIndex + 1].hádegismatur = {
      ...plan.days[dayIndex + 1].hádegismatur,
      leftover: false,
      fromDinner: false,
      sourceRecipeId: null,
    };
  }

  refreshPlanTotals(plan);
  state.pricingStatus = "idle";
  state.pricingError = null;
  renderResults();
  hydrateKronanPrices(plan);
}

function ingredientAllowedForGoals(key, goals) {
  const meta = INGREDIENT_META[key];
  if (!meta) return false;

  if (selectedGoal(goals, "vegan") && !meta.isVegan) return false;
  if (selectedGoal(goals, "vegetarian") && (!meta.isVegetarian || meta.containsMeat || meta.containsFish)) return false;
  if (selectedGoal(goals, "dairy_free", "dairyfree") && meta.containsDairy) return false;
  return true;
}

function recipeAllowedForGoals(recipe, goals) {
  if (selectedGoal(goals, "vegan") && !recipe.tags.includes("vegan")) return false;
  if (selectedGoal(goals, "vegetarian") && !(recipe.tags.includes("vegetarian") || recipe.tags.includes("vegan"))) return false;
  if (selectedGoal(goals, "dairy_free", "dairyfree") && !(recipe.tags.includes("dairy_free") || recipe.tags.includes("dairyfree"))) return false;
  if (recipeContainsDislikedFood(recipe)) return false;

  return recipe.ingredients.every((ing) => ingredientAllowedForGoals(ing.key, goals));
}

function leftoverRecipeAllowedForGoals(recipe, goals) {
  if (!recipeAllowedForGoals(recipe, goals)) return false;
  if (!recipe.usesLeftovers) return true;
  const sourceRecipe = RECIPES.find((candidate) => candidate.id === recipe.usesLeftovers);
  return sourceRecipe ? recipeAllowedForGoals(sourceRecipe, goals) : false;
}

function linkedLeftoverRecipe(sourceRecipe, leftoverRecipes) {
  return leftoverRecipes.find((recipe) => recipe.usesLeftovers === sourceRecipe.id) || null;
}

function plannerStatsForRecipes() {
  const selectableRecipes = RECIPES.filter((recipe) => !recipe.usesLeftovers);
  const uniqueProteins = new Set(selectableRecipes.map((recipe) => recipe.primaryProtein).filter(Boolean));
  const uniqueCarbs = new Set(selectableRecipes.map((recipe) => recipe.primaryCarb).filter(Boolean));
  return {
    recipeCount: RECIPES.length,
    breakfastRecipeCount: RECIPES.filter((recipe) => recipe.mealRole === "breakfast").length,
    lunchRecipeCount: RECIPES.filter((recipe) => recipe.mealRole === "lunch").length,
    dinnerRecipeCount: RECIPES.filter((recipe) => recipe.mealRole === "dinner").length,
    flexibleRecipeCount: RECIPES.filter((recipe) => recipe.mealRole === "flexible").length,
    uniqueProteinsUsed: [...uniqueProteins],
    uniqueCarbsUsed: [...uniqueCarbs],
  };
}

function loadSavedPlans() {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_PLANS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[Saved plans] could not read saved plans:", error);
    return [];
  }
}

function writeSavedPlans(plans) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SAVED_PLANS_STORAGE_KEY, JSON.stringify(plans));
}

function recipeIdsInPlanSnapshot(savedPlan) {
  return (savedPlan.meals || []).flatMap((day) => (
    Object.values(day).map((meal) => meal.recipeId).filter(Boolean)
  ));
}

function createPlanSnapshot(plan) {
  const now = new Date().toISOString();
  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    title: `${plan.numDays} daga plan`,
    goals: [...state.goals],
    dietarySettings: state.goals.filter((goal) => ["vegan", "vegetarian", "dairy_free"].includes(goal)),
    pantry: [...state.pantry],
    dislikes: normalizeAvoidSelections(state.foodDislikes),
    store: state.store,
    budget: state.budget,
    people: plan.people,
    days: plan.numDays,
    totalCost: plan.totalPrice,
    shoppingList: plan.shoppingList,
    nutritionTotals: plan.nutritionTotals || nutritionTotals(plan.days),
    meals: plan.days.map((day) => ({
      morgunmatur: {
        recipeId: day.morgunmatur.recipe.id,
        leftover: Boolean(day.morgunmatur.leftover),
        fromDinner: Boolean(day.morgunmatur.fromDinner),
        sourceRecipeId: day.morgunmatur.sourceRecipeId || null,
      },
      hádegismatur: {
        recipeId: day.hádegismatur.recipe.id,
        leftover: Boolean(day.hádegismatur.leftover),
        fromDinner: Boolean(day.hádegismatur.fromDinner),
        sourceRecipeId: day.hádegismatur.sourceRecipeId || null,
      },
      kvöldmatur: {
        recipeId: day.kvöldmatur.recipe.id,
        leftover: Boolean(day.kvöldmatur.leftover),
        fromDinner: Boolean(day.kvöldmatur.fromDinner),
        sourceRecipeId: day.kvöldmatur.sourceRecipeId || null,
      },
    })),
  };
}

function hydrateSavedPlan(savedPlan) {
  const days = (savedPlan.meals || []).map((day) => {
    const hydratedDay = {};
    ["morgunmatur", "hádegismatur", "kvöldmatur"].forEach((slot) => {
      const meal = day[slot];
      const recipe = meal && RECIPES.find((candidate) => candidate.id === meal.recipeId);
      if (recipe) {
        hydratedDay[slot] = {
          recipe,
          leftover: Boolean(meal.leftover),
          fromDinner: Boolean(meal.fromDinner),
          sourceRecipeId: meal.sourceRecipeId || null,
        };
      }
    });
    return hydratedDay;
  }).filter((day) => day.morgunmatur && day.hádegismatur && day.kvöldmatur);

  return {
    days,
    shoppingList: savedPlan.shoppingList || [],
    totalPrice: Number(savedPlan.totalCost || 0),
    people: savedPlan.people || 2,
    numDays: savedPlan.days || days.length,
    weeklyStructure: null,
    weeklyScore: null,
    replacedRecipeIds: [],
    nutritionTotals: savedPlan.nutritionTotals || nutritionTotals(days),
    savedPlanId: savedPlan.id,
  };
}

function saveCurrentPlan() {
  if (!state.plan || state.plan.error) return null;
  const snapshot = createPlanSnapshot(state.plan);
  const savedPlans = loadSavedPlans();
  writeSavedPlans([snapshot, ...savedPlans]);
  console.log("[Saved plans] saved", snapshot);
  return snapshot;
}

function openSavedPlan(savedPlanId) {
  const savedPlan = loadSavedPlans().find((plan) => plan.id === savedPlanId);
  if (!savedPlan) return;
  state.goals = [...(savedPlan.goals || [])];
  state.pantry = [...(savedPlan.pantry || [])];
  state.foodDislikes = normalizeAvoidSelections(savedPlan.dislikes || []);
  saveFoodDislikes();
  state.store = savedPlan.store || "kronan";
  state.budget = savedPlan.budget || state.budget;
  state.people = savedPlan.people || state.people;
  state.days = savedPlan.days || state.days;
  state.plan = hydrateSavedPlan(savedPlan);
  state.step = 7;
  state.pricingStatus = "idle";
  state.pricingError = null;
  render();
  scrollToPageTop();
}

function duplicateSavedPlan(savedPlanId) {
  const savedPlan = loadSavedPlans().find((plan) => plan.id === savedPlanId);
  if (!savedPlan) return;
  const now = new Date().toISOString();
  const duplicate = {
    ...savedPlan,
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    title: `${savedPlan.title || "Plan"} afrit`,
  };
  writeSavedPlans([duplicate, ...loadSavedPlans()]);
  renderMyPlans();
}

function deleteSavedPlan(savedPlanId) {
  writeSavedPlans(loadSavedPlans().filter((plan) => plan.id !== savedPlanId));
  renderMyPlans();
}

function generateFromSavedPlan(savedPlanId) {
  const savedPlan = loadSavedPlans().find((plan) => plan.id === savedPlanId);
  if (!savedPlan) return;
  state.goals = [...(savedPlan.goals || [])];
  state.pantry = [...(savedPlan.pantry || [])];
  state.foodDislikes = normalizeAvoidSelections(savedPlan.dislikes || []);
  saveFoodDislikes();
  state.store = savedPlan.store || "kronan";
  state.budget = savedPlan.budget || state.budget;
  state.people = savedPlan.people || state.people;
  state.days = savedPlan.days || state.days;
  state.plan = generatePlan({
    goals: state.goals,
    pantry: state.pantry,
    people: state.people,
    days: state.days,
    budget: state.budget,
    avoidRecipeIds: recipeIdsInPlanSnapshot(savedPlan),
  });
  state.step = 7;
  state.pricingStatus = "idle";
  state.pricingError = null;
  render();
  scrollToPageTop();
  hydrateKronanPrices(state.plan);
}

function savedPlanStats(savedPlans) {
  const totalCost = savedPlans.reduce((sum, plan) => sum + Number(plan.totalCost || 0), 0);
  const proteinCounts = {};
  savedPlans.forEach((plan) => {
    recipeIdsInPlanSnapshot(plan).forEach((recipeId) => {
      const recipe = RECIPES.find((candidate) => candidate.id === recipeId);
      const protein = recipe && recipe.primaryProtein;
      if (protein) proteinCounts[protein] = (proteinCounts[protein] || 0) + 1;
    });
  });
  const mostUsedProtein = Object.entries(proteinCounts).sort((a, b) => b[1] - a[1])[0];
  return {
    plansSaved: savedPlans.length,
    averageWeeklyCost: savedPlans.length ? totalCost / savedPlans.length : 0,
    mostUsedProtein: mostUsedProtein ? PRODUCTS[mostUsedProtein[0]]?.name || mostUsedProtein[0] : "Engin gögn",
  };
}

function validatePlan(plan, goals) {
  const invalidRecipes = [];
  const invalidIngredients = [];

  plan.days.forEach((day) => {
    Object.values(day).forEach(({ recipe }) => {
      if (!leftoverRecipeAllowedForGoals(recipe, goals)) invalidRecipes.push(recipe.id);
      recipe.ingredients.forEach((ing) => {
        if (!ingredientAllowedForGoals(ing.key, goals)) invalidIngredients.push(ing.key);
      });
    });
  });

  plan.shoppingList.forEach((item) => {
    if (!ingredientAllowedForGoals(item.key, goals)) invalidIngredients.push(item.key);
    if (shoppingItemMatchesDislikes(item)) invalidIngredients.push(item.key);
  });

  return {
    valid: invalidRecipes.length === 0 && invalidIngredients.length === 0,
    invalidRecipes: [...new Set(invalidRecipes)],
    invalidIngredients: [...new Set(invalidIngredients)],
  };
}

function planError(options = {}) {
  return {
    error: true,
    message: PLAN_ERROR_MESSAGE,
    days: [],
    shoppingList: [],
    totalPrice: 0,
    people: options.people || state.people,
    numDays: options.days || state.days,
  };
}

function generatePlan(options = {}) {
  const goals = options.goals || state.goals;
  const people = options.people || state.people;
  const days = options.days || state.days;
  const pantry = options.pantry || state.pantry;
  const budget = options.budget || state.budget;
  const avoidRecipeIds = options.avoidRecipeIds || [];

  if (!options.silentStats) {
    console.log("[Planner stats]", plannerStatsForRecipes());
  }
  const eligibleRecipes = RECIPES.filter((recipe) => !recipe.usesLeftovers && recipeAllowedForGoals(recipe, goals));
  const leftoverRecipes = RECIPES.filter((recipe) => recipe.usesLeftovers && leftoverRecipeAllowedForGoals(recipe, goals));
  const structure = buildWeeklyStructure(goals, days);
  const pools = {
    morgunmatur: sortRecipesForSlot(candidateRecipesForSlot(eligibleRecipes, "morgunmatur"), "morgunmatur", goals, pantry, people),
    hádegismatur: sortRecipesForSlot(candidateRecipesForSlot(eligibleRecipes, "hádegismatur"), "hádegismatur", goals, pantry, people),
    kvöldmatur: sortRecipesForSlot(candidateRecipesForSlot(eligibleRecipes, "kvöldmatur"), "kvöldmatur", goals, pantry, people),
  };

  if (Object.values(pools).some((recipes) => recipes.length === 0)) {
    return planError({ people, days });
  }

  const attempts = Math.max(80, days * 35);
  let best = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const candidateDays = buildCandidateWeek(structure, pools, { attempt, goals, pantry, people, days, leftoverRecipes, avoidRecipeIds });
    if (!candidateDays) continue;
    const score = scoreWholeWeek(candidateDays, structure, goals, people, pantry, budget);
    if (!best || score > best.score) best = { days: candidateDays, score };
  }

  if (!best) return planError({ people, days });

  const { shoppingList, totalPrice } = estimateShoppingList(best.days, people, pantry);
  const plan = {
    days: best.days,
    shoppingList,
    totalPrice,
    people,
    numDays: days,
    weeklyStructure: structure,
    weeklyScore: best.score,
    replacedRecipeIds: [],
    nutritionTotals: nutritionTotals(best.days),
  };
  const validation = validatePlan(plan, goals);
  if (!validation.valid) {
    console.warn("[Dietary validation] invalid plan rejected:", validation);
    return planError({ people, days });
  }

  return plan;
}

function recalculatePlanTotal(plan) {
  plan.totalPrice = plan.shoppingList.reduce((total, item) => total + (item.totalPrice ?? item.price ?? item.estimatedPrice ?? 0), 0);
}

function normalizeMatchedShoppingItem(matched, original) {
  const isEstimated = matched ? Boolean(matched.isEstimated) : true;
  const source = matched && matched.source ? matched.source : isEstimated ? "estimated" : "kronan";
  const totalPrice = Number(matched && matched.totalPrice != null
    ? matched.totalPrice
    : original.mockPrice);
  const unitPrice = Number(matched && matched.unitPrice != null
    ? matched.unitPrice
    : original.unitPrice);

  return {
    key: original.key,
    ingredientName: matched && matched.ingredientName ? matched.ingredientName : original.name,
    matchedProductName: matched ? matched.matchedProductName || matched.productName || matched.nameFromStore || null : null,
    productName: matched ? matched.productName || null : null,
    nameFromStore: matched ? matched.nameFromStore || null : null,
    sku: matched && matched.sku ? matched.sku : null,
    unit: original.unit,
    amount: original.amount,
    quantity: matched && matched.quantity != null ? matched.quantity : original.amount,
    packageSize: matched && matched.packageSize ? matched.packageSize : null,
    packageCount: matched && matched.packageCount != null ? matched.packageCount : null,
    unitPrice,
    totalPrice,
    price: totalPrice,
    estimatedPrice: original.mockPrice,
    mockPrice: original.mockPrice,
    image: matched && matched.image ? matched.image : null,
    source,
    sourceLabel: source === "kronan" && !isEstimated ? "Verð frá Krónunni" : "Áætlað verð",
    estimated: isEstimated,
    isEstimated,
  };
}

async function hydrateKronanPrices(plan) {
  if (state.store !== "kronan" || !plan || plan.error) return;

  const requestId = ++pricingRequest.id;
  const traceId = state.traceId || createTraceId();
  state.traceId = traceId;
  state.pricingStatus = "loading";
  state.pricingError = null;
  renderResults();

  try {
    const ingredients = plan.shoppingList.map((item) => ({
      name: item.name,
      quantity: item.amount,
      unit: item.unit,
      estimatedPrice: item.mockPrice,
    }));
    console.log("[TRACE]", traceId, "selectedStore", state.store);
    console.log("[TRACE]", traceId, "rawMealPlan", plan);
    console.log("[TRACE]", traceId, "rawShoppingListBeforeMatching", plan.shoppingList);
    console.log("[Main app Krónan] selected store:", state.store);
    console.log("[Main app Krónan] ingredients sent to /api/kronan/match-products:", ingredients);
    const payload = {
      traceId,
      goals: state.goals,
      items: ingredients,
    };
    console.log("[TRACE]", traceId, "calling /api/kronan/match-products", payload);

    const response = await fetch("/api/kronan/match-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Kronan match-products request failed");

    const data = await response.json();
    console.log("[Main app Krónan] exact /api/kronan/match-products response:", data);
    console.log("[TRACE]", traceId, "match-products response", data);
    if (requestId !== pricingRequest.id) return;

    const originalItems = plan.shoppingList;
    const matchedItems = Array.isArray(data.items) ? data.items : [];
    plan.shoppingList = originalItems
      .map((original, index) => normalizeMatchedShoppingItem(matchedItems[index], original))
      .filter((item) => !shoppingItemMatchesDislikes(item));

    recalculatePlanTotal(plan);
    console.log("[Main app Krónan] final rendered shopping list:", plan.shoppingList);
    console.log("[TRACE]", traceId, "finalShoppingListUsedForRender", plan.shoppingList);
    state.pricingStatus = "ready";
    state.pricingError = null;
    renderResults();
  } catch (error) {
    console.error("[Main app Krónan] match-products failed:", error);
    if (requestId !== pricingRequest.id) return;

    plan.shoppingList.forEach((item) => {
      item.price = item.mockPrice;
      item.totalPrice = item.mockPrice;
      item.matchedProductName = null;
      item.sku = null;
      item.packageSize = null;
      item.packageCount = null;
      item.image = null;
      item.sourceLabel = "Áætlað verð";
      item.estimated = true;
      item.isEstimated = true;
      item.kronanProduct = null;
    });
    recalculatePlanTotal(plan);
    state.pricingStatus = "error";
    state.pricingError = "Náði ekki að sækja verð, sýni áætlað verð.";
    console.log("[Main app Krónan] final rendered shopping list:", plan.shoppingList);
    console.log("[TRACE]", traceId, "finalShoppingListUsedForRender", plan.shoppingList);
    renderResults();
  }
}

// ---------- Rendering ----------

const app = IS_BROWSER ? document.getElementById("app") : null;

if (IS_BROWSER) {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("button, .option, .meal-action-btn, .meal-name, .header-link, .logo")
      : null;
    if (target instanceof HTMLElement) {
      window.setTimeout(clearInteractionState, 0);
    }
  });
}

function render() {
  clearInteractionState();
  const homeLogo = document.getElementById("homeLogo");
  if (homeLogo) {
    homeLogo.onclick = () => {
      navigateToStep(-1);
    };
  }
  const myPlansNav = document.getElementById("myPlansNav");
  if (myPlansNav) {
    myPlansNav.onclick = () => {
      navigateToStep(8);
    };
  }
  document.querySelectorAll("#stepNav span").forEach((el) => {
    const s = Number(el.dataset.step);
    el.classList.toggle("active", s === state.step);
  });
  document.getElementById("stepNav").style.display = state.step <= 6 ? "flex" : "none";
  const mobileProgress = document.getElementById("mobileStepProgress");
  const mobileStepText = document.getElementById("mobileStepText");
  const mobileStepFill = document.getElementById("mobileStepFill");
  if (mobileProgress && mobileStepText && mobileStepFill) {
    const inQuiz = state.step >= 0 && state.step <= 6;
    mobileProgress.style.display = inQuiz ? "" : "none";
    if (inQuiz) {
      mobileStepText.textContent = `Skref ${state.step + 1} af 7 · ${STEP_LABELS[state.step]}`;
      mobileStepFill.style.width = `${((state.step + 1) / 7) * 100}%`;
    }
  }

  if (state.step === -1) renderHero();
  else if (state.step === 0) renderGoalsStep();
  else if (state.step === 1) renderStoreStep();
  else if (state.step === 2) renderBudgetStep();
  else if (state.step === 3) renderPeopleStep();
  else if (state.step === 4) renderDaysStep();
  else if (state.step === 5) renderPantryStep();
  else if (state.step === 6) renderDislikesStep();
  else if (state.step === 7) renderResults();
  else if (state.step === 8) renderMyPlans();
}

function renderHero() {
  app.innerHTML = `
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <div class="eyebrow">Íslenskt matarplan</div>
          <h1>Hvað á ég að <span class="accent">borða</span> þessa viku — fyrir hvað margar krónur?</h1>
          <p class="lead">Veldu budget, verslun og markmið. Fáðu tilbúinn vikumatseðil, uppskriftir og innkaupalista með áætluðu verði — áður en þú ferð út í búð.</p>
          <div class="cta-row">
            <button class="btn" id="startBtn">Búa til matarplan</button>
            <button class="btn ghost" id="learnBtn">Hvernig virkar þetta?</button>
          </div>
          <div class="hero-note">Tekur um 1 mínútu. Engin skráning nauðsynleg til að prófa.</div>
        </div>
        <div class="receipt">
          <h3>Matarplan vikunnar</h3>
          <div class="sub">Krónan · 5 dagar · 2 manns</div>
          <div class="row"><span>Kjúklingabringur 1,2 kg</span><span class="mono">2.879 kr</span></div>
          <div class="row"><span>Hrísgrjón 0,8 kg</span><span class="mono">319 kr</span></div>
          <div class="row"><span>Egg 10 stk</span><span class="mono">699 kr</span></div>
          <div class="row"><span>Hafrar 0,3 kg</span><span class="mono">105 kr</span></div>
          <div class="row"><span>Bláber frosin</span><span class="mono">599 kr</span></div>
          <div class="row"><span>Túnfiskur x3</span><span class="mono">897 kr</span></div>
          <div class="row"><span>Pasta + tómatsósa</span><span class="mono">658 kr</span></div>
          <div class="row"><span item-meta>...</span><span class="item-meta">+ 6 vörur</span></div>
          <div class="row total"><span>Heildarverð</span><span>17.850 kr</span></div>
          <div class="barcode"></div>
        </div>
      </div>
    </section>

    <section class="alt">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Afhverju Matval</div>
          <h2>Mat sem klárast án þess að klára veskið</h2>
          <p>Matur er dýr á Íslandi og fólk eyðir of miklum tíma í að ákveða hvað á að elda. Matval reiknar verðið fyrirfram, nýtir afganga og passar að innkaupin passi við matseðilinn.</p>
        </div>
        <div class="option-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px,1fr));">
          <div class="option" style="cursor:default;"><span class="icon">🧮</span> Sjáðu heildarverðið fyrirfram</div>
          <div class="option" style="cursor:default;"><span class="icon">🍳</span> 30+ íslenskar uppskriftir</div>
          <div class="option" style="cursor:default;"><span class="icon">♻️</span> Afgangaplan sem sparar pening</div>
          <div class="option" style="cursor:default;"><span class="icon">🛒</span> Innkaupalisti tilbúinn fyrir Krónuna</div>
        </div>
      </div>
    </section>
  `;
  document.getElementById("startBtn").onclick = () => { navigateToStep(0); };
  document.getElementById("learnBtn").onclick = () => {
    document.querySelector("section.alt").scrollIntoView({ behavior: "smooth" });
  };
}

function quizShell(stepLabel, title, bodyHtml, { nextLabel = "Áfram", nextDisabled = false, showBack = true } = {}) {
  clearInteractionState();
  app.innerHTML = `
    <section class="quiz-section">
      <div class="wrap quiz-wrap">
        <div class="quiz-card">
          <div class="quiz-step-label">${stepLabel}</div>
          <h3>${title}</h3>
          <div class="quiz-body">
            ${bodyHtml}
          </div>
          <div class="quiz-nav">
            <button class="btn ghost" id="backBtn" ${showBack ? "" : "style='visibility:hidden'"}>Til baka</button>
            <div class="quiz-progress">Skref ${state.step + 1} af 7</div>
            <button class="btn" id="nextBtn" ${nextDisabled ? "disabled" : ""}>${nextLabel}</button>
          </div>
        </div>
      </div>
    </section>
  `;
  document.getElementById("backBtn").onclick = () => {
    navigateToStep(state.step === 0 ? -1 : state.step - 1);
  };
}

function renderGoalsStep() {
  const body = `
    <p style="color:var(--muted); margin-bottom:18px;">Veldu eitt eða fleiri markmið. Þú getur sleppt þessu og haldið áfram.</p>
    <div class="option-grid">
      ${GOALS.map((g) => `
        <div class="option ${state.goals.includes(g.id) ? "selected" : ""}" data-goal="${g.id}">
          <span class="icon">${g.icon}</span> ${g.label}
        </div>
      `).join("")}
    </div>
  `;
  quizShell("Skref 1 — Markmið", "Hvað er markmiðið þitt þessa viku?", body);

  document.querySelectorAll("[data-goal]").forEach((el) => {
    el.onclick = () => {
      const id = el.dataset.goal;
      const idx = state.goals.indexOf(id);
      if (idx === -1) state.goals.push(id); else state.goals.splice(idx, 1);
      el.classList.toggle("selected");
    };
  });
  document.getElementById("nextBtn").onclick = () => { navigateToStep(1); };
}

function renderStoreStep() {
  const body = `
    <p style="color:var(--muted); margin-bottom:18px;">Í fyrstu útgáfu er aðeins Krónan í boði — fleiri verslanir koma síðar.</p>
    <div class="option-grid">
      ${STORES.map((s) => `
        <div class="option ${state.store === s.id ? "selected" : ""} ${!s.available ? "" : ""}" data-store="${s.id}" style="${s.available ? "" : "opacity:0.5; cursor:not-allowed;"}">
          ${s.logo ? `<img class="store-logo" src="${s.logo}" alt="" aria-hidden="true" />` : `<span class="icon">🏬</span>`}
          <div>
            <div>${s.name}</div>
            <div style="font-size:0.75rem; color:var(--muted);">${s.note}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
  quizShell("Skref 2 — Verslun", "Hvaða verslun viltu nota?", body);

  document.querySelectorAll("[data-store]").forEach((el) => {
    const storeObj = STORES.find((s) => s.id === el.dataset.store);
    if (!storeObj.available) return;
    el.onclick = () => {
      state.store = storeObj.id;
      document.querySelectorAll("[data-store]").forEach((o) => o.classList.remove("selected"));
      el.classList.add("selected");
    };
  });
  document.getElementById("nextBtn").onclick = () => { navigateToStep(2); };
}

function renderBudgetStep() {
  const body = `
    <p style="color:var(--muted); margin-bottom:6px;">Hvað viltu eyða í mat fyrir alla vikuna?</p>
    <div class="budget-display mono">${fmt(state.budget)}</div>
    <input type="range" min="6000" max="50000" step="500" value="${state.budget}" id="budgetRange" />
    <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--muted); margin-top:6px;" class="mono">
      <span>6.000 kr</span><span>50.000 kr</span>
    </div>
    <div class="option-grid compact-option-grid">
      ${[12000, 18000, 25000, 35000].map((b) => `<div class="option" data-budget="${b}" style="justify-content:center;">${fmt(b)}</div>`).join("")}
    </div>
  `;
  quizShell("Skref 3 — Kostnaður", "Hvað má vikan kosta?", body);

  document.getElementById("budgetRange").oninput = (e) => {
    state.budget = Number(e.target.value);
    document.querySelector(".budget-display").textContent = fmt(state.budget);
  };
  document.querySelectorAll("[data-budget]").forEach((el) => {
    el.onclick = () => {
      state.budget = Number(el.dataset.budget);
      document.querySelector(".budget-display").textContent = fmt(state.budget);
      document.getElementById("budgetRange").value = state.budget;
    };
  });
  document.getElementById("nextBtn").onclick = () => { navigateToStep(3); };
}

function renderPeopleStep() {
  const body = `
    <div class="option-grid">
      ${PEOPLE_OPTIONS.map((p) => `
        <div class="option ${state.people === p.id ? "selected" : ""}" data-people="${p.id}">
          <span class="icon">${p.id === 1 ? "🧍" : p.id === 2 ? "🧍🧍" : "👨‍👩‍👧‍👦"}</span> ${p.label}
        </div>
      `).join("")}
    </div>
  `;
  quizShell("Skref 4 — Fjöldi fólks", "Hversu margir eru að borða?", body);

  document.querySelectorAll("[data-people]").forEach((el) => {
    el.onclick = () => {
      state.people = Number(el.dataset.people);
      document.querySelectorAll("[data-people]").forEach((o) => o.classList.remove("selected"));
      el.classList.add("selected");
    };
  });
  document.getElementById("nextBtn").onclick = () => { navigateToStep(4); };
}

function renderDaysStep() {
  const body = `
    <div class="option-grid">
      ${DAY_OPTIONS.map((d) => `
        <div class="option ${state.days === d ? "selected" : ""}" data-days="${d}" style="justify-content:center;">
          ${d} daga plan
        </div>
      `).join("")}
    </div>
  `;
  quizShell("Skref 5 — Fjöldi daga", "Hversu marga daga viltu plana fyrir?", body);

  document.querySelectorAll("[data-days]").forEach((el) => {
    el.onclick = () => {
      state.days = Number(el.dataset.days);
      document.querySelectorAll("[data-days]").forEach((o) => o.classList.remove("selected"));
      el.classList.add("selected");
    };
  });
  document.getElementById("nextBtn").onclick = () => { navigateToStep(5); };
}

function renderPantryStep() {
  const body = `
    <p style="color:var(--muted); margin-bottom:14px;">Hvað ert þú að eiga til heima? Appið reynir að nota það og sleppir því úr innkaupalistanum.</p>
    <div class="pantry-tags" id="pantryTags">
      ${state.pantry.map((key) => `
        <span class="pantry-tag" data-key="${key}">${PRODUCTS[key].name} <button data-remove="${key}">×</button></span>
      `).join("")}
    </div>
    <div style="margin-top:14px;">
      <div class="pantry-suggestions">
        ${PANTRY_SUGGESTIONS.filter((k) => !state.pantry.includes(k)).map((k) => `
          <div class="option" data-add="${k}">+ ${PRODUCTS[k].name}</div>
        `).join("")}
      </div>
    </div>
  `;
  quizShell("Skref 6 — Til heima", "Hvað er til í eldhúsinu hjá þér?", body);

  function refreshTags() {
    document.getElementById("pantryTags").innerHTML = state.pantry.map((key) => `
      <span class="pantry-tag" data-key="${key}">${PRODUCTS[key].name} <button data-remove="${key}">×</button></span>
    `).join("");
    bindRemove();
  }
  function bindRemove() {
    document.querySelectorAll("[data-remove]").forEach((el) => {
      el.onclick = () => {
        state.pantry = state.pantry.filter((k) => k !== el.dataset.remove);
        refreshTags();
        renderPantryStep();
      };
    });
  }
  bindRemove();
  document.querySelectorAll("[data-add]").forEach((el) => {
    el.onclick = () => {
      state.pantry.push(el.dataset.add);
      renderPantryStep();
    };
  });

  document.getElementById("nextBtn").onclick = () => {
    navigateToStep(6);
  };
}

function renderDislikesStep() {
  state.foodDislikes = normalizeAvoidSelections(state.foodDislikes);
  const selectedLabels = normalizeAvoidSelections(state.foodDislikes);
  const presetOptions = AVOID_QUICK_CHIPS;
  const body = `
    <p style="color:var(--muted); margin-bottom:18px;">Veldu mat sem þú vilt ekki fá í planinu. Ef þetta er ofnæmi, vertu sérstaklega viss um að fara yfir innihaldsefni.</p>
    <div class="pantry-tags" id="avoidTags" style="margin-bottom:14px;">
      ${selectedLabels.map((label) => `
        <span class="pantry-tag">${escapeHtml(label)} <button data-remove-avoid="${escapeHtml(label)}" aria-label="Fjarlægja ${escapeHtml(label)}">×</button></span>
      `).join("")}
    </div>
    <div class="pantry-input-row">
      <input type="text" id="avoidInput" list="avoidSuggestions" placeholder="Sláðu inn mat eða ofnæmi..." autocomplete="off" />
      <button class="btn ghost" id="addAvoidBtn" type="button">Bæta við</button>
    </div>
    <datalist id="avoidSuggestions">
      ${AVOID_FOOD_SUGGESTIONS.map((item) => `<option value="${escapeHtml(item)}"></option>`).join("")}
    </datalist>
    <div class="pantry-suggestions">
      ${presetOptions.map((label) => `
        <div class="option ${selectedLabels.some((item) => normalizeFoodText(item) === normalizeFoodText(label)) ? "selected" : ""}" data-dislike="${escapeHtml(label)}">
          ${escapeHtml(label)}
        </div>
      `).join("")}
    </div>
    ${selectedLabels.length ? `<p style="color:var(--muted); font-size:0.85rem;">Forðast: ${selectedLabels.map(escapeHtml).join(", ")}</p>` : ""}
  `;
  quizShell("Skref 7 — Forðast", "Er eitthvað sem þú vilt forðast?", body, { nextLabel: "Búa til matarplan" });

  function addAvoidFood(value) {
    const label = avoidLabel(value);
    if (!label) return;
    state.foodDislikes = normalizeAvoidSelections([...state.foodDislikes, label]);
    saveFoodDislikes();
    renderDislikesStep();
  }

  function removeAvoidFood(value) {
    const normalized = normalizeFoodText(value);
    state.foodDislikes = normalizeAvoidSelections(state.foodDislikes).filter((label) => normalizeFoodText(label) !== normalized);
    saveFoodDislikes();
    renderDislikesStep();
  }

  document.querySelectorAll("[data-dislike]").forEach((el) => {
    el.onclick = () => {
      const label = el.dataset.dislike;
      if (normalizeAvoidSelections(state.foodDislikes).some((item) => normalizeFoodText(item) === normalizeFoodText(label))) {
        removeAvoidFood(label);
      } else {
        addAvoidFood(label);
      }
    };
  });
  document.querySelectorAll("[data-remove-avoid]").forEach((el) => {
    el.onclick = () => removeAvoidFood(el.dataset.removeAvoid);
  });
  document.getElementById("addAvoidBtn").onclick = () => {
    addAvoidFood(document.getElementById("avoidInput").value);
  };
  document.getElementById("avoidInput").onkeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addAvoidFood(event.currentTarget.value);
    }
  };
  document.getElementById("avoidInput").onchange = (event) => {
    const value = event.currentTarget.value;
    if (AVOID_FOOD_SUGGESTIONS.some((suggestion) => normalizeFoodText(suggestion) === normalizeFoodText(value))) {
      addAvoidFood(value);
    }
  };

  document.getElementById("nextBtn").onclick = () => {
    state.foodDislikes = normalizeAvoidSelections(state.foodDislikes);
    saveFoodDislikes();
    state.plan = generatePlan();
    state.step = 7;
    state.pricingStatus = "idle";
    state.pricingError = null;
    render();
    scrollToPageTop();
    hydrateKronanPrices(state.plan);
  };
}

function tagLabels(tags) {
  return tags.filter((t) => TAGS[t]).map((t) => TAGS[t]).join(" · ");
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("is-IS", { year: "numeric", month: "short", day: "numeric" });
}

function renderMyPlans() {
  clearInteractionState();
  const savedPlans = loadSavedPlans();
  const stats = savedPlanStats(savedPlans);

  app.innerHTML = `
    <section>
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Vistaðar vikur</div>
          <h2>Mín plön</h2>
          <p>Vistaðar á þessu tæki. Engin skráning eða bakendi ennþá.</p>
        </div>

        <div class="result-actions">
          <button class="btn ghost" id="backToPlannerBtn">← Til baka</button>
          <button class="btn" id="newPlanBtn">Búa til nýtt plan</button>
        </div>

        <div class="saved-stats">
          <div class="stat-card"><span>Vistuð plön</span><strong>${stats.plansSaved}</strong></div>
          <div class="stat-card"><span>Meðalkostnaður á viku</span><strong>${fmt(stats.averageWeeklyCost)}</strong></div>
          <div class="stat-card"><span>Algengasta prótein</span><strong>${stats.mostUsedProtein}</strong></div>
        </div>

        <div class="saved-plan-list">
          ${savedPlans.length ? savedPlans.map((plan) => {
            const mealCount = (plan.meals || []).length * 3;
            const goalLabels = (plan.goals || []).map((goal) => GOALS.find((item) => item.id === goal)?.label || goal);
            const dislikeLabels = normalizeAvoidSelections(plan.dislikes || []);
            return `
              <div class="saved-plan-card">
                <div>
                  <h3>${plan.title || "Vistað plan"}</h3>
                  <div class="saved-plan-meta">${formatDate(plan.createdAt)} · ${mealCount} máltíðir · ${fmt(plan.totalCost || 0)}</div>
                  <div class="saved-plan-meta">${goalLabels.length ? goalLabels.join(", ") : "Engin markmið"}${dislikeLabels.length ? ` · Forðast: ${dislikeLabels.map(escapeHtml).join(", ")}` : ""}</div>
                </div>
                <div class="saved-plan-actions">
                  <button class="meal-action-btn" data-open-plan="${plan.id}">Opna plan</button>
                  <button class="meal-action-btn" data-duplicate-plan="${plan.id}">Afrita plan</button>
                  <button class="meal-action-btn" data-generate-from-plan="${plan.id}">Svipað plan</button>
                  <button class="meal-action-btn danger" data-delete-plan="${plan.id}">Eyða plani</button>
                </div>
              </div>
            `;
          }).join("") : `
            <div class="quiz-card">
              <h3>Engin vistuð plön ennþá</h3>
              <p style="color:var(--muted);">Búðu til matarplan og smelltu á Vista plan til að vista það hér.</p>
            </div>
          `}
        </div>
      </div>
    </section>
  `;

  document.getElementById("backToPlannerBtn").onclick = () => {
    navigateToStep(state.plan ? 7 : -1);
  };
  document.getElementById("newPlanBtn").onclick = () => {
    navigateToStep(0);
  };
  document.querySelectorAll("[data-open-plan]").forEach((el) => {
    el.onclick = () => openSavedPlan(el.dataset.openPlan);
  });
  document.querySelectorAll("[data-duplicate-plan]").forEach((el) => {
    el.onclick = () => duplicateSavedPlan(el.dataset.duplicatePlan);
  });
  document.querySelectorAll("[data-delete-plan]").forEach((el) => {
    el.onclick = () => deleteSavedPlan(el.dataset.deletePlan);
  });
  document.querySelectorAll("[data-generate-from-plan]").forEach((el) => {
    el.onclick = () => generateFromSavedPlan(el.dataset.generateFromPlan);
  });
}

function renderResults() {
  clearInteractionState();
  const plan = state.plan;
  if (!plan || plan.error) {
    app.innerHTML = `
      <section>
        <div class="wrap">
          <div class="quiz-card">
            <div class="quiz-step-label">Matarplan</div>
            <h3>Engin gild niðurstaða</h3>
            <p style="color:var(--muted); margin-bottom:18px;">${plan ? plan.message : PLAN_ERROR_MESSAGE}</p>
            <button class="btn" id="restartBtn">Breyta vali</button>
          </div>
        </div>
      </section>
    `;
    document.getElementById("restartBtn").onclick = () => { navigateToStep(0); };
    return;
  }

  const overBudget = plan.totalPrice > state.budget;
  const pct = Math.min(100, (plan.totalPrice / state.budget) * 100);
  const perDay = plan.totalPrice / plan.numDays;
  const perMeal = plan.totalPrice / (plan.numDays * 3);
  const estimatedCount = plan.shoppingList.filter((item) => item.isEstimated || item.estimated).length;
  const pricingMessage = state.pricingStatus === "loading"
    ? "Sæki verð frá Krónunni..."
    : state.pricingStatus === "error"
      ? "Náði ekki að sækja verð, sýni áætlað verð."
      : null;
  const shoppingDisplayName = (item) => {
    if (item.source === "kronan" && item.isEstimated === false) {
      return item.matchedProductName || item.productName || item.nameFromStore || item.name || "Vara";
    }
    return item.ingredientName || item.name || "Vara";
  };
  const shoppingLineMeta = (item) => {
    if (item.source === "kronan" && item.isEstimated === false) {
      const packageCount = item.packageCount || 1;
      return `Magn: ×${packageCount}`;
    }
    if (item.amount && item.unit) return `Magn: ${Number(item.amount).toFixed(item.amount < 1 ? 2 : 0)} ${item.unit}`;
    return "Magn: áætlað";
  };
  const shoppingLinePrice = (item) => {
    if (item.source === "kronan" && item.isEstimated === false) {
      return item.totalPrice;
    }
    return item.estimatedPrice ?? item.totalPrice ?? item.price;
  };
  const shoppingItemBadge = (item) => {
    if (item.isEstimated || item.estimated) return "Áætlað verð";
    if (item.source !== "kronan") return "Ekki fannst vara";
    return "";
  };
  const shoppingCategory = (item) => {
    const key = item.key || "";
    const productName = normalizeFoodText(`${item.ingredientName || ""} ${item.matchedProductName || ""}`);
    if (productName.includes("fros") || ["mixed_veg", "blueberries", "spinach"].includes(key)) return "Frosið";
    if (["chicken_breast", "eggs", "tuna", "ground_beef", "salmon", "tofu", "lentils", "chickpeas", "black_beans", "kidney_beans", "cottage_cheese", "yogurt_skyr"].includes(key)) return "Prótein";
    if (["mixed_veg", "banana", "onion", "garlic", "potatoes", "spinach", "carrots", "cucumber", "tomato", "apples", "blueberries"].includes(key)) return "Grænmeti og ávextir";
    if (["milk", "oatmilk", "butter", "cheese", "coconut_milk"].includes(key)) return "Mjólkurvörur / valkostir";
    if (["rice", "oats", "pasta", "tomato_sauce", "bread", "tortilla", "soy_sauce", "peanut_butter", "oil", "noodles", "spices"].includes(key)) return "Búrvara";
    if (productName.includes("fros")) return "Frosið";
    return "Annað";
  };
  const categoryOrder = ["Prótein", "Grænmeti og ávextir", "Mjólkurvörur / valkostir", "Búrvara", "Frosið", "Annað"];
  const groupedShoppingList = categoryOrder
    .map((category) => ({
      category,
      items: plan.shoppingList.filter((item) => shoppingCategory(item) === category),
    }))
    .filter((group) => group.items.length);
  const traceId = state.traceId || "no-trace";

  app.innerHTML = `
    <section>
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Matarplanið þitt</div>
          <div class="plan-title-row">
            <h2>Vikan þín</h2>
          </div>
          <div class="plan-stats">${plan.numDays} dagar · ${plan.people} ${plan.people === 1 ? "manneskja" : "manns"}</div>
          <p>${state.goals.length ? "Byggt á markmiðunum: " + state.goals.map((g) => GOALS.find((x) => x.id === g).label).join(", ") + "." : "Almennt jafnvægisplan."}</p>
        </div>

        <div class="result-actions">
          <button class="btn ghost" id="restartBtn">← Breyta vali</button>
          <button class="btn ghost" id="editPrefsBtn">Stillingar</button>
          <button class="btn ghost" id="myPlansBtn">Mín plön</button>
          <button class="btn" id="savePlanBtn">Vista plan</button>
        </div>
        <button class="btn secondary result-regen" id="regenBtn">Endurnýja plan</button>

        <div class="results-summary">
          <div>
            ${plan.days.map((day, i) => `
              <div class="day-card">
                <h3>${DAY_NAMES[i]} <span class="daynum">DAGUR ${String(i + 1).padStart(2, "0")}</span></h3>
                ${Object.entries(day).map(([type, meal]) => `
                  <div class="meal-row">
                    <div class="meal-type">${type}</div>
                    <div style="flex:1;">
                      <div class="meal-name" data-recipe="${meal.recipe.id}" data-recipe-day="${i}" data-recipe-slot="${type}">${meal.recipe.name}</div>
                      <div class="meal-tags">${tagLabels(meal.recipe.tags.slice(0,3))} · ${meal.recipe.calories} kcal · ${meal.recipe.protein}g prótein</div>
                      ${meal.leftover ? `<div class="leftover-note">♻️ Afgangaplan: notar afganga frá fyrri degi</div>` : ""}
                      <div class="meal-actions">
                        <button class="meal-action-btn" data-replace-day="${i}" data-replace-slot="${type}">↻ Skipta út</button>
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            `).join("")}
          </div>

          <div>
            <div class="shopping-list">
              <h3>Innkaupalisti — Krónan</h3>
              <div class="shopping-source-note">Verð sótt frá Krónunni þegar hægt er.</div>
              ${pricingMessage ? `<div class="budget-note" style="margin-bottom:10px;">${pricingMessage}</div>` : ""}
              ${groupedShoppingList.map((group) => `
                <div class="shopping-group">
                  <div class="shopping-group-title">${group.category}</div>
                  ${group.items.map((item) => {
                    const badge = shoppingItemBadge(item);
                    return `
                      ${(() => { console.log("[TRACE]", traceId, "rendering item", item); return ""; })()}
                      <label class="shopping-item">
                        <input class="shopping-check" type="checkbox" aria-label="${escapeHtml(shoppingDisplayName(item))}" />
                        <span class="shopping-item-main">
                          <span class="shopping-item-name">${escapeHtml(shoppingDisplayName(item))}</span>
                          <span class="shopping-item-meta">${escapeHtml(shoppingLineMeta(item))}${badge ? ` · <span class="shopping-badge">${escapeHtml(badge)}</span>` : ""}</span>
                        </span>
                        <span class="shopping-item-price mono">${fmt(shoppingLinePrice(item))}</span>
                      </label>
                    `;
                  }).join("")}
                </div>
              `).join("")}
              ${state.pantry.length ? `<div style="margin-top:10px; font-size:0.8rem; color:var(--muted);">✓ ${state.pantry.length} vara/vörur frá "til heima" eru ekki inni á listanum.</div>` : ""}
              ${estimatedCount ? `<div class="budget-note" style="margin-top:10px;">${estimatedCount} vara/vörur eru með áætluðu verði.</div>` : ""}
              <div class="total-row"><span>Heildarverð</span><span>${fmt(plan.totalPrice)}</span></div>
              <div class="budget-bar"><div class="budget-bar-fill ${overBudget ? "over" : ""}" style="width:${pct}%"></div></div>
              <div class="budget-note">
                ${overBudget
                  ? `Planið er ${fmt(plan.totalPrice - state.budget)} yfir budget (${fmt(state.budget)}).`
                  : `Planið er innan budget — ${fmt(state.budget - plan.totalPrice)} til skiptanna.`}
              </div>
              <div class="budget-note" style="margin-top:8px;">≈ ${fmt(perDay)} á dag · ≈ ${fmt(perMeal)} á máltíð</div>
              <div class="budget-note" style="margin-top:8px;">Verð geta breyst.</div>
            </div>
          </div>
        </div>

        <div class="section-head" style="margin-top:24px;">
          <div class="eyebrow">Næsta skref</div>
          <h2>Vista planið</h2>
          <p>Skráning og vistun kemur í næstu útgáfu — núna geturðu skoðað uppskriftir með því að smella á matarheiti.</p>
        </div>
      </div>
    </section>
    <div id="modalRoot"></div>
  `;

  document.getElementById("restartBtn").onclick = () => { navigateToStep(0); };
  document.getElementById("editPrefsBtn").onclick = () => { navigateToStep(6); };
  document.getElementById("myPlansBtn").onclick = () => { navigateToStep(8); };
  document.getElementById("savePlanBtn").onclick = () => {
    const saved = saveCurrentPlan();
    if (saved) {
      navigateToStep(8);
    }
  };
  document.getElementById("regenBtn").onclick = () => {
    // shuffle by rotating recipe order slightly: simplest is to re-run generation with a small random seed effect
    state.plan = generatePlan();
    state.pricingStatus = "idle";
    state.pricingError = null;
    renderResults();
    scrollToPageTop();
    hydrateKronanPrices(state.plan);
  };
  document.querySelectorAll("[data-recipe]").forEach((el) => {
    el.onclick = () => openRecipeModal(el.dataset.recipe, {
      dayIndex: el.dataset.recipeDay !== undefined ? Number(el.dataset.recipeDay) : null,
      slot: el.dataset.recipeSlot || null,
    });
  });
  document.querySelectorAll("[data-replace-day]").forEach((el) => {
    el.onclick = (event) => {
      event.stopPropagation();
      replaceMeal(Number(el.dataset.replaceDay), el.dataset.replaceSlot);
    };
  });
}

const MODAL_TAG_PRIORITY = ["cheap", "healthy", "quick", "high_protein", "protein", "dairy_free", "dairyfree", "vegan", "vegetarian", "family"];

function usefulRecipeTags(recipe) {
  const seenLabels = new Set();
  return MODAL_TAG_PRIORITY
    .filter((tag) => recipe.tags.includes(tag) && TAGS[tag])
    .map((tag) => TAGS[tag])
    .filter((label) => {
      const normalized = normalizeFoodText(label);
      if (seenLabels.has(normalized)) return false;
      seenLabels.add(normalized);
      return true;
    })
    .slice(0, 5);
}

function formatIngredientAmount(amount) {
  if (amount >= 10) return amount.toFixed(0);
  if (amount >= 1) return Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
  return amount.toFixed(2);
}

function openRecipeModal(recipeId, context = {}) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return;
  const multiplier = state.people / recipe.servingsBase;
  const ingredientsHtml = recipe.ingredients.map((ing) => {
    const product = PRODUCTS[ing.key];
    const amount = (ing.amount * multiplier);
    return `
      <li class="ingredient-line">
        <span class="ingredient-qty">${formatIngredientAmount(amount)} ${escapeHtml(product.unit)}</span>
        <span class="ingredient-name">${escapeHtml(product.name)}</span>
      </li>
    `;
  }).join("");
  const tagHtml = usefulRecipeTags(recipe).map((label) => `<span class="tag-pill">${escapeHtml(label)}</span>`).join("");
  const mediaHtml = recipe.imageUrl
    ? `<img class="recipe-hero-image" src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.imageAlt || recipe.name)}" />`
    : `
      <div class="recipe-placeholder" role="img" aria-label="Mynd kemur síðar fyrir ${escapeHtml(recipe.name)}">
        <div class="recipe-placeholder-icon">🍽</div>
        <div class="recipe-placeholder-title">${escapeHtml(recipe.name)}</div>
        <div class="recipe-placeholder-note">Mynd kemur síðar</div>
      </div>
    `;
  const canReplace = Number.isInteger(context.dayIndex) && context.slot;

  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal">
        <button class="close" id="closeModal" aria-label="Loka">×</button>
        ${mediaHtml}
        <div class="modal-content">
          <h3>${escapeHtml(recipe.name)}</h3>
          <div class="meta-row">
            <span>⏱ <strong>${recipe.time} mín</strong></span>
            <span>🔥 <strong>${recipe.calories} kcal</strong></span>
            <span>🍗 <strong>${recipe.protein}g</strong> prótein</span>
          </div>
          <div class="recipe-price">💰 <strong>${fmt(recipePrice(recipe, state.people))}</strong> fyrir ${state.people} ${state.people === 1 ? "mann" : "manns"}</div>
          ${tagHtml ? `<div class="modal-tags">${tagHtml}</div>` : ""}
          <h4>Hráefni <span>(${state.people} ${state.people === 1 ? "skammtur" : "skammtar"})</span></h4>
          <ul class="ingredient-list">${ingredientsHtml}</ul>
          <h4>Eldunarskref</h4>
          <ol class="step-list">${recipe.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
          <div class="modal-actions">
            ${canReplace ? `<button class="btn secondary" id="modalReplaceBtn">Skipta út þessari máltíð</button>` : ""}
            <button class="btn" id="modalCloseBtn">Loka</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("closeModal").onclick = closeModal;
  document.getElementById("modalCloseBtn").onclick = closeModal;
  const replaceBtn = document.getElementById("modalReplaceBtn");
  if (replaceBtn) {
    replaceBtn.onclick = () => {
      closeModal();
      replaceMeal(context.dayIndex, context.slot);
    };
  }
  document.getElementById("modalOverlay").onclick = (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  };
  document.addEventListener("keydown", escCloseHandler);
}

function escCloseHandler(e) {
  if (e.key === "Escape") closeModal();
}
function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
  document.removeEventListener("keydown", escCloseHandler);
}

// init
function planIngredientKeys(plan) {
  const keys = new Set();
  if (!plan || plan.error) return keys;

  plan.days.forEach((day) => {
    Object.values(day).forEach(({ recipe }) => {
      recipe.ingredients.forEach((ing) => keys.add(ing.key));
    });
  });
  plan.shoppingList.forEach((item) => keys.add(item.key));
  return keys;
}

function runDietaryAssertions() {
  const previousDislikes = [...state.foodDislikes];
  state.foodDislikes = [];
  const veganPlan = generatePlan({ goals: ["vegan"], people: 2, days: 3, pantry: [], silentStats: true });
  const veganKeys = planIngredientKeys(veganPlan);
  console.assert(!veganPlan.error, "vegan plan should be generated");
  console.assert(!veganKeys.has("chicken_breast"), "vegan plan must not include chicken");
  console.assert(!veganKeys.has("eggs"), "vegan plan must not include egg");
  console.assert(![...veganKeys].some((key) => INGREDIENT_META[key] && INGREDIENT_META[key].containsDairy), "vegan plan must not include dairy");

  const vegetarianPlan = generatePlan({ goals: ["vegetarian"], people: 2, days: 3, pantry: [], silentStats: true });
  const vegetarianKeys = planIngredientKeys(vegetarianPlan);
  console.assert(!vegetarianPlan.error, "vegetarian plan should be generated");
  console.assert(![...vegetarianKeys].some((key) => INGREDIENT_META[key] && (INGREDIENT_META[key].containsMeat || INGREDIENT_META[key].containsFish)), "vegetarian plan must not include meat/fish");

  const dairyFreePlan = generatePlan({ goals: ["dairy_free"], people: 2, days: 3, pantry: [], silentStats: true });
  const dairyFreeKeys = planIngredientKeys(dairyFreePlan);
  console.assert(!dairyFreePlan.error, "dairy-free plan should be generated");
  console.assert(!["yogurt_skyr", "cheese", "butter", "cottage_cheese", "milk"].some((key) => dairyFreeKeys.has(key)), "dairy-free plan must not include skyr/cheese/butter");
  state.foodDislikes = previousDislikes;
}

function runAvoidFoodAssertions() {
  const previousDislikes = [...state.foodDislikes];

  state.foodDislikes = ["Hnetur"];
  console.assert(ingredientMatchesDislikes("peanut_butter"), "Hnetur should exclude hnetusmjör");

  state.foodDislikes = ["Mjólk"];
  console.assert(ingredientMatchesDislikes("yogurt_skyr"), "Mjólk should exclude skyr");
  console.assert(ingredientMatchesDislikes("cheese"), "Mjólk should exclude ostur");
  console.assert(ingredientMatchesDislikes("butter"), "Mjólk should exclude smjör");

  state.foodDislikes = ["Gluten"];
  console.assert(ingredientMatchesDislikes("bread"), "Gluten should exclude brauð");
  console.assert(ingredientMatchesDislikes("pasta"), "Gluten should exclude pasta");
  console.assert(ingredientMatchesDislikes("noodles"), "Gluten should exclude núðlur");

  state.foodDislikes = ["Fiskur"];
  console.assert(ingredientMatchesDislikes("salmon"), "Fiskur should exclude lax");
  console.assert(ingredientMatchesDislikes("tuna"), "Fiskur should exclude túnfiskur");

  state.foodDislikes = ["Soja"];
  console.assert(ingredientMatchesDislikes("soy_sauce"), "Soja should exclude sojasósa");
  console.assert(ingredientMatchesDislikes("tofu"), "Soja should exclude tófú");

  state.foodDislikes = previousDislikes;
}

function recipeRepeatCounts(plan) {
  const counts = {};
  plan.days.forEach((day) => {
    Object.values(day).forEach(({ recipe }) => {
      counts[recipe.id] = (counts[recipe.id] || 0) + 1;
    });
  });
  return counts;
}

function maxPrimaryProteinStreak(plan) {
  let maxStreak = 0;
  let currentProtein = null;
  let currentStreak = 0;
  plan.days.forEach((day) => {
    [day.morgunmatur, day.hádegismatur, day.kvöldmatur].forEach(({ recipe }) => {
      const protein = recipe.primaryProtein || "none";
      if (protein !== "none" && protein === currentProtein) {
        currentStreak++;
      } else {
        currentProtein = protein;
        currentStreak = protein === "none" ? 0 : 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    });
  });
  return maxStreak;
}

function runWeeklyPlanningAssertions() {
  const previousDislikes = [...state.foodDislikes];
  state.foodDislikes = [];
  const defaultPlan = generatePlan({ goals: [], people: 2, days: 7, pantry: [], silentStats: true });
  console.assert(!defaultPlan.error, "default weekly plan should be generated");
  console.assert(defaultPlan.days.every((day) => day.morgunmatur.recipe.mealRole !== "dinner"), "dinner recipes must not appear at breakfast");
  console.assert(Object.values(recipeRepeatCounts(defaultPlan)).every((count) => count <= 2), "default plan should not repeat recipes more than twice");
  console.assert(maxPrimaryProteinStreak(defaultPlan) <= 4, "default plan should not repeat the same protein more than four meals in a row");
  console.assert(defaultPlan.days.some((day) => day.hádegismatur.leftover), "weekly plan should use at least one intentional leftover lunch");

  const highProteinPlan = generatePlan({ goals: ["high_protein"], people: 2, days: 7, pantry: [], silentStats: true });
  const fishMeals = highProteinPlan.days.flatMap((day) => Object.values(day)).filter(({ recipe }) => recipe.isFishMeal).length;
  const chickenMeals = highProteinPlan.days.flatMap((day) => Object.values(day)).filter(({ recipe }) => recipe.isChickenMeal).length;
  console.assert(!highProteinPlan.error, "high-protein weekly plan should be generated");
  console.assert(fishMeals >= highProteinPlan.weeklyStructure.targets.fishMeals, "weekly plan should hit fish meal target when possible");
  console.assert(chickenMeals >= highProteinPlan.weeklyStructure.targets.chickenMeals, "weekly plan should hit chicken meal target when possible");
  state.foodDislikes = previousDislikes;
}

runDietaryAssertions();
runAvoidFoodAssertions();
runWeeklyPlanningAssertions();
if (IS_BROWSER) {
  state.step = -1;
  render();
  scrollToPageTop();
}
