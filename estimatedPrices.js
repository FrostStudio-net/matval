(function estimatedPricesModule(global) {
  const STORE_NAMES = {
    kronan: "Krónan",
    bonus: "Bónus",
    netto: "Nettó",
    pris: "Prís",
    hagkaup: "Hagkaup",
  };

  function storeDisplayName(store) {
    return STORE_NAMES[store] || store || null;
  }

  function numberOrZero(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  const ESTIMATED_PRICING_META = {
    onion: { pricingType: "buy_unit", defaultBuyUnit: "1 stk", minPurchaseAmount: 1, estimatedUnitPrice: 179, unitType: "stk" },
    garlic: { pricingType: "buy_unit", defaultBuyUnit: "1 stk", minPurchaseAmount: 1, estimatedUnitPrice: 149, unitType: "stk" },
    cucumber: { pricingType: "buy_unit", defaultBuyUnit: "1 stk", minPurchaseAmount: 1, estimatedUnitPrice: 249, unitType: "stk" },
    tomato: { pricingType: "buy_unit", defaultBuyUnit: "1 pakkning/kg", minPurchaseAmount: 1, estimatedUnitPrice: 599, unitType: "kg" },
    potatoes: { pricingType: "buy_unit", defaultBuyUnit: "1 kg", minPurchaseAmount: 1, estimatedUnitPrice: 299, unitType: "kg" },
    carrots: { pricingType: "buy_unit", defaultBuyUnit: "1 kg", minPurchaseAmount: 1, estimatedUnitPrice: 279, unitType: "kg" },
    apples: { pricingType: "buy_unit", defaultBuyUnit: "1 stk", minPurchaseAmount: 1, estimatedUnitPrice: 99, unitType: "stk" },
    banana: { pricingType: "buy_unit", defaultBuyUnit: "1 stk", minPurchaseAmount: 1, estimatedUnitPrice: 89, unitType: "stk" },
    eggs: { pricingType: "buy_unit", defaultBuyUnit: "10 stk", minPurchaseAmount: 1, estimatedUnitPrice: 699, packageSize: "10 stk", unitType: "pk" },
    rice: { pricingType: "buy_unit", defaultBuyUnit: "1 kg", minPurchaseAmount: 1, estimatedUnitPrice: 399, packageSize: "1 kg", unitType: "kg" },
    oats: { pricingType: "buy_unit", defaultBuyUnit: "1 kg", minPurchaseAmount: 1, estimatedUnitPrice: 349, packageSize: "1 kg", unitType: "kg" },
    pasta: { pricingType: "buy_unit", defaultBuyUnit: "500g", minPurchaseAmount: 1, estimatedUnitPrice: 259, packageSize: "500g", unitType: "pk" },
    tuna: { pricingType: "buy_unit", defaultBuyUnit: "1 dós", minPurchaseAmount: 1, estimatedUnitPrice: 299, packageSize: "1 dós", unitType: "dós" },
    yogurt_skyr: { pricingType: "buy_unit", defaultBuyUnit: "500g", minPurchaseAmount: 1, estimatedUnitPrice: 449, packageSize: "500g", unitType: "pk" },
    oatmilk: { pricingType: "buy_unit", defaultBuyUnit: "1 L", minPurchaseAmount: 1, estimatedUnitPrice: 329, packageSize: "1 L", unitType: "L" },
    milk: { pricingType: "buy_unit", defaultBuyUnit: "1 L", minPurchaseAmount: 1, estimatedUnitPrice: 189, packageSize: "1 L", unitType: "L" },
    oil: { pricingType: "pantry", defaultBuyUnit: "1 flaska", estimatedUnitPrice: 699, pantryLikely: true, packageSize: "1 flaska", unitType: "fl" },
    spices: { pricingType: "pantry", defaultBuyUnit: "1 stk", estimatedUnitPrice: 399, pantryLikely: true, packageSize: "1 stk", unitType: "stk" },
    soy_sauce: { pricingType: "pantry", defaultBuyUnit: "1 flaska", estimatedUnitPrice: 399, pantryLikely: true, packageSize: "1 flaska", unitType: "fl" },
  };

  function realisticEstimate(item) {
    const meta = ESTIMATED_PRICING_META[item.key] || null;
    const proportionalPrice = numberOrZero(item.mockPrice ?? item.estimatedPrice ?? item.totalPrice ?? item.price);
    const proportionalUnitPrice = numberOrZero(item.unitPrice ?? item.price ?? proportionalPrice);
    if (!meta) {
      return {
        totalPrice: proportionalPrice,
        displayPrice: proportionalPrice,
        unitPrice: proportionalUnitPrice,
        packageCount: item.packageCount || null,
        packageSize: item.packageSize || null,
        purchaseLabel: item.amount && item.unit
          ? `${Number(item.amount).toFixed(item.amount < 1 ? 2 : 0)} ${item.unit}`
          : "áætlað",
        excludeFromTotal: false,
      };
    }

    const amount = numberOrZero(item.amount || item.quantity || 0);
    const itemUnit = String(item.unit || "").toLowerCase();
    const metaUnit = String(meta.unitType || "").toLowerCase();
    const canRoundByAmount = amount > 0 && meta.minPurchaseAmount && (
      itemUnit === metaUnit ||
      (itemUnit === "kg" && metaUnit === "kg") ||
      (itemUnit === "l" && metaUnit === "l") ||
      (itemUnit === "pk" && metaUnit === "pk") ||
      (itemUnit === "dós" && metaUnit === "dós") ||
      (itemUnit === "stk" && metaUnit === "stk")
    );
    const packageCount = meta.pricingType === "pantry"
      ? 1
      : Math.max(1, Math.ceil(canRoundByAmount ? amount / meta.minPurchaseAmount : numberOrZero(item.packageCount || 1)));
    const displayPrice = numberOrZero(meta.estimatedUnitPrice);
    const totalPrice = meta.pantryLikely ? 0 : displayPrice * packageCount;
    return {
      totalPrice,
      displayPrice,
      unitPrice: displayPrice,
      packageCount,
      packageSize: meta.packageSize || meta.defaultBuyUnit,
      purchaseLabel: `${packageCount > 1 ? `${packageCount} × ` : ""}${meta.defaultBuyUnit}`,
      excludeFromTotal: Boolean(meta.pantryLikely),
      optionalPrice: meta.pantryLikely ? displayPrice : null,
      pricingType: meta.pricingType,
      defaultBuyUnit: meta.defaultBuyUnit,
      minPurchaseAmount: meta.minPurchaseAmount || null,
      pantryLikely: Boolean(meta.pantryLikely),
      unitType: meta.unitType || null,
    };
  }

  function normalizeEstimatedItem(item, selectedStore) {
    const estimate = realisticEstimate(item);
    return {
      ...item,
      price: estimate.totalPrice,
      totalPrice: estimate.totalPrice,
      estimatedPrice: estimate.totalPrice,
      displayPrice: estimate.displayPrice,
      optionalPrice: estimate.optionalPrice,
      mockPrice: numberOrZero(item.mockPrice ?? estimate.totalPrice),
      unitPrice: estimate.unitPrice,
      matchedProductName: null,
      productName: null,
      nameFromStore: null,
      productNameMatched: null,
      productId: null,
      barcode: null,
      sku: null,
      packageSize: estimate.packageSize,
      packageCount: estimate.packageCount,
      purchaseLabel: estimate.purchaseLabel,
      excludeFromTotal: estimate.excludeFromTotal,
      pricingType: estimate.pricingType || "estimated",
      defaultBuyUnit: estimate.defaultBuyUnit || null,
      minPurchaseAmount: estimate.minPurchaseAmount,
      pantryLikely: estimate.pantryLikely || false,
      unitType: estimate.unitType || null,
      amount: item.amount,
      recipeAmount: item.amount,
      size: estimate.packageSize || item.size || item.packageSize || null,
      observedAt: null,
      fetchedAt: null,
      image: null,
      priceSource: "estimated",
      source: "estimated",
      sourceType: "estimated",
      sourceName: "Matval estimate",
      storeName: storeDisplayName(selectedStore),
      sourceLabel: estimate.excludeFromTotal ? "Athuga heima" : "Áætlað verð",
      confidence: item.confidence || "medium",
      fallbackReason: estimate.excludeFromTotal
        ? "Pantry-likely item; not included in total"
        : item.fallbackReason || "No reference/store price source was used in estimated mode",
      estimated: true,
      isEstimated: true,
      kronanProduct: null,
    };
  }

  function applyEstimatedPrices(shoppingList = [], selectedStore = null) {
    const items = shoppingList.map((item) => normalizeEstimatedItem(item, selectedStore));
    return {
      items,
      totalPrice: items.reduce((total, item) => total + numberOrZero(item.totalPrice), 0),
      priceMode: "estimated",
      sourceLabel: "Áætlað verð",
    };
  }

  global.MatvalEstimatedPrices = {
    applyEstimatedPrices,
    normalizeEstimatedItem,
  };

  if (typeof module !== "undefined") {
    module.exports = { applyEstimatedPrices, normalizeEstimatedItem };
  }
})(typeof window !== "undefined" ? window : globalThis);
