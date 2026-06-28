(function priceShoppingListModule(global) {
  function getPriceMode() {
    return global.MatvalPricingConfig?.PRICE_MODE || "estimated";
  }

  function getPriceSourceLabel(pricedItems = []) {
    if (!pricedItems.length) return "Áætlað verð";
    const hasStore = pricedItems.some((item) => item.priceSource === "store");
    const hasReference = pricedItems.some((item) => item.priceSource === "reference");
    const hasEstimated = pricedItems.some((item) => item.priceSource === "estimated" || item.isEstimated || item.estimated);
    const stale = pricedItems.some((item) => item.isStale || item.stale);
    const storeNames = [...new Set(pricedItems.filter((item) => item.priceSource === "store").map((item) => item.storeName || item.sourceName).filter(Boolean))];

    if (stale) return "Verð gæti hafa breyst";
    if (hasStore && hasEstimated) {
      if (storeNames.length === 1 && storeNames[0] === "Krónan") return "Sum verð eru frá Krónunni, önnur áætluð";
      return "Sum verð eru frá verslun, önnur áætluð";
    }
    if (hasStore && hasReference) {
      if (storeNames.length === 1 && storeNames[0] === "Krónan") return "Sum verð eru frá Krónunni, önnur verðviðmið";
      return "Sum verð eru frá verslun, önnur verðviðmið";
    }
    if (hasStore) {
      if (storeNames.length === 1 && storeNames[0] === "Krónan") return "Verð frá Krónunni";
      return "Verð frá verslun";
    }
    if (hasReference && hasEstimated) return "Áætlað verð · byggt á verðviðmiðum";
    if (hasReference) return "Áætlað verð · byggt á verðviðmiðum";
    return "Áætlað verð";
  }

  function applyEstimatedPrices(shoppingList, selectedStore) {
    const estimated = global.MatvalEstimatedPrices?.applyEstimatedPrices;
    if (!estimated) throw new Error("Estimated pricing module is not loaded");
    return estimated(shoppingList, selectedStore);
  }

  function priceShoppingListSync(shoppingList = [], selectedStore = null) {
    const mode = getPriceMode();
    if (mode === "reference") {
      const reference = global.MatvalReferencePriceSource?.priceFromReferenceSourcesSync;
      if (reference) return reference(shoppingList, selectedStore);
      return applyEstimatedPrices(shoppingList, selectedStore);
    }

    if (mode === "cached") {
      const cached = global.MatvalCachedPriceSource?.priceFromCachedSourcesSync;
      if (cached) return cached(shoppingList, selectedStore);
      const reference = global.MatvalReferencePriceSource?.priceFromReferenceSourcesSync;
      if (reference) return reference(shoppingList, selectedStore);
      return applyEstimatedPrices(shoppingList, selectedStore);
    }

    if (mode !== "estimated") {
      console.warn(`${mode} pricing is async/not enabled in this flow; falling back to estimated prices`);
    }
    return applyEstimatedPrices(shoppingList, selectedStore);
  }

  async function priceShoppingList(shoppingList = [], selectedStore = null) {
    const mode = getPriceMode();

    if (mode === "estimated") {
      return applyEstimatedPrices(shoppingList, selectedStore);
    }

    if (mode === "cached") {
      const cached = global.MatvalCachedPriceSource?.priceFromCachedSources;
      if (!cached) return applyEstimatedPrices(shoppingList, selectedStore);
      return cached(shoppingList, selectedStore);
    }

    if (mode === "reference") {
      const reference = global.MatvalReferencePriceSource?.priceFromReferenceSources;
      if (!reference) return applyEstimatedPrices(shoppingList, selectedStore);
      return reference(shoppingList, selectedStore);
    }

    if (mode === "live") {
      const liveSource = global.MatvalKronanPriceSource;
      if (!liveSource?.isDebugOrAdminPage?.()) {
        console.warn("Live pricing is disabled in normal user flow");
        return applyEstimatedPrices(shoppingList, selectedStore);
      }
      return liveSource.priceFromLiveDebugSource(shoppingList, selectedStore);
    }

    return applyEstimatedPrices(shoppingList, selectedStore);
  }

  global.MatvalPricing = {
    priceShoppingList,
    priceShoppingListSync,
    getPriceSourceLabel,
  };

  if (typeof module !== "undefined") {
    module.exports = { priceShoppingList, priceShoppingListSync, getPriceSourceLabel };
  }
})(typeof window !== "undefined" ? window : globalThis);
