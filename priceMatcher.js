(function priceMatcherModule(global) {
  const CONFIDENCE_SCORE = { high: 3, medium: 2, low: 1 };

  const ITEM_ALIASES = {
    ground_beef: ["hakk", "nautahakk", "ungnautahakk", "nautakjot", "nautakjöt", "minced beef"],
    eggs: ["egg", "eggs", "egg 10 stk"],
    milk: ["mjolk", "mjólk", "nymjolk", "nýmjólk", "milk"],
    oats: ["hafrar", "haframjol", "haframjöl", "oats"],
    rice: ["hrisgrjon", "hrísgrjón", "grjon", "grjón", "rice"],
    pasta: ["pasta"],
    chicken_breast: ["kjuklingabringur", "kjúklingabringur", "kjuklingur", "kjúklingur", "chicken breast"],
    yogurt_skyr: ["skyr", "yogurt", "jogurt"],
    onion: ["laukur", "onion"],
    garlic: ["hvitlaukur", "hvítlaukur", "garlic"],
    soy_sauce: ["sojasosa", "sojasósa", "soy sauce"],
    oil: ["matarolia", "matarolía", "olia", "olía", "oil"],
    spices: ["krydd", "spice", "spices"],
  };

  const ITEM_CATEGORIES = {
    chicken_breast: "protein",
    eggs: "protein",
    tuna: "protein",
    ground_beef: "protein",
    salmon: "protein",
    tofu: "protein",
    lentils: "protein",
    chickpeas: "protein",
    black_beans: "protein",
    kidney_beans: "protein",
    yogurt_skyr: "dairy",
    milk: "dairy",
    cheese: "dairy",
    cottage_cheese: "dairy",
    oats: "pantry",
    rice: "pantry",
    pasta: "pantry",
    tomato_sauce: "pantry",
    bread: "pantry",
    tortilla: "pantry",
    noodles: "pantry",
    potatoes: "produce",
    cucumber: "produce",
    tomato: "produce",
    carrots: "produce",
    banana: "produce",
    apples: "produce",
  };

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

  function itemCategory(item) {
    return item.category || ITEM_CATEGORIES[item.key] || null;
  }

  function itemKeywords(item) {
    return [...new Set([
      ...(ITEM_ALIASES[item.key] || []),
      item.key,
      item.name,
      item.ingredientName,
      item.matchedProductName,
      item.productNameMatched,
      item.barcode,
    ].map(normalizeText).filter(Boolean))];
  }

  function referenceSearchText(reference) {
    return [
      reference.barcode,
      reference.externalProductId,
      reference.query,
      reference.normalizedName,
      reference.normalizedProductName,
      reference.productName,
      ...(reference.aliases || []),
    ].map(normalizeText).filter(Boolean).join(" ");
  }

  function referenceMatchesItem(item, reference) {
    const keywords = itemKeywords(item);
    const searchable = referenceSearchText(reference);
    if (item.barcode && reference.barcode && String(item.barcode) === String(reference.barcode)) return true;
    return keywords.some((keyword) => keyword && searchable.includes(keyword));
  }

  function observedScore(reference) {
    const parsed = Date.parse(reference.observedAt || reference.fetchedAt || "");
    return Number.isNaN(parsed) ? 0 : parsed / 8.64e7 / 10000;
  }

  function referenceScore(item, selectedStore, reference) {
    const keywords = itemKeywords(item);
    const searchable = referenceSearchText(reference);
    const storeScore = reference.storeId === selectedStore ? 350 : 0;
    const confidenceScore = (CONFIDENCE_SCORE[reference.confidence] || 0) * 18;
    const exactScore = keywords.some((keyword) => keyword && normalizeText(reference.normalizedName) === keyword) ? 110 : 0;
    const containsScore = keywords.reduce((score, keyword) => {
      if (!keyword) return score;
      if (searchable.includes(keyword)) return Math.max(score, keyword.length > 5 ? 90 : 55);
      return score;
    }, 0);
    const categoryScore = itemCategory(item) && itemCategory(item) === reference.category ? 20 : 0;
    const priceTieBreaker = -Number(reference.price || 0) / 10000;
    return storeScore + exactScore + containsScore + categoryScore + confidenceScore + observedScore(reference) + priceTieBreaker;
  }

  function parsePackageQuantity(sizeLabel) {
    const text = normalizeText(sizeLabel);
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilo|l|ltr|liter|gr|g|ml|stk)\b/);
    if (!match) return null;
    const amount = Number(match[1].replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const unit = match[2];
    if (unit === "kg" || unit === "kilo" || unit === "l" || unit === "ltr" || unit === "liter" || unit === "stk") {
      return { amount, unit: unit === "kilo" ? "kg" : unit === "ltr" || unit === "liter" ? "l" : unit };
    }
    if (unit === "gr" || unit === "g") return { amount: amount / 1000, unit: "kg" };
    if (unit === "ml") return { amount: amount / 1000, unit: "l" };
    return null;
  }

  function normalizedItemUnit(item) {
    const unit = normalizeText(item.unit);
    if (unit === "kg" || unit === "kilo") return "kg";
    if (unit === "l" || unit === "ltr" || unit === "liter") return "l";
    if (unit === "stk" || unit === "pk" || unit === "dos" || unit === "dós") return "stk";
    return unit || null;
  }

  function packageCountForItem(item, reference) {
    const packageQuantity = parsePackageQuantity(reference.sizeLabel);
    const neededAmount = Number(item.amount || item.quantity || 0);
    const itemUnit = normalizedItemUnit(item);
    if (!packageQuantity || !neededAmount || neededAmount <= 0 || !itemUnit) return 1;
    if (packageQuantity.unit !== itemUnit) return 1;
    const toleratedNeededAmount = neededAmount * 0.95;
    return Math.max(1, Math.ceil(toleratedNeededAmount / packageQuantity.amount));
  }

  function aggregateReferences(references, item, selectedStore, reason) {
    const usable = references.filter((reference) => Number(reference.price) > 0);
    if (!usable.length) return null;
    const averagePrice = Math.round(usable.reduce((total, reference) => total + Number(reference.price), 0) / usable.length);
    const averageUnitPrice = Math.round(usable.reduce((total, reference) => total + Number(reference.unitPrice || reference.price), 0) / usable.length);
    const newest = [...usable].sort((a, b) => Date.parse(b.observedAt || b.fetchedAt || 0) - Date.parse(a.observedAt || a.fetchedAt || 0))[0];
    return {
      storeId: selectedStore,
      storeName: null,
      normalizedName: newest.normalizedName,
      productName: reason === "category_average" ? `${itemCategory(item) || "Vara"} verðviðmið` : newest.productName,
      price: averagePrice,
      unitPrice: averageUnitPrice,
      sizeLabel: newest.sizeLabel,
      sourceName: "Reference average",
      sourceType: "reference",
      priceSource: "reference",
      observedAt: newest.observedAt || newest.fetchedAt || null,
      confidence: "low",
      category: newest.category || itemCategory(item),
      matchType: reason,
      references: usable,
    };
  }

  function findBestReferenceMatch(item, selectedStore, references = []) {
    const directCandidates = references
      .filter((reference) => reference.sourceType === "store" && reference.storeId === selectedStore && referenceMatchesItem(item, reference))
      .map((reference) => ({ reference, score: referenceScore(item, selectedStore, reference) }))
      .sort((a, b) => b.score - a.score);
    if (directCandidates[0]) return { reference: directCandidates[0].reference, matchType: "selected_store_direct" };

    const selectedStoreCandidates = references
      .filter((reference) => (reference.sourceType || reference.priceSource) === "reference" && reference.storeId === selectedStore && referenceMatchesItem(item, reference))
      .map((reference) => ({ reference, score: referenceScore(item, selectedStore, reference) }))
      .sort((a, b) => b.score - a.score);
    if (selectedStoreCandidates[0]) return { reference: selectedStoreCandidates[0].reference, matchType: "selected_store_reference" };

    const kronanCandidates = references
      .filter((reference) => reference.storeId === "kronan" && selectedStore !== "kronan" && referenceMatchesItem(item, reference))
      .map((reference) => ({ reference, score: referenceScore(item, "kronan", reference) }))
      .sort((a, b) => b.score - a.score);
    if (kronanCandidates[0]) return { reference: kronanCandidates[0].reference, matchType: "kronan_reference" };

    const sameProductReferences = references
      .filter((reference) => (reference.sourceType || reference.priceSource) === "reference" && reference.storeId !== selectedStore && reference.storeId !== "kronan" && referenceMatchesItem(item, reference));
    if (sameProductReferences.length) {
      return { reference: aggregateReferences(sameProductReferences, item, selectedStore, "comparable_reference"), matchType: "comparable_reference" };
    }

    const category = itemCategory(item);
    const categoryReferences = category
      ? references.filter((reference) => (reference.sourceType || reference.priceSource) === "reference" && reference.category === category)
      : [];
    if (categoryReferences.length) {
      return { reference: aggregateReferences(categoryReferences, item, selectedStore, "category_average"), matchType: "category_average" };
    }

    return { reference: null, matchType: "estimated" };
  }

  global.MatvalPriceMatcher = {
    normalizeText,
    itemCategory,
    itemKeywords,
    parsePackageQuantity,
    packageCountForItem,
    findBestReferenceMatch,
  };

  if (typeof module !== "undefined") {
    module.exports = {
      normalizeText,
      itemCategory,
      itemKeywords,
      parsePackageQuantity,
      packageCountForItem,
      findBestReferenceMatch,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
