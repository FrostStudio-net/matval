(function kronanPriceSourceModule(global) {
  function isDebugOrAdminPage() {
    if (typeof window === "undefined") return false;
    return window.location.pathname === "/debug/kronan"
      || window.location.pathname === "/debug-kronan.html"
      || window.location.pathname.startsWith("/admin");
  }

  async function priceFromLiveDebugSource(shoppingList = [], selectedStore = null) {
    if (!isDebugOrAdminPage()) {
      console.warn("Live pricing is disabled in normal user flow");
      const estimated = global.MatvalEstimatedPrices?.applyEstimatedPrices;
      if (!estimated) throw new Error("Estimated pricing module is not loaded");
      return estimated(shoppingList, selectedStore);
    }

    throw new Error("Live Krónan pricing is reserved for debug/admin import flows");
  }

  global.MatvalKronanPriceSource = {
    isDebugOrAdminPage,
    priceFromLiveDebugSource,
  };

  if (typeof module !== "undefined") {
    module.exports = { isDebugOrAdminPage, priceFromLiveDebugSource };
  }
})(typeof window !== "undefined" ? window : globalThis);
