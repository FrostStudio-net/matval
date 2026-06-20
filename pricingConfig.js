(function pricingConfigModule(global) {
  const config = {
    PRICE_MODE: "estimated",
    SHOW_PRICE_DEBUG: false,
    PRICE_MODES: {
      ESTIMATED: "estimated",
      REFERENCE: "reference",
      CACHED: "cached",
      LIVE: "live",
    },
  };

  global.MatvalPricingConfig = config;

  if (typeof module !== "undefined") {
    module.exports = config;
  }
})(typeof window !== "undefined" ? window : globalThis);
