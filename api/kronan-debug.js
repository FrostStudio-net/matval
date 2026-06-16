const { URL } = require("url");
const { handleKronanApi } = require("../server");

module.exports = async function kronanDebug(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  url.pathname = "/api/kronan/debug";
  return handleKronanApi(req, res, url);
};
