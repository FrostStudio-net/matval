(function cachedPriceSourceModule(global) {
  async function priceFromCachedSources(shoppingList = [], selectedStore = null) {
    // Future production path:
    // 1. Query Supabase store_price_snapshots for selected-store direct matches.
    // 2. Query selected-store reference snapshots.
    // 3. Fall back to Krónan cached/manual product matches.
    // 4. Fall back to same-product reference averages from other MVP stores.
    // 5. Fall back to category/package averages.
    // 6. Fall back to Matval estimates.
    const reference = global.MatvalReferencePriceSource?.priceFromReferenceSources;
    if (reference) return reference(shoppingList, selectedStore);

    const estimated = global.MatvalEstimatedPrices?.applyEstimatedPrices;
    if (!estimated) throw new Error("Estimated pricing module is not loaded");
    return estimated(shoppingList, selectedStore);
  }

  function priceFromCachedSourcesSync(shoppingList = [], selectedStore = null) {
    // Browser sync path cannot query Supabase directly. Use loaded/manual snapshots
    // through the reference source, then fall back to Matval estimates.
    const reference = global.MatvalReferencePriceSource?.priceFromReferenceSourcesSync;
    if (reference) return reference(shoppingList, selectedStore);

    const estimated = global.MatvalEstimatedPrices?.applyEstimatedPrices;
    if (!estimated) throw new Error("Estimated pricing module is not loaded");
    return estimated(shoppingList, selectedStore);
  }

  global.MatvalCachedPriceSource = {
    priceFromCachedSources,
    priceFromCachedSourcesSync,
  };

  if (typeof module !== "undefined") {
    module.exports = { priceFromCachedSources, priceFromCachedSourcesSync };
  }
})(typeof window !== "undefined" ? window : globalThis);
