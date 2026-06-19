(function cachedPriceSourceModule(global) {
  async function priceFromCachedSources(shoppingList = [], selectedStore = null) {
    // Future production path:
    // 1. Query Supabase store_price_snapshots for selected store/product matches.
    // 2. Fall back to reference sources.
    // 3. Fall back to Matval estimates.
    const estimated = global.MatvalEstimatedPrices?.applyEstimatedPrices;
    if (!estimated) throw new Error("Estimated pricing module is not loaded");
    return estimated(shoppingList, selectedStore);
  }

  global.MatvalCachedPriceSource = {
    priceFromCachedSources,
  };

  if (typeof module !== "undefined") {
    module.exports = { priceFromCachedSources };
  }
})(typeof window !== "undefined" ? window : globalThis);
