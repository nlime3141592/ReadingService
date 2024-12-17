module.exports = {
  init: __init,
};

const createJWE = require("../../JWE/createJWE.js");
const verifyJWE = require("../../JWE/verifyJWE.js");
const getAccessToken = require("../../NotionAPI/login/getAccessToken.js");

function __init(app) {
  app.post("/jwe/verify", __post_jwe_verify);
  app.get("/jwe/create/:code", __get_jwe_create);
}

async function __post_jwe_verify(req, res) {
  const requestBody = req.body;
  const token = await verifyJWE.verifyJWE(requestBody["jwe"]);
  if (!token) return res.status(400).send("Invalid JWE");
  else return res.status(200);
}

async function __get_jwe_create(req, res) {
  try {
    let { code } = req.query;

    const token = await getAccessToken.getAccessToken(code);
    if (!token) {
      return res.status(400).send("Failed to obtain access token.");
    }
    const jwe = await createJWE.createJWE(token);

    const redirectUrl = `/?jwe=${jwe}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in __get_jwe_create:", error);
    res.status(500).send("Internal Server Error");
  }
}
