const assert = require("assert");
const { KRONAN_PRODUCT_MAPPING } = require("../kronan-product-mapping");
const { calculatePackageCount, chooseBestProduct, mappingForIngredientName, normalizeProduct, packageSizeLabel, parsePackageSize } = require("../server");

const mapping = KRONAN_PRODUCT_MAPPING.kidney_beans;
const products = [
  normalizeProduct({
    sku: "gestus-400",
    name: "Gestus rauðar nýrnabaunir 400g",
    price: 150,
    categoryPath: ["Matvara", "Niðursuða", "Baunir"],
    available: true,
  }),
  normalizeProduct({
    sku: "gron-420",
    name: "Grön Balance rauðar nýrnabaunir 420g",
    price: 187,
    categoryPath: ["Matvara", "Niðursuða", "Baunir"],
    available: true,
  }),
  normalizeProduct({
    sku: "biona-400",
    name: "Biona rauðar nýrnabaunir 400g",
    price: 299,
    categoryPath: ["Matvara", "Niðursuða", "Baunir"],
    available: true,
  }),
  normalizeProduct({
    sku: "mix-999",
    name: "Nýrnabauna chili mix tilbúinn réttur 400g",
    price: 99,
    categoryPath: ["Tilbúinn matur"],
    available: true,
  }),
];

const result = chooseBestProduct(products, mapping, { goals: ["cheap"] });
assert(result.product, "expected a matched kidney bean product");
assert.strictEqual(result.product.sku, "gestus-400");
assert.strictEqual(result.product.name, "Gestus rauðar nýrnabaunir 400g");
assert.strictEqual(result.product.price, 150);

const packageSize = parsePackageSize(result.product, mapping);
assert.strictEqual(packageSizeLabel(packageSize), "400g");

console.log("Krónan kidney bean matching regression passed");

const cucumberMapping = KRONAN_PRODUCT_MAPPING.cucumber;
const cucumber = normalizeProduct({
  sku: "agurkur-1",
  name: "Agúrkur",
  price: 249,
  categoryPath: ["Grænmeti"],
  available: true,
});
const cucumberResult = chooseBestProduct([cucumber], cucumberMapping, { goals: [] });
assert(cucumberResult.product, "expected a matched cucumber product");
assert.strictEqual(cucumberResult.product.name, "Agúrkur");
assert.strictEqual(cucumberResult.product.price, 249);
assert.strictEqual(calculatePackageCount(0.25, parsePackageSize(cucumberResult.product, cucumberMapping), "stk"), 1);

console.log("Krónan cucumber package-count regression passed");

assert.strictEqual(mappingForIngredientName("Nýrnabaunir").key, "kidney_beans");
assert.strictEqual(mappingForIngredientName("Gúrka").key, "cucumber");
assert.strictEqual(mappingForIngredientName("Tómatsósa (pasta)").key, "tomato_sauce");

console.log("Krónan match-products ingredient-name inference passed");

const salmonMapping = KRONAN_PRODUCT_MAPPING.salmon;
const salmonProduct = normalizeProduct({
  sku: "landlax-1",
  name: "Landlax lax í limesmjöri",
  price: 1769,
  categoryPath: ["Fiskur"],
  available: true,
});
const salmonPackageSize = parsePackageSize(salmonProduct, salmonMapping);
assert.strictEqual(calculatePackageCount(0.15, salmonPackageSize, "kg"), 1);
assert.strictEqual(salmonProduct.price * calculatePackageCount(0.15, salmonPackageSize, "kg"), 1769);

console.log("Krónan salmon checkout price regression passed");

const eggMapping = KRONAN_PRODUCT_MAPPING.eggs;
const eggResult = chooseBestProduct([
  normalizeProduct({
    sku: "kinder-egg",
    name: "Kinder Surprise egg súkkulaði",
    price: 199,
    categoryPath: ["Nammi"],
    available: true,
  }),
  normalizeProduct({
    sku: "egg-10",
    name: "Egg 10 stk",
    price: 699,
    categoryPath: ["Kælivara", "Egg"],
    available: true,
  }),
], eggMapping);
assert(eggResult.product, "expected real eggs to match");
assert.strictEqual(eggResult.product.sku, "egg-10");
assert(eggResult.candidates.find((candidate) => candidate.product.sku === "kinder-egg").rejectedBecause, "Kinder egg should be rejected");

console.log("Krónan egg strict matching regression passed");

const tunaMapping = KRONAN_PRODUCT_MAPPING.tuna;
const tunaResult = chooseBestProduct([
  normalizeProduct({
    sku: "cat-tuna",
    name: "GM Gold kattafóður með túnfiski",
    price: 149,
    categoryPath: ["Gæludýr"],
    available: true,
  }),
  normalizeProduct({
    sku: "tuna-can",
    name: "Túnfiskur í dós",
    price: 329,
    categoryPath: ["Niðursuða", "Fiskur"],
    available: true,
  }),
], tunaMapping);
assert(tunaResult.product, "expected canned tuna to match");
assert.strictEqual(tunaResult.product.sku, "tuna-can");
assert(tunaResult.candidates.find((candidate) => candidate.product.sku === "cat-tuna").rejectedBecause, "cat food should be rejected");

console.log("Krónan tuna strict matching regression passed");

const oatMilkMapping = KRONAN_PRODUCT_MAPPING.oatmilk;
const oatMilkResult = chooseBestProduct([
  normalizeProduct({
    sku: "choc-oat",
    name: "Haframjólk súkkulaði 1L",
    price: 199,
    categoryPath: ["Jurtamjólkurvara"],
    available: true,
  }),
  normalizeProduct({
    sku: "plain-oat",
    name: "Haframjólk 1L",
    price: 289,
    categoryPath: ["Jurtamjólkurvara"],
    available: true,
  }),
], oatMilkMapping);
assert(oatMilkResult.product, "expected plain oat milk to match");
assert.strictEqual(oatMilkResult.product.sku, "plain-oat");
assert(oatMilkResult.candidates.find((candidate) => candidate.product.sku === "choc-oat").rejectedBecause, "chocolate oat milk should be rejected");

console.log("Krónan oat milk strict matching regression passed");

const sauceMapping = KRONAN_PRODUCT_MAPPING.tomato_sauce;
const dairyFreeSauceResult = chooseBestProduct([
  normalizeProduct({
    sku: "carbonara",
    name: "Carbonara pastasósa með rjóma",
    price: 349,
    categoryPath: ["Pastasósur"],
    available: true,
  }),
  normalizeProduct({
    sku: "cheese-pasta",
    name: "Pasta með osti tilbúinn réttur",
    price: 299,
    categoryPath: ["Tilbúinn matur"],
    available: true,
  }),
  normalizeProduct({
    sku: "tomato-pasta",
    name: "Pastasósa með tómötum",
    price: 389,
    categoryPath: ["Pastasósur"],
    available: true,
  }),
], sauceMapping, { goals: ["dairy_free"] });
assert(dairyFreeSauceResult.product, "expected dairy-free pasta sauce to match");
assert.strictEqual(dairyFreeSauceResult.product.sku, "tomato-pasta");
assert(dairyFreeSauceResult.candidates.find((candidate) => candidate.product.sku === "carbonara").rejectedBecause, "carbonara should be rejected");
assert(dairyFreeSauceResult.candidates.find((candidate) => candidate.product.sku === "cheese-pasta").rejectedBecause, "cheese pasta should be rejected");

console.log("Krónan dairy-free sauce strict matching regression passed");

const noodleResult = chooseBestProduct([
  normalizeProduct({
    sku: "chicken-noodles",
    name: "Núðlur með kjúklingabragði",
    price: 129,
    categoryPath: ["Þurrvara"],
    available: true,
  }),
  normalizeProduct({
    sku: "rice-noodles",
    name: "Rice noodles",
    price: 299,
    categoryPath: ["Þurrvara"],
    available: true,
  }),
], KRONAN_PRODUCT_MAPPING.noodles);
assert(noodleResult.product, "expected plain noodles to match");
assert.strictEqual(noodleResult.product.sku, "rice-noodles");
assert(noodleResult.candidates.find((candidate) => candidate.product.sku === "chicken-noodles").rejectedBecause, "chicken-flavored noodles should be rejected");

console.log("Krónan noodle strict matching regression passed");

const pantryResult = chooseBestProduct([
  normalizeProduct({
    sku: "burger-spice",
    name: "Hamborgarakrydd",
    price: 399,
    categoryPath: ["Krydd"],
    available: true,
  }),
], KRONAN_PRODUCT_MAPPING.spices);
assert.strictEqual(pantryResult.product, null);
assert(pantryResult.candidates[0].rejectedBecause, "generic spices should not auto-match");

console.log("Krónan pantry strict matching regression passed");

[
  { mapping: KRONAN_PRODUCT_MAPPING.chicken_breast, product: { sku: "chicken", name: "Kjúklingabringur", price: 1899 } },
  { mapping: KRONAN_PRODUCT_MAPPING.salmon, product: { sku: "salmon", name: "Landlax laxaflök", price: 2178 } },
  { mapping: KRONAN_PRODUCT_MAPPING.tuna, product: { sku: "tuna", name: "Túnfiskur í dós", price: 329 } },
  { mapping: KRONAN_PRODUCT_MAPPING.eggs, product: { sku: "egg", name: "Egg 10 stk", price: 699 } },
  { mapping: KRONAN_PRODUCT_MAPPING.milk, product: { sku: "milk", name: "Nýmjólk 1L", price: 249 } },
  { mapping: KRONAN_PRODUCT_MAPPING.cheese, product: { sku: "cheese", name: "Gouda ostur", price: 799 } },
].forEach(({ mapping: veganMapping, product }) => {
  const veganResult = chooseBestProduct([
    normalizeProduct({ ...product, categoryPath: ["Matvara"], available: true }),
  ], veganMapping, { goals: ["vegan"] });
  assert.strictEqual(veganResult.product, null, `vegan should reject ${product.name}`);
  assert(veganResult.candidates[0].rejectedBecause, `${product.name} should include rejection reason`);
});

console.log("Krónan vegan dietary deny regression passed");
