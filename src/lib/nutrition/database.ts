// ─── LifeSync OS — Curated Nutrition Reference Database ──────────────
// Validated nutritional profiles from Indian Food Composition Tables (IFCT/NIN)
// and USDA FoodData Central.
// Every entry contains serving definitions, standard weights, and verified macros.

export interface ReferenceFoodItem {
  id: string;
  name: string;
  aliases: string[];
  category: "grain" | "protein" | "dairy" | "fruit" | "vegetable" | "condiment" | "beverage" | "composite";
  defaultServing: {
    unit: string;
    weightGrams: number;
    description: string;
  };
  supportedUnits: Record<string, number>; // unit -> multiplier relative to defaultServing
  per100g?: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
  };
  servingNutrition: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
  };
  assumptions: string;
}

export const FOOD_DATABASE: ReferenceFoodItem[] = [
  // ─── SOUTH INDIAN & STAPLES ─────────────────────────────────
  {
    id: "idli",
    name: "Idli",
    aliases: ["idli", "idly", "idlis", "idlies", "steamed idli"],
    category: "grain",
    defaultServing: {
      unit: "piece",
      weightGrams: 45,
      description: "medium steamed idli (~45g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      plate: 2, // standard restaurant plate is typically 2 idlis
      serving: 2,
    },
    per100g: {
      calories: 93,
      proteinG: 4.0,
      carbsG: 18.7,
      fatsG: 0.4,
    },
    servingNutrition: {
      calories: 42,
      proteinG: 1.8,
      carbsG: 8.4,
      fatsG: 0.2,
    },
    assumptions: "medium-sized steamed idli (~45g each)",
  },
  {
    id: "plain_dosa",
    name: "Plain Dosa",
    aliases: ["dosa", "plain dosa", "dosai", "sada dosa"],
    category: "grain",
    defaultServing: {
      unit: "piece",
      weightGrams: 80,
      description: "standard plain dosa (~80g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      plate: 1,
      serving: 1,
      large: 1.4,
      small: 0.7,
    },
    servingNutrition: {
      calories: 135,
      proteinG: 3.2,
      carbsG: 23.0,
      fatsG: 3.5,
    },
    assumptions: "standard medium plain dosa (~80g)",
  },
  {
    id: "masala_dosa",
    name: "Masala Dosa",
    aliases: ["masala dosa", "masala dosai", "mysore masala dosa", "alu dosa"],
    category: "composite",
    defaultServing: {
      unit: "piece",
      weightGrams: 150,
      description: "masala dosa with spiced potato filling (~150g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      plate: 1,
      serving: 1,
    },
    servingNutrition: {
      calories: 260,
      proteinG: 4.5,
      carbsG: 36.0,
      fatsG: 11.0,
    },
    assumptions: "standard masala dosa with potato stuffing (~150g)",
  },
  {
    id: "sambar",
    name: "Sambar",
    aliases: ["sambar", "sambhar", "south indian sambar"],
    category: "vegetable",
    defaultServing: {
      unit: "bowl",
      weightGrams: 150,
      description: "small bowl / cup of vegetable sambar (~150ml)",
    },
    supportedUnits: {
      bowl: 1,
      cup: 1,
      serving: 1,
      small_bowl: 0.7,
      tbsp: 0.15,
    },
    servingNutrition: {
      calories: 90,
      proteinG: 3.5,
      carbsG: 13.0,
      fatsG: 2.5,
    },
    assumptions: "standard bowl of mixed vegetable lentil sambar (~150ml)",
  },
  {
    id: "rasam",
    name: "Rasam",
    aliases: ["rasam", "saaru", "tomato rasam"],
    category: "vegetable",
    defaultServing: {
      unit: "cup",
      weightGrams: 150,
      description: "cup of rasam (~150ml)",
    },
    supportedUnits: {
      cup: 1,
      bowl: 1,
      glass: 1.3,
      serving: 1,
    },
    servingNutrition: {
      calories: 45,
      proteinG: 1.2,
      carbsG: 6.5,
      fatsG: 1.5,
    },
    assumptions: "standard cup of traditional spiced rasam (~150ml)",
  },
  {
    id: "coconut_chutney",
    name: "Coconut Chutney",
    aliases: ["chutney", "coconut chutney", "white chutney", "nariyal chutney"],
    category: "condiment",
    defaultServing: {
      unit: "serving",
      weightGrams: 35,
      description: "standard condiment serving (~35g / ~2 tbsp)",
    },
    supportedUnits: {
      serving: 1,
      tbsp: 0.5,
      tablespoon: 0.5,
      tablespoons: 1.0,
      cup: 4.0,
      bowl: 3.0,
      little: 0.5,
      lots: 2.0,
    },
    servingNutrition: {
      calories: 75,
      proteinG: 1.1,
      carbsG: 3.2,
      fatsG: 6.5,
    },
    assumptions: "1 standard serving of seasoned coconut chutney (~35g)",
  },
  {
    id: "peanut_chutney",
    name: "Peanut Chutney",
    aliases: ["peanut chutney", "groundnut chutney", "shengdana chutney"],
    category: "condiment",
    defaultServing: {
      unit: "serving",
      weightGrams: 35,
      description: "standard condiment serving (~35g / ~2 tbsp)",
    },
    supportedUnits: {
      serving: 1,
      tbsp: 0.5,
      tablespoon: 0.5,
      tablespoons: 1.0,
    },
    servingNutrition: {
      calories: 120,
      proteinG: 4.5,
      carbsG: 5.0,
      fatsG: 9.5,
    },
    assumptions: "1 standard serving of roasted peanut chutney (~35g)",
  },

  // ─── FLATBREADS & GRAINS ────────────────────────────────────
  {
    id: "chapati",
    name: "Chapati / Roti",
    aliases: ["chapati", "chapatis", "chapatti", "chapaties", "roti", "rotis", "phulka", "fulka", "wheat roti"],
    category: "grain",
    defaultServing: {
      unit: "piece",
      weightGrams: 35,
      description: "medium whole-wheat roti / chapati (~35g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      roti: 1,
      serving: 2,
    },
    servingNutrition: {
      calories: 85,
      proteinG: 3.0,
      carbsG: 17.0,
      fatsG: 0.5,
    },
    assumptions: "standard whole wheat chapati/roti without excess oil (~35g each)",
  },
  {
    id: "paratha",
    name: "Paratha",
    aliases: ["paratha", "parathas", "plain paratha", "parotta"],
    category: "grain",
    defaultServing: {
      unit: "piece",
      weightGrams: 60,
      description: "medium shallow-fried paratha (~60g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      serving: 1,
    },
    servingNutrition: {
      calories: 180,
      proteinG: 3.5,
      carbsG: 25.0,
      fatsG: 7.5,
    },
    assumptions: "standard pan-fried whole wheat paratha (~60g each)",
  },
  {
    id: "cooked_rice",
    name: "Cooked Rice",
    aliases: ["rice", "cooked rice", "white rice", "steamed rice", "boiled rice", "chawal", "cooked white rice"],
    category: "grain",
    defaultServing: {
      unit: "bowl",
      weightGrams: 150,
      description: "medium bowl cooked rice (~150g)",
    },
    supportedUnits: {
      bowl: 1,
      cup: 1.1,
      plate: 1.6,
      serving: 1,
    },
    per100g: {
      calories: 130,
      proteinG: 2.7,
      carbsG: 28.0,
      fatsG: 0.3,
    },
    servingNutrition: {
      calories: 195,
      proteinG: 4.0,
      carbsG: 42.0,
      fatsG: 0.5,
    },
    assumptions: "standard steamed white rice (~130 kcal per 100g cooked)",
  },
  {
    id: "curd_rice",
    name: "Curd Rice",
    aliases: ["curd rice", "thayir sadam", "dahi chawal", "dahi bhat", "yogurt rice"],
    category: "composite",
    defaultServing: {
      unit: "bowl",
      weightGrams: 200,
      description: "bowl of seasoned curd rice (~200g)",
    },
    supportedUnits: {
      bowl: 1,
      cup: 1,
      plate: 1.3,
      serving: 1,
    },
    servingNutrition: {
      calories: 230,
      proteinG: 6.0,
      carbsG: 34.0,
      fatsG: 7.5,
    },
    assumptions: "standard bowl of tempered curd rice (~200g)",
  },
  {
    id: "chicken_biryani",
    name: "Chicken Biryani",
    aliases: ["chicken biryani", "biryani", "chicken dum biryani", "hyderabadi biryani"],
    category: "composite",
    defaultServing: {
      unit: "plate",
      weightGrams: 350,
      description: "standard restaurant/home plate chicken biryani (~350g)",
    },
    supportedUnits: {
      plate: 1,
      bowl: 0.7,
      serving: 1,
      cup: 0.6,
    },
    per100g: {
      calories: 148,
      proteinG: 7.4,
      carbsG: 17.7,
      fatsG: 5.1,
    },
    servingNutrition: {
      calories: 520,
      proteinG: 26.0,
      carbsG: 62.0,
      fatsG: 18.0,
    },
    assumptions: "1 standard plate of chicken biryani (~350g with chicken pieces)",
  },

  // ─── LENTILS & CURRIES ──────────────────────────────────────
  {
    id: "dal",
    name: "Dal (Tadka / Lentil Curry)",
    aliases: ["dal", "daal", "dal tadka", "yellow dal", "moong dal", "toor dal", "dal fry"],
    category: "composite",
    defaultServing: {
      unit: "bowl",
      weightGrams: 150,
      description: "standard bowl of cooked yellow dal (~150g)",
    },
    supportedUnits: {
      bowl: 1,
      cup: 1,
      serving: 1,
      plate: 1.3,
    },
    servingNutrition: {
      calories: 150,
      proteinG: 7.5,
      carbsG: 19.0,
      fatsG: 4.5,
    },
    assumptions: "standard bowl of tempered yellow lentil dal (~150g)",
  },
  {
    id: "paneer",
    name: "Paneer (Cottage Cheese)",
    aliases: ["paneer", "cottage cheese", "indian cottage cheese", "raw paneer"],
    category: "protein",
    defaultServing: {
      unit: "piece",
      weightGrams: 50,
      description: "serving of fresh paneer (~50g)",
    },
    supportedUnits: {
      piece: 1,
      serving: 1,
      cup: 2.5,
    },
    per100g: {
      calories: 265,
      proteinG: 18.0,
      carbsG: 3.5,
      fatsG: 20.0,
    },
    servingNutrition: {
      calories: 132,
      proteinG: 9.0,
      carbsG: 1.8,
      fatsG: 10.0,
    },
    assumptions: "fresh full-fat dairy paneer (~265 kcal per 100g)",
  },
  {
    id: "chicken_curry",
    name: "Chicken Curry",
    aliases: ["chicken curry", "chicken gravy", "chicken masala", "murgh curry", "chicken"],
    category: "protein",
    defaultServing: {
      unit: "bowl",
      weightGrams: 200,
      description: "portion of home-style chicken curry (~200g)",
    },
    supportedUnits: {
      bowl: 1,
      cup: 1,
      serving: 1,
      plate: 1.2,
    },
    servingNutrition: {
      calories: 240,
      proteinG: 24.0,
      carbsG: 6.0,
      fatsG: 13.0,
    },
    assumptions: "standard serving of home-style chicken curry with gravy (~200g)",
  },
  {
    id: "fish_curry",
    name: "Fish Curry",
    aliases: ["fish curry", "meen curry", "fish gravy", "fish"],
    category: "protein",
    defaultServing: {
      unit: "bowl",
      weightGrams: 180,
      description: "portion of fish curry (~180g)",
    },
    supportedUnits: {
      bowl: 1,
      cup: 1,
      serving: 1,
    },
    servingNutrition: {
      calories: 210,
      proteinG: 22.0,
      carbsG: 4.0,
      fatsG: 11.0,
    },
    assumptions: "standard serving of traditional fish curry (~180g)",
  },
  {
    id: "vegetable_curry",
    name: "Vegetable Curry / Sabzi",
    aliases: ["vegetable curry", "veg curry", "sabzi", "subzi", "mixed veg", "vegetables"],
    category: "vegetable",
    defaultServing: {
      unit: "bowl",
      weightGrams: 150,
      description: "bowl of mixed vegetable curry / sabzi (~150g)",
    },
    supportedUnits: {
      bowl: 1,
      cup: 1,
      serving: 1,
    },
    servingNutrition: {
      calories: 120,
      proteinG: 2.5,
      carbsG: 14.0,
      fatsG: 6.0,
    },
    assumptions: "standard bowl of spiced seasonal mixed vegetable sabzi (~150g)",
  },

  // ─── EGGS & PROTEINS ────────────────────────────────────────
  {
    id: "egg",
    name: "Egg (Whole / Boiled)",
    aliases: ["egg", "eggs", "boiled egg", "boiled eggs", "poached egg", "hard boiled egg"],
    category: "protein",
    defaultServing: {
      unit: "piece",
      weightGrams: 50,
      description: "1 large boiled whole egg (~50g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      egg: 1,
      eggs: 1,
      serving: 2,
    },
    servingNutrition: {
      calories: 72,
      proteinG: 6.3,
      carbsG: 0.4,
      fatsG: 4.8,
    },
    assumptions: "large whole boiled egg (~50g each)",
  },
  {
    id: "omelette",
    name: "Omelette",
    aliases: ["omelette", "omelet", "egg omelette", "masala omelette", "fried egg"],
    category: "protein",
    defaultServing: {
      unit: "piece",
      weightGrams: 65,
      description: "1-egg cooked omelette with light oil & onions (~65g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      serving: 1,
    },
    servingNutrition: {
      calories: 110,
      proteinG: 6.5,
      carbsG: 1.5,
      fatsG: 8.8,
    },
    assumptions: "pan-cooked 1-egg omelette prepared with light cooking oil",
  },

  // ─── DAIRY & BEVERAGES ──────────────────────────────────────
  {
    id: "milk",
    name: "Milk (Whole Cow's Milk)",
    aliases: ["milk", "glass milk", "cow milk", "whole milk", "dairy milk"],
    category: "dairy",
    defaultServing: {
      unit: "glass",
      weightGrams: 250,
      description: "1 standard glass of milk (~250ml)",
    },
    supportedUnits: {
      glass: 1,
      glasses: 1,
      cup: 0.96, // 1 cup = 240ml
      ml: 0.004, // 1 ml = 1/250 of glass
      liter: 4.0,
      serving: 1,
    },
    per100g: {
      calories: 60,
      proteinG: 3.2,
      carbsG: 4.8,
      fatsG: 3.2,
    },
    servingNutrition: {
      calories: 150,
      proteinG: 8.0,
      carbsG: 12.0,
      fatsG: 8.0,
    },
    assumptions: "1 standard glass of whole milk (~250ml)",
  },
  {
    id: "curd",
    name: "Curd / Plain Dahi (Yogurt)",
    aliases: ["curd", "dahi", "yogurt", "plain curd", "plain yogurt"],
    category: "dairy",
    defaultServing: {
      unit: "cup",
      weightGrams: 150,
      description: "1 cup / small bowl of fresh curd (~150g)",
    },
    supportedUnits: {
      cup: 1,
      bowl: 1,
      serving: 1,
      tbsp: 0.15,
    },
    servingNutrition: {
      calories: 95,
      proteinG: 5.5,
      carbsG: 7.0,
      fatsG: 5.0,
    },
    assumptions: "standard cup of plain homemade whole milk curd (~150g)",
  },
  {
    id: "coffee",
    name: "Coffee (with Milk & Sugar)",
    aliases: ["coffee", "filter coffee", "instant coffee", "coffee with milk and sugar", "milk coffee"],
    category: "beverage",
    defaultServing: {
      unit: "cup",
      weightGrams: 150,
      description: "1 cup coffee brewed with milk and 1 tsp sugar (~150ml)",
    },
    supportedUnits: {
      cup: 1,
      cups: 1,
      glass: 1.2,
      mug: 1.6,
      serving: 1,
    },
    servingNutrition: {
      calories: 70,
      proteinG: 2.2,
      carbsG: 9.5,
      fatsG: 2.5,
    },
    assumptions: "standard cup of brewed coffee with cow milk and ~1 tsp sugar (~150ml)",
  },
  {
    id: "tea",
    name: "Tea / Chai (with Milk & Sugar)",
    aliases: ["tea", "chai", "masala chai", "milk tea", "tea with milk and sugar"],
    category: "beverage",
    defaultServing: {
      unit: "cup",
      weightGrams: 150,
      description: "1 cup brewed tea with milk and 1 tsp sugar (~150ml)",
    },
    supportedUnits: {
      cup: 1,
      cups: 1,
      glass: 1.1,
      mug: 1.5,
      serving: 1,
    },
    servingNutrition: {
      calories: 65,
      proteinG: 2.0,
      carbsG: 9.0,
      fatsG: 2.5,
    },
    assumptions: "standard cup of brewed tea/chai with milk and ~1 tsp sugar (~150ml)",
  },

  // ─── FRUITS & SPREADS ───────────────────────────────────────
  {
    id: "banana",
    name: "Banana",
    aliases: ["banana", "bananas", "ripe banana", "kela"],
    category: "fruit",
    defaultServing: {
      unit: "piece",
      weightGrams: 118,
      description: "1 medium fresh banana (~118g peeled)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      banana: 1,
      medium: 1,
      small: 0.75,
      large: 1.25,
      serving: 1,
    },
    servingNutrition: {
      calories: 105,
      proteinG: 1.3,
      carbsG: 27.0,
      fatsG: 0.3,
    },
    assumptions: "1 medium whole banana (~118g peeled)",
  },
  {
    id: "apple",
    name: "Apple",
    aliases: ["apple", "apples", "one medium apple", "fresh apple", "seb"],
    category: "fruit",
    defaultServing: {
      unit: "piece",
      weightGrams: 182,
      description: "1 medium raw apple with skin (~182g)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      apple: 1,
      medium: 1,
      small: 0.8,
      large: 1.3,
      serving: 1,
    },
    servingNutrition: {
      calories: 95,
      proteinG: 0.5,
      carbsG: 25.0,
      fatsG: 0.3,
    },
    assumptions: "1 medium raw apple (~182g)",
  },
  {
    id: "orange",
    name: "Orange",
    aliases: ["orange", "oranges", "santara", "fresh orange"],
    category: "fruit",
    defaultServing: {
      unit: "piece",
      weightGrams: 130,
      description: "1 medium fresh orange (~130g peeled)",
    },
    supportedUnits: {
      piece: 1,
      pieces: 1,
      orange: 1,
      medium: 1,
      serving: 1,
    },
    servingNutrition: {
      calories: 62,
      proteinG: 1.2,
      carbsG: 15.0,
      fatsG: 0.2,
    },
    assumptions: "1 medium whole fresh orange (~130g peeled)",
  },
  {
    id: "peanut_butter",
    name: "Peanut Butter",
    aliases: ["peanut butter", "smooth peanut butter", "crunchy peanut butter"],
    category: "condiment",
    defaultServing: {
      unit: "tablespoon",
      weightGrams: 16,
      description: "1 level tablespoon (~16g)",
    },
    supportedUnits: {
      tablespoon: 1,
      tablespoons: 1,
      tbsp: 1,
      tbsps: 1,
      teaspoon: 0.33,
      tsp: 0.33,
      serving: 2, // 2 tbsp (32g) standard serving
    },
    per100g: {
      calories: 590,
      proteinG: 25.0,
      carbsG: 20.0,
      fatsG: 50.0,
    },
    servingNutrition: {
      calories: 95,
      proteinG: 4.0,
      carbsG: 3.5,
      fatsG: 8.0,
    },
    assumptions: "standard commercial peanut butter (~95 kcal per tablespoon)",
  },
];
