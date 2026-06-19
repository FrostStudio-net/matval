(function referencePriceSourceModule(global) {
  async function priceFromReferenceSources(shoppingList = [], selectedStore = null) {
    // Reference sources such as Neytandinn, ASÍ Verðlagseftirlit, or Nappið must
    // be imported/cached first. Do not call them live for every user.
    const estimated = global.MatvalEstimatedPrices?.applyEstimatedPrices;
    if (!estimated) throw new Error("Estimated pricing module is not loaded");
    return estimated(shoppingList, selectedStore);
  }

  global.MatvalReferencePriceSource = {
    priceFromReferenceSources,
  };

  if (typeof module !== "undefined") {
    module.exports = { priceFromReferenceSources };
  }
})(typeof window !== "undefined" ? window : globalThis);
