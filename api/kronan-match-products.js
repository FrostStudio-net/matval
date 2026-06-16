const { URL } = require("url");
const { handleKronanApi } = require("../server");

module.exports = async function kronanMatchProducts(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  url.pathname = "/api/kronan/match-products";
  return handleKronanApi(req, res, url);
};
