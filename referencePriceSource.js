(function referencePriceSourceModule(global) {
  const REFERENCE_PRICES = (() => {
    if (global.MatvalReferencePriceData?.REFERENCE_PRICES) return global.MatvalReferencePriceData.REFERENCE_PRICES;
    if (typeof require === "function") {
      try {
        return require("./referencePriceData.js").REFERENCE_PRICES || [];
      } catch (error) {
        return [];
      }
    }
    return [];
  })();

  const matcher = (() => {
    if (global.MatvalPriceMatcher) return global.MatvalPriceMatcher;
    if (typeof require === "function") {
      try {
        return require("./priceMatcher.js");
      } catch (error) {
        return null;
      }
    }
    return null;
  })();

  function applyReferencePrice(item, selectedStore, reference, matchType) {
    const packageCount = matcher?.packageCountForItem
      ? matcher.packageCountForItem(item, reference)
      : 1;
    const totalPrice = Number(reference.price) * packageCount;
    const isDirectStore = matchType === "selected_store_direct" && (reference.sourceType || reference.priceSource) === "store";

    return {
      ...item,
      price: totalPrice,
      totalPrice,
      estimatedPrice: item.mockPrice ?? item.estimatedPrice ?? item.price ?? item.totalPrice ?? 0,
      unitPrice: Number(reference.price),
      matchedProductName: reference.productName,
      productNameMatched: reference.productName,
      productId: reference.externalProductId || null,
      barcode: reference.barcode || null,
      sku: reference.externalProductId || null,
      packageSize: reference.sizeLabel || null,
      packageCount,
      purchaseLabel: `${packageCount > 1 ? `${packageCount} × ` : ""}${reference.sizeLabel || "vara"}`,
      recipeAmount: item.amount,
      size: reference.sizeLabel || null,
      priceSource: isDirectStore ? "store" : "reference",
      source: isDirectStore ? "store" : "reference",
      sourceName: reference.sourceName || (isDirectStore ? reference.storeName : "Reference average"),
      sourceType: reference.sourceType || (isDirectStore ? "store" : "reference"),
      storeName: reference.storeName || null,
      sourceLabel: isDirectStore ? `Verð frá ${reference.storeName || "verslun"}` : "Áætlað verð · verðviðmið",
      observedAt: reference.observedAt || null,
      fetchedAt: reference.fetchedAt || null,
      confidence: reference.confidence || "medium",
      priceMatchType: matchType || reference.matchType || "selected_store_reference",
      fallbackReason: null,
      estimated: false,
      isEstimated: false,
      kronanProduct: null,
    };
  }

  function tracePriceMatch(item, selectedStoreId, result) {
    if (!global.MatvalPricingConfig?.PRICE_TRACE) return;
    const normalizedItemName = matcher?.normalizeText
      ? matcher.normalizeText(item.ingredientName || item.name || item.key)
      : String(item.ingredientName || item.name || item.key || "").toLowerCase();
    const attemptedAliases = matcher?.itemKeywords ? matcher.itemKeywords(item) : [normalizedItemName].filter(Boolean);
    const matchedReference = result?.reference || null;
    const pricedItem = result?.pricedItem || null;

    console.log("[PRICE TRACE]", {
      selectedStoreId,
      itemName: item.ingredientName || item.name || item.key,
      normalizedItemName,
      attemptedAliases,
      matchedSourceType: matchedReference?.sourceType || pricedItem?.sourceType || pricedItem?.priceSource || "estimated",
      matchedStoreId: matchedReference?.storeId || null,
      matchedProductName: matchedReference?.productName || pricedItem?.productNameMatched || pricedItem?.matchedProductName || null,
      matchedSourceName: matchedReference?.sourceName || pricedItem?.sourceName || null,
      matchedObservedAt: matchedReference?.observedAt || pricedItem?.observedAt || null,
      matchType: result?.matchType || pricedItem?.priceMatchType || "estimated",
      finalPrice: pricedItem?.totalPrice ?? pricedItem?.price ?? null,
      fallbackReason: pricedItem?.fallbackReason || result?.fallbackReason || null,
    });
  }

  function estimateFallback(item, selectedStore, reason) {
    const estimated = global.MatvalEstimatedPrices?.normalizeEstimatedItem;
    if (!estimated) throw new Error("Estimated pricing module is not loaded");
    return {
      ...estimated(item, selectedStore),
      sourceType: "estimated",
      sourceName: "Matval estimate",
      priceMatchType: "estimated",
      fallbackReason: reason,
    };
  }

  function findReferenceMatch(item, selectedStore) {
    if (!matcher?.findBestReferenceMatch) {
      return { reference: null, matchType: "estimated" };
    }
    return matcher.findBestReferenceMatch(item, selectedStore, REFERENCE_PRICES);
  }

  function priceFromReferenceSourcesSync(shoppingList = [], selectedStore = null) {
    const items = shoppingList.map((item) => {
      const match = findReferenceMatch(item, selectedStore);
      if (match.reference) {
        const pricedItem = applyReferencePrice(item, selectedStore, match.reference, match.matchType);
        tracePriceMatch(item, selectedStore, { ...match, pricedItem });
        return pricedItem;
      }
      const pricedItem = estimateFallback(item, selectedStore, "No store/reference/category price match found");
      tracePriceMatch(item, selectedStore, {
        reference: null,
        matchType: "estimated",
        pricedItem,
        fallbackReason: pricedItem.fallbackReason,
      });
      return pricedItem;
    });

    return {
      items,
      totalPrice: items.reduce((total, item) => total + Number(item.totalPrice || 0), 0),
      priceMode: "reference",
      sourceLabel: global.MatvalPricing?.getPriceSourceLabel
        ? global.MatvalPricing.getPriceSourceLabel(items)
        : "Áætlað verð · verðviðmið",
    };
  }

  async function priceFromReferenceSources(shoppingList = [], selectedStore = null) {
    // Manual/cached reference prices only. Do not call Neytandinn, ASÍ, or Nappið live.
    return priceFromReferenceSourcesSync(shoppingList, selectedStore);
  }

  global.MatvalReferencePriceSource = {
    REFERENCE_PRICES,
    priceFromReferenceSources,
    priceFromReferenceSourcesSync,
    findReferenceMatch,
    tracePriceMatch,
  };

  if (typeof module !== "undefined") {
    module.exports = {
      REFERENCE_PRICES,
      priceFromReferenceSources,
      priceFromReferenceSourcesSync,
      findReferenceMatch,
      tracePriceMatch,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
