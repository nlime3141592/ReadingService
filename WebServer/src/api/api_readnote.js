module.exports = {
  init: __init,
};

const utility = require("../utility.js");
const addBookReport = require("../../NotionAPI/book/addBookReport.js");
const verifyJWE = require("../../JWE/verifyJWE.js");

function __init(app) {
  app.get("/readnote", __readnote);
  app.post("/readnote/upload", __post_readnote_upload);
}

function __readnote(req, res) {
  res.sendFile(utility.getHtmlPath("./fr_bookReport.html"));
}

async function __post_readnote_upload(req, res) {
  try {
    const requestBody = req.body;
    const { jwe } = requestBody;

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
    if (!pageId) res.status(404).send("Page ID not found");

    const responseUpload = await addBookReport.addBookReport(
      token,
      pageId,
      requestBody["isbn"],
      requestBody["report"],
      requestBody["bookName"]
    );

    return res
      .status(200)
      .json({ message: "Report uploaded successfully", data: responseUpload });
  } catch (error) {
    console.error("Error in __readnote_upload:", error);
    return res.status(500).send("Internal Server Error");
  }
}
