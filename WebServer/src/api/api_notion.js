module.exports = {
  init: __init,
};

const verifyJWE = require("../../JWE/verifyJWE.js");
const getBookRank = require("../../NotionAPI/book/getBookRank.js");
const updateBookRank = require("../../NotionAPI/book/updateBookRank.js");

function __init(app) {
  app.post("/notion/rank/get/isbn", __post_notion_rank_get_isbn);
  app.patch("/notion/rank/update/isbn", __post_notion_rank_update_isbn);
}

async function __post_notion_rank_get_isbn(req, res) {
  try {
    const requestBody = req.body;
    const isbn = requestBody["isbn"];
    const jwe = requestBody["jwe"];

    if (!isbn || !jwe) {
      return res.status(400).send({ error: "ISBN and JWE are required." });
    }

    const token = await verifyJWE.verifyJWE(jwe);
    const pageId = await verifyJWE.getAccessablePageId(token);
    const rank = await getBookRank.getBookRankByISBN(token, pageId, isbn);

    return res.status(200).send(rank);
  } catch (error) {
    console.error("Error fetching book rank:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

async function __post_notion_rank_update_isbn(req, res) {
  try {
    const requestBody = req.body;
    const isbn = requestBody["isbn"];
    const jwe = requestBody["jwe"];
    const rank = requestBody["rank"];
    if (!isbn || !jwe || !rank) {
      return res
        .status(400)
        .send({ error: "ISBN and JWE and RANK are required." });
    }

    const token = await verifyJWE.verifyJWE(jwe);
    const pageId = await verifyJWE.getAccessablePageId(token);
    const updateResult = await updateBookRank.updateBookRank(
      token,
      pageId,
      isbn,
      rank
    );
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error fetching book rank:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}
