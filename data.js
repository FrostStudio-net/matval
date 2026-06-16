// Matval — gagnagrunnur fyrir uppskriftir og verð (dæmiverð frá Krónunni)
// Allar upphæðir í íslenskum krónum (kr)

const TAGS = {
  cheap: "Ódýrt",
  healthy: "Hollt",
  high_protein: "Próteinríkt",
  protein: "Próteinríkt",
  dairy_free: "Mjólkurlaust",
  dairyfree: "Mjólkurlaust",
  vegan: "Vegan",
  vegetarian: "Grænmetisfæði",
  muscle_gain: "Vöðvauppbygging",
  weight_loss: "Þyngdartap",
  quick: "Fljótlegt",
  family: "Fjölskylduvænt",
};

// Vörur: verð er fyrir tilgreint magn (einingaverð)
const PRODUCTS = {
  chicken_breast: { name: "Kjúklingabringur", unit: "kg", price: 2399, dairyfree: true, protein: true },
  rice: { name: "Hrísgrjón", unit: "kg", price: 399, dairyfree: true, vegan: true },
  eggs: { name: "Egg (10 stk)", unit: "pk", price: 699, dairyfree: true, vegetarian: true, protein: true },
  oats: { name: "Hafrar", unit: "kg", price: 349, dairyfree: true, vegan: true },
  milk: { name: "Mjólk", unit: "L", price: 189, vegetarian: true },
  oatmilk: { name: "Oat milk", unit: "L", price: 329, dairyfree: true, vegan: true },
  blueberries: { name: "Bláber (frosin)", unit: "pk 400g", price: 599, dairyfree: true, vegan: true },
  tuna: { name: "Túnfiskur (dós)", unit: "dós", price: 299, dairyfree: true, protein: true },
  pasta: { name: "Pasta", unit: "pk 500g", price: 259, dairyfree: true, vegan: true },
  tomato_sauce: { name: "Tómatsósa (pasta)", unit: "krukka", price: 399, dairyfree: true, vegan: true },
  bread: { name: "Brauð", unit: "stk", price: 459, vegetarian: true },
  butter: { name: "Smjör", unit: "pk", price: 549, vegetarian: true },
  mixed_veg: { name: "Grænmeti (frosið blandað)", unit: "pk 1kg", price: 499, dairyfree: true, vegan: true },
  soy_sauce: { name: "Sojasósa", unit: "fl", price: 399, dairyfree: true, vegan: true },
  yogurt_skyr: { name: "Skyr", unit: "pk 500g", price: 449, vegetarian: true, protein: true },
  banana: { name: "Bananar", unit: "kg", price: 349, dairyfree: true, vegan: true },
  ground_beef: { name: "Hakk (nautakjöt)", unit: "kg", price: 2199, dairyfree: true, protein: true },
  tortilla: { name: "Tortilla wraps", unit: "pk", price: 549, vegetarian: true },
  cheese: { name: "Ostur", unit: "pk 300g", price: 999, vegetarian: true, protein: true },
  onion: { name: "Laukur", unit: "kg", price: 249, dairyfree: true, vegan: true },
  garlic: { name: "Hvítlaukur", unit: "stk", price: 99, dairyfree: true, vegan: true },
  salmon: { name: "Lax (flök)", unit: "kg", price: 3299, dairyfree: true, protein: true },
  potatoes: { name: "Kartöflur", unit: "kg", price: 299, dairyfree: true, vegan: true },
  lentils: { name: "Linsubaunir (þurrkaðar)", unit: "pk 500g", price: 349, dairyfree: true, vegan: true },
  spinach: { name: "Spínat (frosið)", unit: "pk 450g", price: 449, dairyfree: true, vegan: true },
  carrots: { name: "Gulrætur", unit: "kg", price: 279, dairyfree: true, vegan: true },
  cucumber: { name: "Gúrka", unit: "stk", price: 249, dairyfree: true, vegan: true },
  tomato: { name: "Tómatar", unit: "kg", price: 599, dairyfree: true, vegan: true },
  peanut_butter: { name: "Hnetusmjör", unit: "krukka", price: 799, dairyfree: true, vegan: true },
  oil: { name: "Matarolía", unit: "fl", price: 599, dairyfree: true, vegan: true },
  apples: { name: "Epli", unit: "kg", price: 399, dairyfree: true, vegan: true },
  cottage_cheese: { name: "Kotasæla", unit: "pk 250g", price: 399, vegetarian: true, protein: true },
  chickpeas: { name: "Kjúklingabaunir", unit: "dós", price: 229, dairyfree: true, vegan: true, protein: true },
  black_beans: { name: "Svartar baunir", unit: "dós", price: 249, dairyfree: true, vegan: true, protein: true },
  kidney_beans: { name: "Nýrnabaunir", unit: "dós", price: 249, dairyfree: true, vegan: true, protein: true },
  tofu: { name: "Tófú", unit: "pk", price: 699, dairyfree: true, vegan: true, protein: true },
  coconut_milk: { name: "Kókosmjólk", unit: "dós", price: 329, dairyfree: true, vegan: true },
  noodles: { name: "Núðlur", unit: "pk", price: 349, dairyfree: true, vegan: true },
  spices: { name: "Krydd", unit: "stk", price: 299, dairyfree: true, vegan: true },
};

const INGREDIENT_META = {
  chicken_breast: { isVegan: false, isVegetarian: false, containsDairy: false, containsEgg: false, containsMeat: true, containsFish: false },
  rice: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  eggs: { isVegan: false, isVegetarian: true, containsDairy: false, containsEgg: true, containsMeat: false, containsFish: false },
  oats: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  milk: { isVegan: false, isVegetarian: true, containsDairy: true, containsEgg: false, containsMeat: false, containsFish: false },
  oatmilk: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  blueberries: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  tuna: { isVegan: false, isVegetarian: false, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: true },
  pasta: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  tomato_sauce: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  bread: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  butter: { isVegan: false, isVegetarian: true, containsDairy: true, containsEgg: false, containsMeat: false, containsFish: false },
  mixed_veg: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  soy_sauce: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  yogurt_skyr: { isVegan: false, isVegetarian: true, containsDairy: true, containsEgg: false, containsMeat: false, containsFish: false },
  banana: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  ground_beef: { isVegan: false, isVegetarian: false, containsDairy: false, containsEgg: false, containsMeat: true, containsFish: false },
  tortilla: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  cheese: { isVegan: false, isVegetarian: true, containsDairy: true, containsEgg: false, containsMeat: false, containsFish: false },
  onion: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  garlic: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  salmon: { isVegan: false, isVegetarian: false, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: true },
  potatoes: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  lentils: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  spinach: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  carrots: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  cucumber: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  tomato: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  peanut_butter: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  oil: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  apples: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  cottage_cheese: { isVegan: false, isVegetarian: true, containsDairy: true, containsEgg: false, containsMeat: false, containsFish: false },
  chickpeas: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  black_beans: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  kidney_beans: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  tofu: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  coconut_milk: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  noodles: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
  spices: { isVegan: true, isVegetarian: true, containsDairy: false, containsEgg: false, containsMeat: false, containsFish: false },
};

// Uppskriftir
// servingsBase = fjöldi skammta sem ingredients eru reiknaðir fyrir
const RECIPES = [
  {
    id: "overnight_oats_blueberries",
    name: "Overnight oats með bláberjum",
    type: "morgunmatur",
    servingsBase: 1,
    time: 5,
    calories: 380,
    protein: 14,
    tags: ["cheap", "healthy", "vegan", "dairyfree", "quick"],
    ingredients: [
      { key: "oats", amount: 0.06 },
      { key: "oatmilk", amount: 0.2 },
      { key: "blueberries", amount: 0.06 },
    ],
    steps: [
      "Settu hafra og oat milk í krukku eða skál.",
      "Bættu bláberjum við.",
      "Hrærðu saman og láttu standa í kæli yfir nótt (eða í minnst 1 klst).",
      "Borðað kalt um morguninn, hrærðu aftur fyrir mat.",
    ],
  },
  {
    id: "eggs_toast",
    name: "Egg og ristað brauð",
    type: "morgunmatur",
    servingsBase: 1,
    time: 10,
    calories: 420,
    protein: 22,
    tags: ["cheap", "healthy", "protein", "vegetarian", "quick"],
    ingredients: [
      { key: "eggs", amount: 0.2 },
      { key: "bread", amount: 0.25 },
      { key: "butter", amount: 0.02 },
    ],
    steps: [
      "Steiktu 2 egg á pönnu með smá smjöri.",
      "Ristaðu brauðsneiðar.",
      "Smyrðu smjöri á brauðið og settu eggin ofan á.",
      "Saltaðu og piprað eftir smekk.",
    ],
  },
  {
    id: "yogurt_banana_bowl",
    name: "Skyr með banana og hnetusmjöri",
    type: "morgunmatur",
    servingsBase: 1,
    time: 5,
    calories: 350,
    protein: 24,
    tags: ["cheap", "healthy", "protein", "vegetarian", "quick"],
    ingredients: [
      { key: "yogurt_skyr", amount: 0.3 },
      { key: "banana", amount: 0.15 },
      { key: "peanut_butter", amount: 0.03 },
    ],
    steps: [
      "Settu skyr í skál.",
      "Skerðu banana yfir.",
      "Bættu skeið af hnetusmjöri ofan á og blandaðu létt saman.",
    ],
  },
  {
    id: "chicken_rice_bowl",
    name: "Kjúklinga rice bowl",
    type: "hádegismatur",
    servingsBase: 4,
    time: 35,
    calories: 620,
    protein: 42,
    tags: ["healthy", "protein", "dairyfree", "family"],
    doubleBatch: true,
    ingredients: [
      { key: "chicken_breast", amount: 0.6 },
      { key: "rice", amount: 0.4 },
      { key: "mixed_veg", amount: 0.4 },
      { key: "soy_sauce", amount: 0.05 },
      { key: "garlic", amount: 2 },
      { key: "oil", amount: 0.03 },
    ],
    steps: [
      "Sjóddu hrísgrjónin (eldaðu tvöfalt magn ef þú vilt nota afganga á þriðjudag).",
      "Skerðu kjúklingabringur í bita og steiktu á pönnu með olíu og hvítlauk.",
      "Bættu grænmeti við pönnuna og steiktu áfram í 5–7 mín.",
      "Helltu sojasósu yfir og hrærðu saman.",
      "Settu hrísgrjón í skál og kjúkling/grænmeti ofan á.",
    ],
  },
  {
    id: "tuna_pasta",
    name: "Túnfisk pasta",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 25,
    calories: 540,
    protein: 30,
    tags: ["cheap", "quick", "protein", "family", "dairyfree"],
    ingredients: [
      { key: "pasta", amount: 1 },
      { key: "tuna", amount: 3 },
      { key: "tomato_sauce", amount: 1 },
      { key: "onion", amount: 0.2 },
      { key: "garlic", amount: 2 },
    ],
    steps: [
      "Sjóddu pastað eftir leiðbeiningum á pakka.",
      "Steiktu lauk og hvítlauk í potti.",
      "Bættu tómatsósu og túnfiski við og hitaðu í gegn.",
      "Blandaðu pastanu saman við sósuna og berðu fram.",
    ],
  },
  {
    id: "egg_fried_rice",
    name: "Eggja fried rice (úr afgöngum)",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 15,
    calories: 480,
    protein: 18,
    tags: ["cheap", "quick", "leftovers", "dairyfree"],
    usesLeftovers: "chicken_rice_bowl",
    ingredients: [
      { key: "eggs", amount: 0.4 },
      { key: "mixed_veg", amount: 0.3 },
      { key: "soy_sauce", amount: 0.04 },
      { key: "oil", amount: 0.02 },
    ],
    steps: [
      "Hitaðu olíu á pönnu á háum hita.",
      "Steiktu afganga hrísgrjón (frá mánudegi) í 2–3 mín.",
      "Bættu grænmeti og hrærðu áfram.",
      "Sláðu eggjum út í og hrærðu fljótt saman.",
      "Helltu sojasósu yfir og berðu fram heitt.",
    ],
  },
  {
    id: "chicken_wrap",
    name: "Kjúklingur wrap (úr afgöngum)",
    type: "hádegismatur",
    servingsBase: 4,
    time: 10,
    calories: 460,
    protein: 28,
    tags: ["cheap", "quick", "leftovers", "vegetarian-friendly"],
    usesLeftovers: "chicken_rice_bowl",
    ingredients: [
      { key: "tortilla", amount: 1 },
      { key: "cheese", amount: 0.3 },
      { key: "cucumber", amount: 0.5 },
      { key: "tomato", amount: 0.3 },
    ],
    steps: [
      "Hitaðu afgangs kjúkling stutt á pönnu eða í örbylgju.",
      "Skerðu gúrku og tómat í strimla.",
      "Settu kjúkling, ost og grænmeti á tortilla.",
      "Rúllaðu upp og skerðu í tvo hluta.",
    ],
  },
  {
    id: "lentil_soup",
    name: "Linsubaunasúpa",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 40,
    calories: 380,
    protein: 18,
    tags: ["cheap", "healthy", "vegan", "dairyfree", "family"],
    ingredients: [
      { key: "lentils", amount: 0.5 },
      { key: "carrots", amount: 0.3 },
      { key: "onion", amount: 0.3 },
      { key: "garlic", amount: 3 },
      { key: "tomato_sauce", amount: 0.5 },
    ],
    steps: [
      "Skerðu lauk, gulrætur og hvítlauk smátt og steiktu í potti.",
      "Bættu linsubaunum, tómatsósu og vatni (ca 1,5 L) við.",
      "Sjóddu við vægan hita í 25–30 mín þar til linsur eru meyrar.",
      "Saltaðu og kryddaðu eftir smekk.",
    ],
  },
  {
    id: "salmon_potatoes",
    name: "Lax með kartöflum og spínati",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 35,
    calories: 560,
    protein: 38,
    tags: ["healthy", "protein", "dairyfree", "family"],
    ingredients: [
      { key: "salmon", amount: 0.6 },
      { key: "potatoes", amount: 0.8 },
      { key: "spinach", amount: 0.3 },
      { key: "oil", amount: 0.03 },
    ],
    steps: [
      "Skerðu kartöflur í báta og bakaðu í ofni við 200°C í 25 mín.",
      "Kryddaðu laxinn og steiktu á pönnu eða baka í 12–15 mín.",
      "Steiktu spínat stutt á pönnu með olíu.",
      "Berðu allt fram saman.",
    ],
  },
  {
    id: "beef_taco_bowl",
    name: "Nautahakk taco bowl",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 25,
    calories: 600,
    protein: 36,
    tags: ["protein", "family", "dairyfree", "quick"],
    ingredients: [
      { key: "ground_beef", amount: 0.6 },
      { key: "rice", amount: 0.3 },
      { key: "tomato", amount: 0.3 },
      { key: "cucumber", amount: 0.3 },
      { key: "cheese", amount: 0.2 },
      { key: "onion", amount: 0.2 },
    ],
    steps: [
      "Sjóddu hrísgrjón.",
      "Steiktu hakk með lauk og kryddi (paprikukrydd, kúmen, salt).",
      "Skerðu tómat og gúrku í bita.",
      "Settu hrísgrjón í skál, hakk ofan á og grænmeti og ost yfir.",
    ],
  },
  {
    id: "cottage_cheese_toast",
    name: "Kotasæla á rúgbrauði",
    type: "morgunmatur",
    servingsBase: 1,
    time: 5,
    calories: 290,
    protein: 20,
    tags: ["cheap", "quick", "protein", "vegetarian"],
    ingredients: [
      { key: "cottage_cheese", amount: 0.3 },
      { key: "bread", amount: 0.25 },
      { key: "tomato", amount: 0.1 },
    ],
    steps: [
      "Ristaðu brauð.",
      "Smyrðu kotasælu yfir.",
      "Skerðu tómat í sneiðar og settu ofan á.",
    ],
  },
  {
    id: "veggie_pasta",
    name: "Grænmetis pasta með tómatsósu",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 25,
    calories: 460,
    protein: 14,
    tags: ["cheap", "vegan", "dairyfree", "quick", "family"],
    ingredients: [
      { key: "pasta", amount: 1 },
      { key: "tomato_sauce", amount: 1 },
      { key: "mixed_veg", amount: 0.4 },
      { key: "garlic", amount: 2 },
      { key: "oil", amount: 0.02 },
    ],
    steps: [
      "Sjóddu pasta.",
      "Steiktu grænmeti og hvítlauk í olíu.",
      "Bættu tómatsósu við og hitaðu í gegn.",
      "Blandaðu saman við pastað.",
    ],
  },
  {
    id: "apple_oat_snack",
    name: "Epli með hnetusmjöri",
    type: "morgunmatur",
    servingsBase: 1,
    time: 3,
    calories: 220,
    protein: 6,
    tags: ["cheap", "quick", "vegan", "dairyfree"],
    ingredients: [
      { key: "apples", amount: 0.2 },
      { key: "peanut_butter", amount: 0.03 },
    ],
    steps: [
      "Skerðu eplið í báta.",
      "Dýfðu í hnetusmjör og borðaðu.",
    ],
  },
  {
    id: "oatmeal_banana_peanut",
    name: "Hafragrautur með banana og hnetusmjöri",
    type: "morgunmatur",
    servingsBase: 1,
    time: 8,
    calories: 410,
    protein: 13,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "weight_loss", "quick"],
    ingredients: [
      { key: "oats", amount: 0.08 },
      { key: "oatmilk", amount: 0.25 },
      { key: "banana", amount: 0.15 },
      { key: "peanut_butter", amount: 0.025 },
    ],
    steps: [
      "Sjóðið hafra með haframjólk í nokkrar mínútur.",
      "Skerið banana yfir og bætið hnetusmjöri við.",
    ],
  },
  {
    id: "chickpea_curry_rice",
    name: "Kjúklingabaunakarrý með hrísgrjónum",
    type: "hádegismatur",
    servingsBase: 4,
    time: 30,
    calories: 560,
    protein: 20,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    doubleBatch: true,
    ingredients: [
      { key: "chickpeas", amount: 2 },
      { key: "rice", amount: 0.35 },
      { key: "coconut_milk", amount: 1 },
      { key: "tomato_sauce", amount: 0.5 },
      { key: "onion", amount: 0.3 },
      { key: "garlic", amount: 2 },
      { key: "spices", amount: 0.2 },
      { key: "oil", amount: 0.02 },
    ],
    steps: [
      "Sjóðið hrísgrjón.",
      "Steikið lauk, hvítlauk og krydd í olíu.",
      "Bætið kjúklingabaunum, kókosmjólk og tómatsósu út í og látið malla.",
    ],
  },
  {
    id: "bean_burrito_bowl",
    name: "Bauna burrito skál",
    type: "hádegismatur",
    servingsBase: 4,
    time: 25,
    calories: 520,
    protein: 19,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "quick"],
    ingredients: [
      { key: "black_beans", amount: 2 },
      { key: "rice", amount: 0.35 },
      { key: "tomato", amount: 0.4 },
      { key: "cucumber", amount: 0.5 },
      { key: "onion", amount: 0.2 },
      { key: "spices", amount: 0.2 },
    ],
    steps: [
      "Sjóðið hrísgrjón.",
      "Hitið baunir með kryddi.",
      "Berið fram með tómötum, gúrku og lauk.",
    ],
  },
  {
    id: "tofu_stir_fry",
    name: "Tófú stir fry",
    type: "hádegismatur",
    servingsBase: 4,
    time: 25,
    calories: 500,
    protein: 24,
    tags: ["vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "muscle_gain", "quick"],
    ingredients: [
      { key: "tofu", amount: 2 },
      { key: "rice", amount: 0.35 },
      { key: "mixed_veg", amount: 0.6 },
      { key: "soy_sauce", amount: 0.06 },
      { key: "garlic", amount: 2 },
      { key: "oil", amount: 0.03 },
    ],
    steps: [
      "Sjóðið hrísgrjón.",
      "Steikið tófú, grænmeti og hvítlauk í olíu.",
      "Hellið sojasósu yfir og berið fram með hrísgrjónum.",
    ],
  },
  {
    id: "peanut_noodles",
    name: "Hnetusmjörsnúðlur",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 20,
    calories: 590,
    protein: 18,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "quick", "family"],
    ingredients: [
      { key: "noodles", amount: 1 },
      { key: "peanut_butter", amount: 0.12 },
      { key: "mixed_veg", amount: 0.5 },
      { key: "soy_sauce", amount: 0.06 },
      { key: "garlic", amount: 2 },
      { key: "oil", amount: 0.02 },
    ],
    steps: [
      "Sjóðið núðlur.",
      "Blandið hnetusmjöri og sojasósu í sósu.",
      "Steikið grænmeti og blandið öllu saman.",
    ],
  },
  {
    id: "rice_and_beans",
    name: "Hrísgrjón og baunir",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 25,
    calories: 510,
    protein: 18,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    ingredients: [
      { key: "rice", amount: 0.4 },
      { key: "kidney_beans", amount: 2 },
      { key: "tomato_sauce", amount: 0.5 },
      { key: "onion", amount: 0.2 },
      { key: "garlic", amount: 2 },
      { key: "spices", amount: 0.2 },
    ],
    steps: [
      "Sjóðið hrísgrjón.",
      "Hitið baunir með tómatsósu, lauk, hvítlauk og kryddi.",
      "Berið saman fram.",
    ],
  },
  {
    id: "vegan_chili",
    name: "Vegan chili",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 35,
    calories: 470,
    protein: 21,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    doubleBatch: true,
    ingredients: [
      { key: "kidney_beans", amount: 2 },
      { key: "black_beans", amount: 1 },
      { key: "tomato_sauce", amount: 1 },
      { key: "mixed_veg", amount: 0.4 },
      { key: "onion", amount: 0.3 },
      { key: "garlic", amount: 2 },
      { key: "spices", amount: 0.3 },
    ],
    steps: [
      "Steikið lauk og hvítlauk.",
      "Bætið baunum, grænmeti, tómatsósu og kryddi út í.",
      "Látið malla þar til chili er þykkt og bragðmikið.",
    ],
  },
];

RECIPES.push(
  {
    id: "banana_oat_smoothie",
    name: "Banana hafra smoothie",
    type: "morgunmatur",
    servingsBase: 1,
    time: 5,
    calories: 360,
    protein: 11,
    tags: ["cheap", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "banana", amount: 0.2 },
      { key: "oats", amount: 0.04 },
      { key: "oatmilk", amount: 0.25 },
      { key: "peanut_butter", amount: 0.02 },
    ],
    steps: ["Settu allt í blandara.", "Blandaðu þar til drykkurinn er mjúkur."],
  },
  {
    id: "peanut_banana_toast",
    name: "Ristað brauð með banana og hnetusmjöri",
    type: "morgunmatur",
    servingsBase: 1,
    time: 6,
    calories: 390,
    protein: 12,
    tags: ["cheap", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "bread", amount: 0.2 },
      { key: "banana", amount: 0.15 },
      { key: "peanut_butter", amount: 0.03 },
    ],
    steps: ["Ristaðu brauð.", "Smyrðu hnetusmjöri og settu banana ofan á."],
  },
  {
    id: "skyr_oats_apple",
    name: "Skyrskál með höfrum og epli",
    type: "morgunmatur",
    servingsBase: 1,
    time: 5,
    calories: 370,
    protein: 26,
    tags: ["cheap", "quick", "vegetarian", "high_protein", "protein"],
    ingredients: [
      { key: "yogurt_skyr", amount: 0.3 },
      { key: "oats", amount: 0.04 },
      { key: "apples", amount: 0.15 },
    ],
    steps: ["Settu skyr í skál.", "Bættu höfrum og niðurskornu epli yfir."],
  },
  {
    id: "spinach_egg_toast",
    name: "Eggjabrauð með spínati",
    type: "morgunmatur",
    servingsBase: 1,
    time: 10,
    calories: 430,
    protein: 24,
    tags: ["cheap", "quick", "vegetarian", "high_protein", "protein"],
    ingredients: [
      { key: "eggs", amount: 0.2 },
      { key: "bread", amount: 0.2 },
      { key: "spinach", amount: 0.08 },
      { key: "oil", amount: 0.01 },
    ],
    steps: ["Steiktu egg og spínat.", "Berðu fram á ristuðu brauði."],
  },
  {
    id: "apple_cinnamon_oats",
    name: "Epla hafragrautur",
    type: "morgunmatur",
    servingsBase: 1,
    time: 8,
    calories: 340,
    protein: 10,
    tags: ["cheap", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "oats", amount: 0.07 },
      { key: "oatmilk", amount: 0.22 },
      { key: "apples", amount: 0.15 },
      { key: "spices", amount: 0.02 },
    ],
    steps: ["Sjóðið hafra með haframjólk.", "Skerið epli yfir og kryddið létt."],
  },
  {
    id: "tuna_cucumber_sandwich",
    name: "Túnfisksamloka með gúrku",
    type: "hádegismatur",
    servingsBase: 1,
    time: 8,
    calories: 430,
    protein: 29,
    tags: ["cheap", "quick", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "bread", amount: 0.25 },
      { key: "tuna", amount: 1 },
      { key: "cucumber", amount: 0.2 },
      { key: "tomato", amount: 0.1 },
    ],
    steps: ["Opnaðu túnfisk.", "Settu á brauð með gúrku og tómat."],
  },
  {
    id: "egg_salad_sandwich",
    name: "Eggjasamloka með grænmeti",
    type: "hádegismatur",
    servingsBase: 1,
    time: 12,
    calories: 450,
    protein: 24,
    tags: ["cheap", "quick", "vegetarian", "high_protein", "protein"],
    ingredients: [
      { key: "eggs", amount: 0.2 },
      { key: "bread", amount: 0.25 },
      { key: "cucumber", amount: 0.15 },
      { key: "tomato", amount: 0.15 },
    ],
    steps: ["Sjóðið eða steikið egg.", "Setjið egg og grænmeti í samloku."],
  },
  {
    id: "chickpea_salad_wrap",
    name: "Kjúklingabauna salat wrap",
    type: "hádegismatur",
    servingsBase: 1,
    time: 10,
    calories: 480,
    protein: 17,
    tags: ["cheap", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "tortilla", amount: 0.25 },
      { key: "chickpeas", amount: 0.5 },
      { key: "cucumber", amount: 0.2 },
      { key: "tomato", amount: 0.2 },
      { key: "spices", amount: 0.03 },
    ],
    steps: ["Stappaðu kjúklingabaunir létt.", "Settu í tortilla með grænmeti."],
  },
  {
    id: "tofu_cucumber_rice_lunch",
    name: "Tófú hrísgrjónaskál með gúrku",
    type: "hádegismatur",
    servingsBase: 2,
    time: 18,
    calories: 500,
    protein: 23,
    tags: ["quick", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "tofu", amount: 1 },
      { key: "rice", amount: 0.18 },
      { key: "cucumber", amount: 0.3 },
      { key: "soy_sauce", amount: 0.03 },
    ],
    steps: ["Hitið tófú og hrísgrjón.", "Berið fram með gúrku og sojasósu."],
  },
  {
    id: "salmon_potato_lunch_salad",
    name: "Lax og kartöflusalat",
    type: "hádegismatur",
    servingsBase: 2,
    time: 15,
    calories: 520,
    protein: 34,
    tags: ["healthy", "quick", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "salmon", amount: 0.25 },
      { key: "potatoes", amount: 0.35 },
      { key: "spinach", amount: 0.12 },
      { key: "cucumber", amount: 0.2 },
    ],
    steps: ["Notaðu eldaðan lax eða steiktu fljótt.", "Blandaðu með kartöflum og grænmeti."],
  },
  {
    id: "chicken_salad_sandwich",
    name: "Kjúklingasamloka með grænmeti",
    type: "hádegismatur",
    servingsBase: 2,
    time: 12,
    calories: 500,
    protein: 34,
    tags: ["quick", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "chicken_breast", amount: 0.25 },
      { key: "bread", amount: 0.4 },
      { key: "cucumber", amount: 0.2 },
      { key: "tomato", amount: 0.2 },
    ],
    steps: ["Hitið eða steikið kjúkling.", "Setjið í samloku með grænmeti."],
  },
  {
    id: "black_bean_tomato_wrap",
    name: "Svartbauna wrap með tómat",
    type: "hádegismatur",
    servingsBase: 1,
    time: 10,
    calories: 470,
    protein: 17,
    tags: ["cheap", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "tortilla", amount: 0.25 },
      { key: "black_beans", amount: 0.5 },
      { key: "tomato", amount: 0.2 },
      { key: "cucumber", amount: 0.15 },
      { key: "spices", amount: 0.03 },
    ],
    steps: ["Hitið baunir með kryddi.", "Setjið í wrap með grænmeti."],
  },
  {
    id: "lentil_tomato_soup_lunch",
    name: "Fljótleg linsu tómatsúpa",
    type: "hádegismatur",
    servingsBase: 2,
    time: 20,
    calories: 390,
    protein: 18,
    tags: ["cheap", "healthy", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "lentils", amount: 0.22 },
      { key: "tomato_sauce", amount: 0.4 },
      { key: "carrots", amount: 0.15 },
      { key: "onion", amount: 0.15 },
    ],
    steps: ["Sjóðið allt saman í potti.", "Látið malla þar til linsur eru mjúkar."],
  },
  {
    id: "cottage_cheese_veg_sandwich",
    name: "Kotasælu samloka með tómat",
    type: "hádegismatur",
    servingsBase: 1,
    time: 6,
    calories: 390,
    protein: 25,
    tags: ["cheap", "quick", "vegetarian", "high_protein", "protein"],
    ingredients: [
      { key: "bread", amount: 0.25 },
      { key: "cottage_cheese", amount: 0.25 },
      { key: "tomato", amount: 0.15 },
      { key: "cucumber", amount: 0.15 },
    ],
    steps: ["Smyrðu kotasælu á brauð.", "Bættu tómat og gúrku við."],
  },
  {
    id: "tuna_rice_lunch_bowl",
    name: "Túnfisk hrísgrjónaskál",
    type: "hádegismatur",
    servingsBase: 2,
    time: 15,
    calories: 510,
    protein: 31,
    tags: ["cheap", "quick", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "tuna", amount: 2 },
      { key: "rice", amount: 0.2 },
      { key: "cucumber", amount: 0.25 },
      { key: "soy_sauce", amount: 0.03 },
    ],
    steps: ["Blandaðu túnfiski og hrísgrjónum.", "Berðu fram með gúrku og sojasósu."],
  },
  {
    id: "chickpea_cucumber_toast",
    name: "Kjúklingabauna toast með gúrku",
    type: "hádegismatur",
    servingsBase: 1,
    time: 8,
    calories: 420,
    protein: 16,
    tags: ["cheap", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "bread", amount: 0.25 },
      { key: "chickpeas", amount: 0.45 },
      { key: "cucumber", amount: 0.2 },
      { key: "spices", amount: 0.02 },
    ],
    steps: ["Stappaðu baunir með kryddi.", "Settu á ristað brauð með gúrku."],
  },
  {
    id: "tuna_pasta_lunch_salad",
    name: "Túnfisk pastasalat",
    type: "hádegismatur",
    servingsBase: 2,
    time: 15,
    calories: 520,
    protein: 30,
    tags: ["cheap", "quick", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "pasta", amount: 0.35 },
      { key: "tuna", amount: 2 },
      { key: "cucumber", amount: 0.25 },
      { key: "tomato", amount: 0.2 },
    ],
    steps: ["Sjóðið pasta.", "Kælið og blandið með túnfiski og grænmeti."],
  },
  {
    id: "tofu_noodle_lunch_salad",
    name: "Tófú núðlusalat",
    type: "hádegismatur",
    servingsBase: 2,
    time: 18,
    calories: 520,
    protein: 24,
    tags: ["quick", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "tofu", amount: 1 },
      { key: "noodles", amount: 0.5 },
      { key: "mixed_veg", amount: 0.25 },
      { key: "soy_sauce", amount: 0.04 },
    ],
    steps: ["Sjóðið núðlur.", "Blandið með tófú, grænmeti og sojasósu."],
  },
  {
    id: "vegetable_soup_bread",
    name: "Grænmetissúpa með brauði",
    type: "hádegismatur",
    servingsBase: 2,
    time: 20,
    calories: 360,
    protein: 10,
    tags: ["cheap", "healthy", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "mixed_veg", amount: 0.35 },
      { key: "carrots", amount: 0.2 },
      { key: "onion", amount: 0.15 },
      { key: "bread", amount: 0.3 },
    ],
    steps: ["Sjóðið grænmeti í potti.", "Berið fram með brauði."],
  },
  {
    id: "rice_bean_lunch_bowl",
    name: "Hrísgrjóna og bauna hádegisskál",
    type: "hádegismatur",
    servingsBase: 2,
    time: 18,
    calories: 500,
    protein: 18,
    tags: ["cheap", "quick", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    ingredients: [
      { key: "rice", amount: 0.22 },
      { key: "kidney_beans", amount: 1 },
      { key: "cucumber", amount: 0.25 },
      { key: "tomato", amount: 0.25 },
    ],
    steps: ["Hitið hrísgrjón og baunir.", "Setjið ferskt grænmeti yfir."],
  },
  {
    id: "chicken_cucumber_wrap",
    name: "Kjúklinga gúrku wrap",
    type: "hádegismatur",
    servingsBase: 2,
    time: 15,
    calories: 520,
    protein: 36,
    tags: ["quick", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "chicken_breast", amount: 0.28 },
      { key: "tortilla", amount: 0.5 },
      { key: "cucumber", amount: 0.25 },
      { key: "tomato", amount: 0.2 },
    ],
    steps: ["Hitið kjúkling.", "Setjið í tortilla með grænmeti."],
  },
  {
    id: "egg_rice_lunch_bowl",
    name: "Eggja hrísgrjónaskál",
    type: "hádegismatur",
    servingsBase: 2,
    time: 15,
    calories: 480,
    protein: 22,
    tags: ["cheap", "quick", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "eggs", amount: 0.4 },
      { key: "rice", amount: 0.2 },
      { key: "mixed_veg", amount: 0.25 },
      { key: "soy_sauce", amount: 0.03 },
    ],
    steps: ["Steikið egg og grænmeti.", "Berið fram með hrísgrjónum."],
  },
  {
    id: "chicken_pasta_tomato",
    name: "Kjúklingapasta með tómatsósu",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 30,
    calories: 610,
    protein: 40,
    tags: ["family", "high_protein", "protein"],
    ingredients: [
      { key: "chicken_breast", amount: 0.6 },
      { key: "pasta", amount: 0.8 },
      { key: "tomato_sauce", amount: 1 },
      { key: "onion", amount: 0.2 },
      { key: "garlic", amount: 2 },
    ],
    steps: ["Sjóðið pasta.", "Steikið kjúkling og blandið með tómatsósu."],
  },
  {
    id: "tofu_peanut_rice",
    name: "Tófú með hnetusósu og hrísgrjónum",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 28,
    calories: 620,
    protein: 26,
    tags: ["vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    ingredients: [
      { key: "tofu", amount: 2 },
      { key: "rice", amount: 0.4 },
      { key: "peanut_butter", amount: 0.12 },
      { key: "mixed_veg", amount: 0.5 },
      { key: "soy_sauce", amount: 0.05 },
    ],
    steps: ["Sjóðið hrísgrjón.", "Steikið tófú og grænmeti og blandið hnetusósu út í."],
  },
  {
    id: "salmon_rice_veg",
    name: "Lax með hrísgrjónum og grænmeti",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 30,
    calories: 590,
    protein: 38,
    tags: ["healthy", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    ingredients: [
      { key: "salmon", amount: 0.6 },
      { key: "rice", amount: 0.35 },
      { key: "mixed_veg", amount: 0.45 },
      { key: "soy_sauce", amount: 0.04 },
    ],
    steps: ["Eldið lax.", "Berið fram með hrísgrjónum og grænmeti."],
  },
  {
    id: "lentil_tomato_pasta",
    name: "Linsupasta með tómatsósu",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 30,
    calories: 560,
    protein: 22,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    ingredients: [
      { key: "lentils", amount: 0.35 },
      { key: "pasta", amount: 0.7 },
      { key: "tomato_sauce", amount: 1 },
      { key: "onion", amount: 0.25 },
      { key: "garlic", amount: 2 },
    ],
    steps: ["Sjóðið linsur og pasta.", "Blandið saman með tómatsósu."],
  },
  {
    id: "chicken_potato_tray",
    name: "Kjúklingur með kartöflum og gulrótum",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 40,
    calories: 580,
    protein: 42,
    tags: ["healthy", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    ingredients: [
      { key: "chicken_breast", amount: 0.7 },
      { key: "potatoes", amount: 0.8 },
      { key: "carrots", amount: 0.4 },
      { key: "oil", amount: 0.04 },
      { key: "spices", amount: 0.05 },
    ],
    steps: ["Setjið allt á ofnplötu.", "Bakið þar til kjúklingur og kartöflur eru elduð."],
  },
  {
    id: "black_bean_pasta_chili",
    name: "Svartbauna pasta chili",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 30,
    calories: 570,
    protein: 21,
    tags: ["cheap", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "family"],
    ingredients: [
      { key: "black_beans", amount: 2 },
      { key: "pasta", amount: 0.6 },
      { key: "tomato_sauce", amount: 1 },
      { key: "mixed_veg", amount: 0.4 },
      { key: "spices", amount: 0.08 },
    ],
    steps: ["Sjóðið pasta.", "Hitið baunir og grænmeti í tómatsósu og blandið saman."],
  },
  {
    id: "egg_vegetable_noodles",
    name: "Eggjanúðlur með grænmeti",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 22,
    calories: 520,
    protein: 24,
    tags: ["cheap", "quick", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "eggs", amount: 0.8 },
      { key: "noodles", amount: 1 },
      { key: "mixed_veg", amount: 0.5 },
      { key: "soy_sauce", amount: 0.06 },
    ],
    steps: ["Sjóðið núðlur.", "Steikið egg og grænmeti og blandið saman."],
  },
  {
    id: "tuna_potato_plate",
    name: "Túnfiskur með kartöflum og spínati",
    type: "kvöldmatur",
    servingsBase: 4,
    time: 25,
    calories: 520,
    protein: 32,
    tags: ["cheap", "healthy", "dairy_free", "dairyfree", "high_protein", "protein"],
    ingredients: [
      { key: "tuna", amount: 3 },
      { key: "potatoes", amount: 0.8 },
      { key: "spinach", amount: 0.25 },
      { key: "oil", amount: 0.03 },
    ],
    steps: ["Sjóðið kartöflur.", "Berið fram með túnfiski og léttsteiktu spínati."],
  },
  {
    id: "chili_leftover_wrap",
    name: "Vegan chili wrap úr afgöngum",
    type: "hádegismatur",
    servingsBase: 4,
    time: 8,
    calories: 430,
    protein: 16,
    tags: ["cheap", "quick", "leftovers", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    usesLeftovers: "vegan_chili",
    ingredients: [
      { key: "tortilla", amount: 1 },
      { key: "cucumber", amount: 0.3 },
      { key: "tomato", amount: 0.3 },
    ],
    steps: ["Hitaðu chili afganga.", "Settu í tortilla með gúrku og tómat."],
  },
  {
    id: "curry_leftover_soup",
    name: "Karrý súpa úr afgöngum",
    type: "hádegismatur",
    servingsBase: 4,
    time: 10,
    calories: 420,
    protein: 17,
    tags: ["cheap", "quick", "leftovers", "vegan", "vegetarian", "dairy_free", "dairyfree"],
    usesLeftovers: "chickpea_curry_rice",
    ingredients: [
      { key: "carrots", amount: 0.2 },
      { key: "spinach", amount: 0.2 },
    ],
    steps: ["Hitaðu karrý afganga með vatni.", "Bættu gulrótum og spínati út í."],
  },
  {
    id: "beef_taco_leftover_wrap",
    name: "Taco wrap úr afgöngum",
    type: "hádegismatur",
    servingsBase: 4,
    time: 8,
    calories: 480,
    protein: 25,
    tags: ["quick", "leftovers", "high_protein", "protein"],
    usesLeftovers: "beef_taco_bowl",
    ingredients: [
      { key: "tortilla", amount: 1 },
      { key: "cucumber", amount: 0.3 },
      { key: "tomato", amount: 0.3 },
    ],
    steps: ["Hitaðu taco afganga.", "Settu í tortilla með fersku grænmeti."],
  },
  {
    id: "salmon_leftover_sandwich",
    name: "Laxa samloka úr afgöngum",
    type: "hádegismatur",
    servingsBase: 4,
    time: 8,
    calories: 430,
    protein: 27,
    tags: ["quick", "leftovers", "dairy_free", "dairyfree", "high_protein", "protein"],
    usesLeftovers: "salmon_potatoes",
    ingredients: [
      { key: "bread", amount: 1 },
      { key: "cucumber", amount: 0.3 },
      { key: "spinach", amount: 0.2 },
    ],
    steps: ["Settu kaldan eða hitaðan lax í samloku.", "Bættu gúrku og spínati við."],
  },
  {
    id: "tofu_leftover_wrap",
    name: "Tófú wrap úr afgöngum",
    type: "hádegismatur",
    servingsBase: 4,
    time: 8,
    calories: 440,
    protein: 20,
    tags: ["quick", "leftovers", "vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein"],
    usesLeftovers: "tofu_stir_fry",
    ingredients: [
      { key: "tortilla", amount: 1 },
      { key: "cucumber", amount: 0.3 },
      { key: "soy_sauce", amount: 0.02 },
    ],
    steps: ["Hitaðu tófú afganga.", "Settu í tortilla með gúrku."],
  }
);

function recipeMealScores(recipe) {
  const text = `${recipe.name} ${recipe.id} ${recipe.tags.join(" ")}`.toLocaleLowerCase("is-IS");
  const hasAny = (words) => words.some((word) => text.includes(word));
  const isCookedMain = recipe.time >= 20 || recipe.calories >= 500 || recipe.protein >= 25;
  const isSimple = recipe.time <= 15 || recipe.tags.includes("quick");
  const isHighProtein = recipe.protein >= 25 || recipe.tags.includes("high_protein") || recipe.tags.includes("protein");

  let breakfastScore = recipe.type === "morgunmatur" ? 70 : 0;
  let lunchScore = recipe.type === "hádegismatur" ? 60 : 0;
  let dinnerScore = recipe.type === "kvöldmatur" ? 70 : 0;

  if (hasAny(["oats", "overnight", "hafra", "grautur", "porridge", "fruit", "banana", "epli", "skyr", "yogurt", "smoothie", "toast", "egg"])) breakfastScore += 45;
  if (hasAny(["wrap", "burrito", "salat", "súpa", "supa", "leftover", "afgöng", "sandwich", "brauð", "bowl", "skál"])) lunchScore += 40;
  if (hasAny(["pasta", "karrý", "curry", "chili", "stir fry", "kjúkling", "lax", "fisk", "hrísgrjón", "rice", "taco"])) dinnerScore += 45;

  if (isSimple) {
    lunchScore += 15;
    dinnerScore -= 5;
  }

  if (isCookedMain) {
    dinnerScore += 25;
    breakfastScore -= 40;
  }

  if (isHighProtein && isCookedMain) {
    dinnerScore += 15;
    lunchScore -= 5;
  }

  if (recipe.doubleBatch) {
    dinnerScore += 20;
    lunchScore -= 10;
  }

  if (recipe.usesLeftovers) {
    lunchScore += 35;
    dinnerScore -= 15;
  }

  if (recipe.calories >= 560) dinnerScore += 15;
  if (recipe.calories <= 420) breakfastScore += 10;

  return { breakfastScore, lunchScore, dinnerScore };
}

function recipePlanningMeta(recipe) {
  const text = `${recipe.name} ${recipe.id} ${recipe.tags.join(" ")}`.toLocaleLowerCase("is-IS");
  const proteinPriority = [
    "chicken_breast",
    "salmon",
    "tuna",
    "ground_beef",
    "eggs",
    "yogurt_skyr",
    "cottage_cheese",
    "tofu",
    "lentils",
    "chickpeas",
    "black_beans",
    "kidney_beans",
  ];
  const carbPriority = ["oats", "rice", "pasta", "bread", "tortilla", "potatoes", "noodles"];
  const vegetableKeys = ["mixed_veg", "spinach", "carrots", "cucumber", "tomato", "onion"];
  const ingredientKeys = recipe.ingredients.map((ing) => ing.key);
  const primaryProtein = proteinPriority.find((key) => ingredientKeys.includes(key)) || null;
  const primaryCarb = carbPriority.find((key) => ingredientKeys.includes(key)) || null;
  const vegetables = vegetableKeys.filter((key) => ingredientKeys.includes(key));
  const beanKeys = ["lentils", "chickpeas", "black_beans", "kidney_beans"];
  const beanCount = ingredientKeys.filter((key) => beanKeys.includes(key)).length;
  const scores = recipeMealScores(recipe);
  const bestScore = Math.max(scores.breakfastScore, scores.lunchScore, scores.dinnerScore);
  const mealRole = scores.breakfastScore === bestScore && scores.breakfastScore >= 70
    ? "breakfast"
    : scores.dinnerScore === bestScore && scores.dinnerScore >= 80
      ? "dinner"
      : scores.lunchScore === bestScore && scores.lunchScore >= 65
        ? "lunch"
        : "flexible";

  return {
    ...scores,
    mealRole,
    primaryProtein,
    primaryCarb,
    vegetables,
    isBeanHeavy: beanCount >= 1,
    isRiceBased: ingredientKeys.includes("rice"),
    isPastaBased: ingredientKeys.includes("pasta"),
    isBowlStyle: text.includes("bowl") || text.includes("skál"),
    isFishMeal: ingredientKeys.includes("salmon") || ingredientKeys.includes("tuna"),
    isChickenMeal: ingredientKeys.includes("chicken_breast"),
    isVegetarianMeal: recipe.tags.includes("vegetarian") || recipe.tags.includes("vegan"),
    leftoverFriendly: Boolean(recipe.doubleBatch),
  };
}

RECIPES.forEach((recipe) => {
  if (!("imageUrl" in recipe)) recipe.imageUrl = null;
  if (!("imageAlt" in recipe)) recipe.imageAlt = recipe.name;

  const metas = recipe.ingredients.map((ing) => INGREDIENT_META[ing.key]).filter(Boolean);
  const allVegan = metas.every((meta) => meta.isVegan);
  const allVegetarian = metas.every((meta) => meta.isVegetarian);
  const dairyFree = metas.every((meta) => !meta.containsDairy);
  const highProtein = recipe.protein >= 20;
  const cheap = recipe.tags.includes("cheap");
  const muscleGain = recipe.protein >= 25 || recipe.calories >= 520;
  const weightLoss = recipe.calories <= 450 || recipe.tags.includes("healthy");
  const recalculatedTags = new Set(["vegan", "vegetarian", "dairy_free", "dairyfree", "high_protein", "protein", "muscle_gain", "weight_loss"]);
  const requiredTags = [
    allVegan ? "vegan" : null,
    allVegetarian ? "vegetarian" : null,
    dairyFree ? "dairy_free" : null,
    dairyFree ? "dairyfree" : null,
    highProtein ? "high_protein" : null,
    highProtein ? "protein" : null,
    cheap ? "cheap" : null,
    muscleGain ? "muscle_gain" : null,
    weightLoss ? "weight_loss" : null,
  ].filter(Boolean);

  recipe.tags = [...new Set([...recipe.tags.filter((tag) => !recalculatedTags.has(tag)), ...requiredTags])];
  Object.assign(recipe, recipePlanningMeta(recipe));
});

RECIPES.forEach((recipe) => {
  if (!recipe.usesLeftovers) return;
  const sourceRecipe = RECIPES.find((candidate) => candidate.id === recipe.usesLeftovers);
  if (!sourceRecipe) return;

  recipe.primaryProtein = recipe.primaryProtein || sourceRecipe.primaryProtein;
  recipe.primaryCarb = recipe.primaryCarb || sourceRecipe.primaryCarb;
  recipe.isBeanHeavy = recipe.isBeanHeavy || sourceRecipe.isBeanHeavy;
  recipe.isRiceBased = recipe.isRiceBased || sourceRecipe.isRiceBased;
  recipe.isPastaBased = recipe.isPastaBased || sourceRecipe.isPastaBased;
  recipe.isBowlStyle = recipe.isBowlStyle || sourceRecipe.isBowlStyle;
  recipe.isFishMeal = recipe.isFishMeal || sourceRecipe.isFishMeal;
  recipe.isChickenMeal = recipe.isChickenMeal || sourceRecipe.isChickenMeal;
  recipe.isVegetarianMeal = recipe.isVegetarianMeal && sourceRecipe.isVegetarianMeal;
});

if (typeof window !== "undefined") {
  window.TAGS = TAGS;
  window.PRODUCTS = PRODUCTS;
  window.INGREDIENT_META = INGREDIENT_META;
  window.RECIPES = RECIPES;
}

if (typeof module !== "undefined") {
  module.exports = { TAGS, PRODUCTS, INGREDIENT_META, RECIPES };
}
