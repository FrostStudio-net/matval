const { URL } = require("url");
const { handleKronanApi } = require("../../server");

module.exports = async function kronanApi(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  return handleKronanApi(req, res, url);
};
