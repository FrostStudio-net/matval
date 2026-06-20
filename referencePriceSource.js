(function referencePriceSourceModule(global) {
  const loadedReferenceData = (() => {
    if (global.MatvalReferencePriceData?.REFERENCE_PRICES) {
      return global.MatvalReferencePriceData.REFERENCE_PRICES;
    }
    if (typeof require === "function") {
      try {
        return require("./referencePriceData.js").REFERENCE_PRICES || [];
      } catch (error) {
        return [];
      }
    }
    return [];
  })();

  const REFERENCE_PRICES = loadedReferenceData;

  const ITEM_REFERENCE_KEYWORDS = {
    ground_beef: ["hakk", "nautahakk", "ungnautahakk", "nautakjot", "nautakjöt", "minced beef"],
    eggs: ["egg", "eggs", "egg 10 stk"],
    milk: ["mjolk", "mjólk", "nymjolk", "nýmjólk", "milk"],
    oats: ["hafrar", "haframjol", "haframjöl", "oats"],
    rice: ["hrisgrjon", "hrísgrjón", "grjon", "grjón", "rice"],
    pasta: ["pasta"],
    chicken_breast: ["kjuklingabringur", "kjúklingabringur", "kjuklingur", "kjúklingur", "chicken breast"],
    yogurt_skyr: ["skyr", "yogurt", "jogurt"],
  };

  const CONFIDENCE_SCORE = { high: 3, medium: 2, low: 1 };

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ð/g, "d")
      .replace(/þ/g, "th")
      .replace(/[^a-z0-9æöüø\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function itemKeywords(item) {
    const explicit = ITEM_REFERENCE_KEYWORDS[item.key] || [];
    return [...new Set([
      ...explicit,
      item.key,
      item.name,
      item.ingredientName,
    ].map(normalizeText).filter(Boolean))];
  }

  function parsePackageQuantityKg(sizeLabel) {
    const text = normalizeText(sizeLabel);
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilo|gr|g)\b/);
    if (!match) return null;
    const amount = Number(match[1].replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return match[2] === "kg" || match[2] === "kilo" ? amount : amount / 1000;
  }

  function packageCountForItem(item, reference) {
    if (item.unit !== "kg") return 1;
    const packageKg = parsePackageQuantityKg(reference.sizeLabel);
    const neededKg = Number(item.amount || item.quantity || 0);
    if (!packageKg || !neededKg || neededKg <= 0) return 1;
    return Math.max(1, Math.ceil(neededKg / packageKg));
  }

  function referenceScore(item, selectedStore, reference) {
    const keywords = itemKeywords(item);
    const searchable = normalizeText([
      reference.query,
      reference.productName,
      reference.normalizedName,
    ].join(" "));
    const selectedStoreScore = reference.storeId === selectedStore ? 500 : -100;
    const exactScore = keywords.some((keyword) => keyword && normalizeText(reference.normalizedName) === keyword) ? 90 : 0;
    const containsScore = keywords.reduce((score, keyword) => {
      if (!keyword) return score;
      if (searchable.includes(keyword)) return Math.max(score, keyword.length > 5 ? 70 : 45);
      return score;
    }, 0);
    const observedScore = reference.observedAt ? Date.parse(reference.observedAt) / 8.64e7 / 10000 : 0;
    const confidenceScore = (CONFIDENCE_SCORE[reference.confidence] || 0) * 12;
    const priceTieBreaker = -Number(reference.price || 0) / 10000;
    return selectedStoreScore + exactScore + containsScore + confidenceScore + observedScore + priceTieBreaker;
  }

  function findReferenceMatch(item, selectedStore) {
    const candidates = REFERENCE_PRICES
      .map((reference) => ({
        reference,
        score: referenceScore(item, selectedStore, reference),
      }))
      .filter((candidate) => candidate.reference.storeId === selectedStore && candidate.score > 500)
      .sort((a, b) => b.score - a.score);

    return candidates[0]?.reference || null;
  }

  function applyReferencePrice(item, selectedStore, reference) {
    const packageCount = packageCountForItem(item, reference);
    const totalPrice = Number(reference.price) * packageCount;
    return {
      ...item,
      price: totalPrice,
      totalPrice,
      estimatedPrice: item.mockPrice ?? item.estimatedPrice ?? item.price ?? item.totalPrice ?? 0,
      unitPrice: Number(reference.price),
      matchedProductName: reference.productName,
      productNameMatched: reference.productName,
      productId: null,
      barcode: null,
      sku: null,
      packageSize: reference.sizeLabel,
      packageCount,
      size: reference.sizeLabel,
      priceSource: "reference",
      source: "reference",
      sourceName: reference.sourceName,
      storeName: reference.storeName,
      sourceLabel: "Áætlað verð · verðviðmið",
      observedAt: reference.observedAt,
      fetchedAt: null,
      confidence: reference.confidence || "medium",
      fallbackReason: null,
      estimated: false,
      isEstimated: false,
      kronanProduct: null,
    };
  }

  function priceFromReferenceSourcesSync(shoppingList = [], selectedStore = null) {
    const estimated = global.MatvalEstimatedPrices?.normalizeEstimatedItem;
    if (!estimated) throw new Error("Estimated pricing module is not loaded");

    const items = shoppingList.map((item) => {
      const reference = findReferenceMatch(item, selectedStore);
      if (reference) return applyReferencePrice(item, selectedStore, reference);
      return {
        ...estimated(item, selectedStore),
        fallbackReason: "No cached/manual reference price match found",
      };
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
    // Reference prices are local cached/manual data in normal flow.
    // Do not call Neytandinn, ASÍ, or Nappið live for every user.
    return priceFromReferenceSourcesSync(shoppingList, selectedStore);
  }

  global.MatvalReferencePriceSource = {
    REFERENCE_PRICES,
    priceFromReferenceSources,
    priceFromReferenceSourcesSync,
    findReferenceMatch,
  };

  if (typeof module !== "undefined") {
    module.exports = {
      REFERENCE_PRICES,
      priceFromReferenceSources,
      priceFromReferenceSourcesSync,
      findReferenceMatch,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
