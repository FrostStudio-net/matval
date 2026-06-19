(function estimatedPricesModule(global) {
  function numberOrZero(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function normalizeEstimatedItem(item, selectedStore) {
    const price = numberOrZero(item.mockPrice ?? item.estimatedPrice ?? item.totalPrice ?? item.price);
    const unitPrice = numberOrZero(item.unitPrice ?? item.price ?? price);
    return {
      ...item,
      price,
      totalPrice: price,
      estimatedPrice: price,
      mockPrice: numberOrZero(item.mockPrice ?? price),
      unitPrice,
      matchedProductName: null,
      productName: null,
      nameFromStore: null,
      productNameMatched: null,
      productId: null,
      barcode: null,
      sku: null,
      packageSize: null,
      packageCount: null,
      amount: item.amount,
      size: item.size || item.packageSize || null,
      observedAt: null,
      fetchedAt: null,
      image: null,
      priceSource: "estimated",
      source: "estimated",
      sourceName: "Matval estimate",
      storeName: selectedStore || null,
      sourceLabel: "Áætlað verð",
      confidence: item.confidence || "medium",
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
