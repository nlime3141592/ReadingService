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
    const { isbn, jwe } = requestBody;

    if (!isbn || !jwe) {
      return res.status(422).send({
        error: "Missing required fields.",
        details: { isbn: !isbn, jwe: !jwe },
      });
    }

    let token;
    try {
      token = await verifyJWE.verifyJWE(jwe);
      if (!token) {
        return res.status(400).send({ error: "Invalid JWE" });
      }
    } catch (error) {
      console.error("Error verify JWE:", error);
      return res.status(400).send();
    }

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
    const { isbn, jwe, rank, bookName } = requestBody;
    console.log(bookName);
    if (!isbn || !jwe || !rank) {
      return res.status(422).send({
        error: "Missing required fields.",
        details: { isbn: !isbn, jwe: !jwe, rank: !rank },
      });
    }

    let token;
    try {
      token = await verifyJWE.verifyJWE(jwe);
      if (!token) {
        return res.status(400).send({ error: "Invalid JWE" });
      }
    } catch (error) {
      console.error("Error verify JWE:", error);
      return res.status(400).send();
    }
    const pageId = await verifyJWE.getAccessablePageId(token);
    const updateResult = await updateBookRank.updateBookRank(
      token,
      pageId,
      isbn,
      rank,
      bookName
    );
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error fetching book rank:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}
