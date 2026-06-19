const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { KRONAN_PRODUCT_MAPPING } = require("./kronan-product-mapping");

loadDotenv();

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "127.0.0.1";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const KRONAN_DEBUG_CACHE_MS = 60_000;
const KRONAN_DEBUG_429_COOLDOWN_MS = 10 * 60_000;
let kronanDebugCache = null;
let kronanDebugBlockedUntil = 0;
const KRONAN_API_TOKEN = process.env.KRONAN_API_TOKEN?.trim() || "";
const KRONAN_API_BASE_URL = (process.env.KRONAN_API_BASE_URL?.trim() || "https://api.kronan.is").replace(/\/+$/, "");
const PUBLIC_DIR = __dirname;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function loadDotenv() {
  const envPath = path.join(__dirname, ".env");
  try {
    require("dotenv").config({ path: envPath });
    return;
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
  }

  loadEnvFile(envPath);
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;

    const key = match[1];
    let value = match[2].trim().replace(/\s+#.*$/, "");
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, { error: message, ...(details ? { details } : {}) });
}

function maskedTokenTail() {
  if (IS_PRODUCTION) return "";
  return KRONAN_API_TOKEN ? KRONAN_API_TOKEN.slice(-4) : "";
}

function safeAuthorizationHeader() {
  if (!KRONAN_API_TOKEN) return "AccessToken <missing>";
  return IS_PRODUCTION ? "AccessToken ***" : `AccessToken ***${maskedTokenTail()}`;
}

function kronanAuthHeaders(extraHeaders = {}) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `AccessToken ${KRONAN_API_TOKEN}`,
    ...extraHeaders,
  };
}

function safeHeadersForLog(headers) {
  return {
    ...headers,
    Authorization: safeAuthorizationHeader(),
  };
}

function logKronanRequest(method, requestUrl, headers) {
  console.log("[Krónan request]", {
    method,
    requestUrl,
    headers: safeHeadersForLog(headers),
  });
}

function logKronanAuthDiagnostics() {
  console.log("[Krónan auth diagnostics]", {
    hasToken: Boolean(KRONAN_API_TOKEN),
    tokenLength: KRONAN_API_TOKEN.length,
    tokenFirst6: IS_PRODUCTION ? "<hidden in production>" : KRONAN_API_TOKEN ? KRONAN_API_TOKEN.slice(0, 6) : "",
    tokenLast4: IS_PRODUCTION ? "<hidden in production>" : maskedTokenTail(),
    baseUrl: KRONAN_API_BASE_URL,
    cwd: process.cwd(),
  });
}

function requireToken(res) {
  if (KRONAN_API_TOKEN) return true;
  sendError(res, 500, "KRONAN_API_TOKEN is not configured");
  return false;
}

async function kronanFetch(endpoint, options = {}) {
  const requestUrl = `${KRONAN_API_BASE_URL}${endpoint}`;
  const requestHeaders = kronanAuthHeaders(options.headers || {});
  logKronanRequest(options.method || "GET", requestUrl, requestHeaders);

  const response = await fetch(requestUrl, {
    ...options,
    headers: requestHeaders,
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message = body && typeof body === "object" ? body.detail || body.message || body.error : body;
    const error = new Error(message || `Krónan API returned ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function firstValue(source, keys) {
  for (const key of keys) {
    const value = key.split(".").reduce((obj, part) => (obj == null ? undefined : obj[part]), source);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const directKeys = ["hits", "results", "items", "products", "data"];
  for (const key of directKeys) {
    if (Array.isArray(payload[key])) return payload[key];
    if (payload[key] && typeof payload[key] === "object") {
      const nested = extractList(payload[key]);
      if (nested.length) return nested;
    }
  }
  return [];
}

function normalizeCategoryPath(product) {
  const pathValue = firstValue(product, ["categoryPath", "category.path", "category.fullName", "category.name"]);
  if (Array.isArray(pathValue)) {
    return pathValue.map((item) => (typeof item === "string" ? item : item.name || item.title)).filter(Boolean);
  }
  if (typeof pathValue === "string") return pathValue.split("/").map((part) => part.trim()).filter(Boolean);

  const categories = firstValue(product, ["categories"]);
  if (Array.isArray(categories)) {
    return categories.map((item) => (typeof item === "string" ? item : item.name || item.title)).filter(Boolean);
  }
  return [];
}

function normalizeProduct(product) {
  if (!product || typeof product !== "object") return null;

  const price = asNumber(firstValue(product, ["price", "currentPrice", "unitPrice", "prices.price", "pricing.price"]));
  const discountedPrice = asNumber(firstValue(product, [
    "discountedPrice",
    "discountPrice",
    "salePrice",
    "campaignPrice",
    "prices.discountedPrice",
    "pricing.discountedPrice",
  ]));
  const activePrice = discountedPrice ?? price;

  return {
    sku: String(firstValue(product, ["sku", "id", "productId", "code", "barcode"]) || ""),
    name: firstValue(product, ["name", "title", "displayName", "productName"]) || "",
    price: price ?? activePrice,
    discountedPrice,
    onSale: Boolean(firstValue(product, ["onSale", "isOnSale", "discount", "campaign"])) || (discountedPrice != null && price != null && discountedPrice < price),
    pricePerKilo: asNumber(firstValue(product, ["pricePerKilo", "price_per_kilo", "unitPrice", "comparisonPrice", "prices.pricePerKilo"])),
    thumbnail: firstValue(product, ["thumbnail", "image", "imageUrl", "images.0.url", "media.0.url"]),
    brand: firstValue(product, ["brand", "brandName", "manufacturer.name"]),
    categoryPath: normalizeCategoryPath(product),
    available: firstValue(product, ["available", "isAvailable", "inStock", "stock.available", "inventory.available"]) !== false,
    packageSizeText: firstValue(product, ["packageSize", "size", "unit", "quantityText", "netContent", "contents"]),
  };
}

function normalizeProducts(payload) {
  return extractList(payload)
    .map((item) => item && (item.document || item.product || item.item || item))
    .map(normalizeProduct)
    .filter((product) => product && product.sku && product.name);
}

function kronanProductSearchBody(query) {
  return { q: query, query, search: query, term: query };
}

async function rawKronanRequest(label, endpoint, options = {}) {
  const requestUrl = `${KRONAN_API_BASE_URL}${endpoint}`;
  const requestHeaders = kronanAuthHeaders(options.headers || {});
  const method = options.method || "GET";
  logKronanRequest(method, requestUrl, requestHeaders);

  try {
    const response = await fetch(requestUrl, {
      ...options,
      headers: requestHeaders,
    });
    const responseText = await response.text();
    let responseBody = responseText;
    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseBody = responseText;
    }

    return {
      label,
      method,
      requestUrl,
      requestHeaders: safeHeadersForLog(requestHeaders),
      status: response.status,
      ok: response.ok,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseBody,
      error: response.ok ? null : `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      label,
      method,
      requestUrl,
      requestHeaders: safeHeadersForLog(requestHeaders),
      status: null,
      ok: false,
      responseHeaders: {},
      responseBody: null,
      error: error.stack || error.message || String(error),
    };
  }
}

async function handleKronanDebug(req, res) {
  if (IS_PRODUCTION) {
    return sendError(res, 404, "Krónan debug endpoint is disabled in production");
  }
  if (!requireToken(res)) return;

  const now = Date.now();
  if (kronanDebugBlockedUntil > now) {
    return sendJson(res, 429, {
      error: "Krónan debug live calls are temporarily paused after HTTP 429.",
      retryAfterSeconds: Math.ceil((kronanDebugBlockedUntil - now) / 1000),
      cached: kronanDebugCache ? kronanDebugCache.payload : null,
    });
  }

  if (kronanDebugCache && now - kronanDebugCache.timestamp < KRONAN_DEBUG_CACHE_MS) {
    return sendJson(res, 200, {
      ...kronanDebugCache.payload,
      cached: true,
      cacheAgeSeconds: Math.ceil((now - kronanDebugCache.timestamp) / 1000),
    });
  }

  const results = await Promise.all([
    rawKronanRequest("GET /api/v1/me/", "/api/v1/me/"),
    rawKronanRequest("GET /api/v1/categories/", "/api/v1/categories/"),
    rawKronanRequest("POST /api/v1/products/search/", "/api/v1/products/search/", {
      method: "POST",
      body: JSON.stringify(kronanProductSearchBody("egg")),
    }),
  ]);
  const meResult = results.find((result) => result.label === "GET /api/v1/me/");
  const authDiagnosis = meResult && meResult.status === 403 && KRONAN_API_TOKEN
    ? "The Krónan token itself is invalid or lacks access. Create a new Access Token in kronan.is settings."
    : null;

  if (authDiagnosis) {
    console.warn("[Krónan auth]", authDiagnosis);
  }

  const has429 = results.some((result) => Number(result.status) === 429);
  if (has429) {
    kronanDebugBlockedUntil = Date.now() + KRONAN_DEBUG_429_COOLDOWN_MS;
    console.warn("[Krónan debug] HTTP 429 received; pausing live debug calls temporarily.");
  }

  const payload = {
    baseUrl: KRONAN_API_BASE_URL,
    auth: {
      hasToken: Boolean(KRONAN_API_TOKEN),
      tokenLength: KRONAN_API_TOKEN.length,
      tokenFirst6: KRONAN_API_TOKEN ? KRONAN_API_TOKEN.slice(0, 6) : "",
      tokenLast4: maskedTokenTail(),
      authorizationHeader: safeAuthorizationHeader(),
    },
    authDiagnosis,
    generatedAt: new Date().toISOString(),
    results,
    cached: false,
  };
  kronanDebugCache = { timestamp: Date.now(), payload };

  sendJson(res, has429 ? 429 : 200, payload);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("is-IS")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9þæðöüø\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularizeToken(token) {
  if (token.length <= 4) return token;
  return token
    .replace(/(arnir|irnar|urnar|anna|unum)$/u, "")
    .replace(/(ar|ir|ur|um)$/u, "");
}

function textTokens(value) {
  return normalizeText(value)
    .split(" ")
    .filter(Boolean)
    .flatMap((token) => [...new Set([token, singularizeToken(token)])]);
}

function containsNormalizedPhrase(text, phrase) {
  const normalizedText = ` ${normalizeText(text)} `;
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase) return false;
  return normalizedText.includes(` ${normalizedPhrase} `);
}

function mappingMatchesIngredientName(mapping, ingredientName) {
  const normalizedIngredient = normalizeText(ingredientName);
  const ingredientTokens = textTokens(ingredientName).filter((token) => token.length > 3);
  const candidates = [
    mapping.ingredientName,
    mapping.searchQuery,
    ...(mapping.closeMatches || []),
    ...(mapping.keyWords || []),
  ].filter(Boolean);

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeText(candidate);
    const candidateTokens = textTokens(candidate).filter((token) => token.length > 3);
    return normalizedCandidate
      && (
        normalizedIngredient.includes(normalizedCandidate)
        || normalizedCandidate.includes(normalizedIngredient)
        || ingredientTokens.some((token) => candidateTokens.includes(token))
      );
  });
}

function mappingForIngredientName(ingredientName) {
  const normalizedIngredient = normalizeText(ingredientName);
  const ingredientTokens = textTokens(ingredientName).filter((token) => token.length > 3);
  const scoredEntries = Object.entries(KRONAN_PRODUCT_MAPPING)
    .map(([key, mapping]) => {
      const candidates = [
        mapping.ingredientName,
        mapping.searchQuery,
        ...(mapping.closeMatches || []),
        ...(mapping.keyWords || []),
      ].filter(Boolean);
      let score = 0;

      candidates.forEach((candidate) => {
        const normalizedCandidate = normalizeText(candidate);
        const candidateTokens = textTokens(candidate).filter((token) => token.length > 3);
        if (!normalizedCandidate) return;
        if (normalizedIngredient === normalizedCandidate) score += 200;
        else if (normalizedIngredient.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedIngredient)) score += 120;
        const sharedTokens = ingredientTokens.filter((token) => candidateTokens.includes(token));
        score += sharedTokens.length * 20;
        score += Math.min(normalizedCandidate.length, normalizedIngredient.length) / 100;
      });

      return { key, mapping, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredEntries[0]) return { key: scoredEntries[0].key, mapping: scoredEntries[0].mapping };

  return {
    key: null,
    mapping: {
      ingredientName,
      searchQuery: ingredientName,
      closeMatches: [ingredientName],
      keyWords: textTokens(normalizedIngredient).filter((token) => token.length > 3),
      expectedUnit: "stk",
      defaultPackageSize: 1,
    },
  };
}

function activeProductPrice(product) {
  return product.discountedPrice ?? product.price;
}

const GLOBAL_DENY_WORDS = [
  "katt",
  "kött",
  "cat",
  "hund",
  "fóður",
  "nammi",
  "kinder",
  "súkkulaði",
  "candy",
  "snakk",
  "sushi",
  "tilbúinn réttur",
];

const DAIRY_FREE_DENY_WORDS = [
  "ostur",
  "rjómi",
  "skyr",
  "jógúrt",
  "smjör",
  "carbonara",
  "cheese",
  "cream",
];

const VEGAN_DENY_WORDS = [
  "kjúklingur",
  "kjúklinga",
  "lax",
  "túnfiskur",
  "egg",
  "ostur",
  "rjómi",
  "skyr",
  "jógúrt",
  "smjör",
  "fiskur",
  "kjöt",
  "naut",
  "beef",
  "chicken",
  "salmon",
  "tuna",
  "cheese",
  "cream",
];

const PLANT_MILK_EXCEPTIONS = [
  "haframjólk",
  "jurtamjólk",
  "möndlumjólk",
  "sojamjólk",
  "kókosmjólk",
  "hrísmjólk",
  "oat milk",
  "plant milk",
  "almond milk",
  "soy milk",
  "coconut milk",
  "rice milk",
];

function hasNormalizedWordOrPhrase(text, phrase) {
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase) return false;
  if (containsNormalizedPhrase(text, normalizedPhrase)) return true;
  return normalizedPhrase.includes(" ") && normalizeText(text).includes(normalizedPhrase);
}

function findFirstPhrase(text, phrases = []) {
  return phrases.find((phrase) => hasNormalizedWordOrPhrase(text, phrase)) || null;
}

function findFirstDenyPhrase(text, phrases = []) {
  const normalizedText = normalizeText(text);
  return phrases.find((phrase) => {
    const normalizedPhrase = normalizeText(phrase);
    return normalizedPhrase && (
      hasNormalizedWordOrPhrase(text, phrase)
      || normalizedText.includes(normalizedPhrase)
    );
  }) || null;
}

function allowsDeniedWord(mapping, word) {
  const allowGlobalDenyWords = mapping.allowGlobalDenyWords || [];
  const explicitPhrases = [
    mapping.searchQuery,
    mapping.ingredientName,
    ...(mapping.closeMatches || []),
    ...(mapping.allowWords || []),
    ...allowGlobalDenyWords,
  ].filter(Boolean);

  return explicitPhrases.some((phrase) => hasNormalizedWordOrPhrase(phrase, word));
}

function containsMilkWithoutPlantException(productName) {
  const normalizedName = normalizeText(productName);
  if (!normalizedName.includes(normalizeText("mjólk")) && !findFirstDenyPhrase(productName, ["milk"])) return false;
  return !PLANT_MILK_EXCEPTIONS.some((exception) => hasNormalizedWordOrPhrase(productName, exception));
}

function normalizedGoals(goals = []) {
  return goals.map((goal) => normalizeText(goal).replace(/\s+/g, "_"));
}

function dietaryRejection(product, goals = []) {
  const goalSet = new Set(normalizedGoals(goals));
  const name = product.name || "";

  if (goalSet.has("vegan")) {
    const veganMatch = findFirstDenyPhrase(name, VEGAN_DENY_WORDS);
    if (veganMatch) return `vegan deny "${veganMatch}"`;
    if (containsMilkWithoutPlantException(name)) return 'vegan deny "mjólk"';
  }

  if (goalSet.has("dairy_free") || goalSet.has("dairyfree") || goalSet.has("mjolkurlaust")) {
    const dairyMatch = findFirstDenyPhrase(name, DAIRY_FREE_DENY_WORDS);
    if (dairyMatch) return `dairy-free deny "${dairyMatch}"`;
    if (containsMilkWithoutPlantException(name)) return 'dairy-free deny "mjólk"';
  }

  return null;
}

function candidateRejection(product, mapping, options = {}) {
  if (mapping.skipAutoMatch) return "ingredient is pantry/optional and auto-match is disabled";
  if (product.available === false) return "product is unavailable";

  const name = product.name || "";
  const allowWords = mapping.allowWords || [];
  const allowedMatch = allowWords.length ? findFirstPhrase(name, allowWords) : null;
  if (allowWords.length && !allowedMatch) {
    return `missing required ingredient word (${allowWords.join(", ")})`;
  }

  const denyMatch = findFirstDenyPhrase(name, mapping.denyWords || []);
  if (denyMatch) return `ingredient deny "${denyMatch}"`;

  const globalDenyMatch = GLOBAL_DENY_WORDS.find((word) => (
    findFirstDenyPhrase(name, [word]) && !allowsDeniedWord(mapping, word)
  ));
  if (globalDenyMatch) return `global deny "${globalDenyMatch}"`;

  return dietaryRejection(product, options.goals);
}

function parsePackageSize(product, mapping) {
  const text = `${product.packageSizeText || ""} ${product.name || ""}`;
  const normalizedUnit = (mapping.expectedUnit || "").toLowerCase();
  const patterns = [
    { regex: /(\d+(?:[,.]\d+)?)\s*(kg)/i, unit: "kg", multiplier: 1 },
    { regex: /(\d+(?:[,.]\d+)?)\s*(g)\b/i, unit: "kg", multiplier: 0.001 },
    { regex: /(\d+(?:[,.]\d+)?)\s*(l)\b/i, unit: "L", multiplier: 1 },
    { regex: /(\d+(?:[,.]\d+)?)\s*(ml)\b/i, unit: "L", multiplier: 0.001 },
    { regex: /(\d+(?:[,.]\d+)?)\s*(stk)/i, unit: "stk", multiplier: 1 },
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const amount = asNumber(match[1]);
    if (!amount) continue;
    const display = `${match[1].replace(".", ",")}${match[2]}`;
    if ((normalizedUnit === "kg" && pattern.unit === "kg") || (normalizedUnit === "l" && pattern.unit === "L")) {
      return { amount: amount * pattern.multiplier, unit: pattern.unit, label: display, reliable: true };
    }
    if (!["kg", "l"].includes(normalizedUnit) && (pattern.unit === "kg" || pattern.unit === "L")) {
      return { amount: mapping.defaultPackageSize || 1, unit: mapping.expectedUnit || "stk", label: display, reliable: false };
    }
    if (!["kg", "l"].includes(normalizedUnit) && pattern.unit === "stk") {
      return { amount: amount * pattern.multiplier, unit: pattern.unit, label: display, reliable: true };
    }
  }

  return { amount: mapping.defaultPackageSize || 1, unit: mapping.expectedUnit || "stk", reliable: false };
}

function packageSizeLabel(packageSize) {
  if (packageSize.label) return packageSize.label;
  const amount = Number(packageSize.amount || 1);
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toLocaleString("is-IS", { maximumFractionDigits: 2 });
  return `${formatted} ${packageSize.unit || "stk"}`;
}

function calculatePackageCount(quantityNeeded, packageSize, unit) {
  const amount = Number(quantityNeeded || 0);
  if (!amount || amount <= 0) return 1;
  if (!packageSize || !packageSize.reliable) return 1;

  const normalizedUnit = String(unit || "").toLowerCase();
  if (normalizedUnit === "kg" || normalizedUnit === "l") {
    return Math.max(1, Math.ceil(amount / Math.max(Number(packageSize.amount || 1), 0.001)));
  }

  return Math.max(1, Math.ceil(amount));
}

function productScore(product, mapping) {
  const name = product.name || "";
  const normalizedName = normalizeText(name);
  const query = mapping.searchQuery || "";
  const closeMatches = mapping.closeMatches || [mapping.searchQuery];
  const keyWords = mapping.keyWords || textTokens(mapping.searchQuery).filter((token) => token.length > 3);
  const categoryHints = mapping.categoryHints || [];
  const categoryText = Array.isArray(product.categoryPath) ? product.categoryPath.join(" ") : "";
  const normalizedCategory = normalizeText(categoryText);
  const unrelatedWords = mapping.unrelatedWords || [
    "rettur",
    "tilbuinn",
    "tilbun",
    "mix",
    "mixa",
    "blanda",
    "supa",
    "gryta",
    "buff",
    "borgari",
    "salat",
    "snakk",
  ];
  const price = activeProductPrice(product);
  const reasons = [];
  let score = 0;

  if (product.available) {
    score += 20;
    reasons.push("+20 available");
  }
  if (containsNormalizedPhrase(name, query)) {
    score += 100;
    reasons.push(`+100 exact phrase "${query}"`);
  }
  closeMatches.forEach((match) => {
    if (match && containsNormalizedPhrase(name, match)) {
      score += 100;
      reasons.push(`+100 alias phrase "${match}"`);
    }
  });
  keyWords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword && normalizedName.includes(normalizedKeyword)) {
      score += 60;
      reasons.push(`+60 keyword "${keyword}"`);
    }
  });
  categoryHints.forEach((hint) => {
    if (hint && normalizedCategory.includes(normalizeText(hint))) {
      score += 30;
      reasons.push(`+30 category "${hint}"`);
    }
  });
  unrelatedWords.forEach((word) => {
    if (word && normalizedName.includes(normalizeText(word))) {
      score -= 100;
      reasons.push(`-100 unrelated "${word}"`);
    }
  });
  if (price != null && price > 0) {
    score += 10;
    reasons.push("+10 has price");
  }
  if (price != null && price > 100000) {
    score -= 50;
    reasons.push("-50 unreasonable price");
  }

  return { score, reasons };
}

function scoreCandidates(products, mapping, options = {}) {
  return products
    .filter((product) => activeProductPrice(product) != null)
    .map((product) => {
      const { score, reasons } = productScore(product, mapping);
      const rejectedBecause = candidateRejection(product, mapping, options);
      return {
        product,
        score,
        reasons: rejectedBecause ? [...reasons, `rejected: ${rejectedBecause}`] : reasons,
        rejectedBecause,
        price: activeProductPrice(product),
        valid: !rejectedBecause && score >= 70,
      };
    });
}

function chooseBestProduct(products, mapping, options = {}) {
  const cheapMode = (options.goals || []).includes("cheap") || options.preferCheapest;
  const candidates = scoreCandidates(products, mapping, options);
  const validCandidates = candidates
    .filter((candidate) => candidate.valid)
    .sort((a, b) => {
      if (cheapMode) {
        if (a.price !== b.price) return a.price - b.price;
        return b.score - a.score;
      }
      if (b.score - a.score >= 40) return b.score - a.score;
      if (a.price !== b.price) return a.price - b.price;
      return b.score - a.score;
    });

  return {
    product: validCandidates[0] ? validCandidates[0].product : null,
    candidates,
    selectedCandidate: validCandidates[0] || null,
    cheapMode,
  };
}

function chooseBestProductLegacy(products, mapping) {
  const candidates = products
    .filter((product) => activeProductPrice(product) != null)
    .map((product) => ({ product, score: productScore(product, mapping).score, price: activeProductPrice(product) }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.product.available !== b.product.available) return a.product.available ? -1 : 1;
      return a.price - b.price;
    });

  return candidates[0] ? candidates[0].product : null;
}

async function searchKronanProducts(query, options = {}) {
  const payload = await kronanFetch("/api/v1/products/search/", {
    method: "POST",
    body: JSON.stringify(kronanProductSearchBody(query)),
  });
  if (options.logRaw) {
    console.log("[TRACE SERVER] raw kronan search response", JSON.stringify(payload, null, 2).slice(0, 3000));
  }
  return normalizeProducts(payload);
}

async function matchShoppingListItem(item, options = {}) {
  const mapping = KRONAN_PRODUCT_MAPPING[item.key] || mappingForIngredientName(item.name).mapping || {
    ingredientName: item.name,
    searchQuery: item.name,
    closeMatches: [item.name],
    expectedUnit: item.unit,
    defaultPackageSize: 1,
  };
  const quantityNeeded = Number(item.amount || 0);

  console.log("[Krónan match] ingredient being matched:", item.key, item.name);
  console.log("[Krónan match] search query sent to Krónan:", mapping.searchQuery);

  let products = [];
  try {
    products = await searchKronanProducts(mapping.searchQuery, { logRaw: options.logRawSearch });
  } catch (error) {
    console.error("[Krónan match] search failed:", item.key, error.message);
  }

  const matchResult = chooseBestProduct(products, mapping, options);
  const chosen = matchResult.product;
  console.log("[Krónan match] candidates:", matchResult.candidates.map((candidate) => ({
    sku: candidate.product.sku,
    name: candidate.product.name,
    price: candidate.price,
    score: candidate.score,
    valid: candidate.valid,
    reasons: candidate.reasons,
    rejectedBecause: candidate.rejectedBecause,
  })));
  console.log("[Krónan match] rejected candidates:", matchResult.candidates
    .filter((candidate) => candidate.rejectedBecause)
    .map((candidate) => ({
      productName: candidate.product.name,
      rejectedBecause: candidate.rejectedBecause,
    })));
  console.log("[Krónan match] chosen product:", chosen ? {
    sku: chosen.sku,
    name: chosen.name,
    price: activeProductPrice(chosen),
    why: matchResult.selectedCandidate ? matchResult.selectedCandidate.reasons : [],
    cheapMode: matchResult.cheapMode,
  } : null);

  if (!chosen) {
    const fallback = {
      key: item.key,
      ingredientName: item.name || mapping.ingredientName,
      matchedProductName: null,
      sku: null,
      quantityNeeded,
      unit: item.unit,
      packageSize: null,
      packageCount: null,
      unitPrice: Number(item.unitPrice || item.mockPrice || item.price || 0),
      totalPrice: Number(item.mockPrice || item.price || 0),
      image: null,
      priceSource: "estimated",
      source: "estimated",
      sourceName: "Matval estimate",
      storeName: null,
      productNameMatched: null,
      productId: null,
      barcode: null,
      observedAt: null,
      fetchedAt: null,
      confidence: "low",
      sourceLabel: "Áætlað verð",
      isEstimated: true,
    };
    console.log("[Krónan match] price source:", { ingredientName: fallback.ingredientName, isEstimated: true, sourceLabel: fallback.sourceLabel });
    return fallback;
  }

  const packageSize = parsePackageSize(chosen, mapping);
  const packageCount = calculatePackageCount(quantityNeeded, packageSize, item.unit);
  const unitPrice = activeProductPrice(chosen);

  const matched = {
    key: item.key,
    ingredientName: mapping.ingredientName || item.name,
    matchedProductName: chosen.name,
    sku: chosen.sku,
    quantityNeeded,
    unit: item.unit,
    packageSize: packageSizeLabel(packageSize),
    packageCount,
    unitPrice,
    totalPrice: unitPrice * packageCount,
    image: chosen.thumbnail,
    priceSource: "store",
    source: "kronan",
    sourceName: "Krónan",
    storeName: "Krónan",
    productNameMatched: chosen.name,
    productId: chosen.sku,
    barcode: chosen.barcode || null,
    observedAt: null,
    fetchedAt: new Date().toISOString(),
    confidence: "high",
    sourceLabel: "Verð frá Krónunni",
    isEstimated: false,
  };
  console.log("[Krónan match] price source:", { ingredientName: matched.ingredientName, isEstimated: false, sourceLabel: matched.sourceLabel });
  return matched;
}

async function matchProductItem(item, options = {}) {
  const traceId = options.traceId || "no-trace";
  const ingredientName = item.name || item.ingredientName || "";
  const { key, mapping } = mappingForIngredientName(ingredientName);
  const quantityNeeded = Number(item.quantity ?? item.amount ?? 0);
  const unit = item.unit || mapping.expectedUnit || "stk";

  console.log("[TRACE SERVER]", traceId, "search query", mapping.searchQuery);
  console.log("[Krónan match-products] ingredientName:", ingredientName);
  console.log("[Krónan match-products] search query:", mapping.searchQuery);

  let products = [];
  try {
    products = await searchKronanProducts(mapping.searchQuery);
  } catch (error) {
    console.error("[Krónan match-products] Krónan search failed:", ingredientName, error.message);
  }

  const matchResult = chooseBestProduct(products, mapping, options);
  const chosen = matchResult.product;
  console.log("[TRACE SERVER]", traceId, "kronan candidates", matchResult.candidates.map((candidate) => ({
    name: candidate.product.name,
    price: candidate.price,
    sku: candidate.product.sku,
    rejectedBecause: candidate.rejectedBecause,
  })));
  console.log("[TRACE SERVER]", traceId, "rejected candidates", matchResult.candidates
    .filter((candidate) => candidate.rejectedBecause)
    .map((candidate) => ({
      productName: candidate.product.name,
      rejectedBecause: candidate.rejectedBecause,
    })));
  console.log("[Krónan match-products] candidate products:", matchResult.candidates.map((candidate) => ({
    sku: candidate.product.sku,
    name: candidate.product.name,
    price: candidate.price,
    score: candidate.score,
    valid: candidate.valid,
    reasons: candidate.reasons,
    rejectedBecause: candidate.rejectedBecause,
  })));
  console.log("[TRACE SERVER]", traceId, "selected match", chosen);
  console.log("[Krónan match-products] selected product:", chosen ? {
    sku: chosen.sku,
    name: chosen.name,
    price: activeProductPrice(chosen),
    reasons: matchResult.selectedCandidate ? matchResult.selectedCandidate.reasons : [],
  } : null);

  if (!chosen) {
    return {
      key,
      ingredientName,
      matchedProductName: null,
      sku: null,
      unitPrice: Number(item.estimatedPrice || item.mockPrice || item.price || 0),
      packageSize: null,
      packageCount: null,
      totalPrice: Number(item.estimatedPrice || item.mockPrice || item.price || 0),
      source: "estimated",
      priceSource: "estimated",
      sourceName: "Matval estimate",
      storeName: null,
      productNameMatched: null,
      productId: null,
      barcode: null,
      observedAt: null,
      fetchedAt: null,
      confidence: "low",
      sourceLabel: "Áætlað verð",
      isEstimated: true,
    };
  }

  const packageSize = parsePackageSize(chosen, mapping);
  const packageCount = calculatePackageCount(quantityNeeded, packageSize, unit);
  const unitPrice = activeProductPrice(chosen);

  return {
    key,
    ingredientName,
    matchedProductName: chosen.name,
    sku: chosen.sku,
    unitPrice,
    packageSize: packageSizeLabel(packageSize),
    packageCount,
    totalPrice: unitPrice * packageCount,
    source: "kronan",
    priceSource: "store",
    sourceName: "Krónan",
    storeName: "Krónan",
    productNameMatched: chosen.name,
    productId: chosen.sku,
    barcode: chosen.barcode || null,
    observedAt: null,
    fetchedAt: new Date().toISOString(),
    confidence: "high",
    sourceLabel: "Verð frá Krónunni",
    isEstimated: false,
  };
}

async function handleKronanApi(req, res, url) {
  if (!requireToken(res)) return;

  try {
    if (req.method === "GET" && (url.pathname === "/api/kronan/debug" || url.pathname === "/api/kronan-debug")) {
      return handleKronanDebug(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/kronan/match-shopping-list") {
      const body = await readRequestBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      const goals = Array.isArray(body.goals) ? body.goals : [];
      const matchedItems = await Promise.all(items.map((item) => matchShoppingListItem(item, { goals })));
      const totalPrice = matchedItems.reduce((total, item) => total + item.totalPrice, 0);
      const payload = { items: matchedItems, totalPrice };
      console.log("[Krónan match] final calculated shopping list:", payload);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && (url.pathname === "/api/kronan/match-products" || url.pathname === "/api/kronan-match-products")) {
      const body = await readRequestBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      const goals = Array.isArray(body.goals) ? body.goals : [];
      const traceId = body.traceId || `server-trace-${Date.now()}`;
      console.log("[TRACE SERVER]", traceId, "received items", items);
      const matchedItems = await Promise.all(items.map((item, index) => matchProductItem(item, { goals, traceId, logRawSearch: index === 0 })));
      const totalPrice = matchedItems.reduce((total, item) => total + item.totalPrice, 0);
      const payload = { items: matchedItems, totalPrice };
      console.log("[TRACE SERVER]", traceId, "response items", matchedItems);
      console.log("[Krónan match-products] response:", payload);
      return sendJson(res, 200, payload);
    }

    if (req.method === "GET" && url.pathname === "/api/kronan/search") {
      const q = (url.searchParams.get("q") || "").trim();
      if (!q) return sendError(res, 400, "Missing q query parameter");

      const payload = await kronanFetch("/api/v1/products/search/", {
        method: "POST",
        body: JSON.stringify(kronanProductSearchBody(q)),
      });
      return sendJson(res, 200, { products: normalizeProducts(payload) });
    }

    const productMatch = url.pathname.match(/^\/api\/kronan\/product\/([^/]+)$/);
    if (req.method === "GET" && productMatch) {
      const sku = encodeURIComponent(productMatch[1]);
      const payload = await kronanFetch(`/api/v1/products/${sku}/`);
      return sendJson(res, 200, { product: normalizeProduct(payload) });
    }

    if (req.method === "GET" && url.pathname === "/api/kronan/categories") {
      const payload = await kronanFetch("/api/v1/categories/");
      return sendJson(res, 200, payload);
    }

    const categoryMatch = url.pathname.match(/^\/api\/kronan\/category\/([^/]+)\/products$/);
    if (req.method === "GET" && categoryMatch) {
      const slug = encodeURIComponent(categoryMatch[1]);
      const page = encodeURIComponent(url.searchParams.get("page") || "1");
      const payload = await kronanFetch(`/api/v1/categories/${slug}/products/?page=${page}`);
      return sendJson(res, 200, { products: normalizeProducts(payload) });
    }

    return sendError(res, 404, "API endpoint not found");
  } catch (error) {
    console.error("Krónan API error:", error);
    return sendError(res, error.status || 502, "Failed to fetch from Krónan API");
  }
}

function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/"
    ? "/index.html"
    : url.pathname === "/debug/kronan"
      ? "/debug-kronan.html"
      : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/kronan")) {
    handleKronanApi(req, res, url);
    return;
  }
  serveStatic(req, res, url);
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Matval server running at http://${HOST}:${PORT}`);
    logKronanAuthDiagnostics();
  });
}

module.exports = {
  activeProductPrice,
  chooseBestProduct,
  handleKronanApi,
  mappingForIngredientName,
  normalizeProduct,
  normalizeProducts,
  normalizeText,
  packageSizeLabel,
  calculatePackageCount,
  parsePackageSize,
  productScore,
  scoreCandidates,
};
