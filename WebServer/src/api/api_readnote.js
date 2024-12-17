module.exports = {
  init: __init,
};

const utility = require("../utility.js");
const addBookReport = require("../../../NotionAPI/book/addBookReport.js");
const verifyJWE = require("../../../JWE/verifyJWE.js");

function __init(app) {
  app.get("/readnote", __readnote);
  app.post("/readnote/upload", __readnote_upload);
}

function __readnote(req, res) {}

async function __readnote_upload(req, res) {
  try {
    const requestBody = req.body;

    const token = await verifyJWE.verifyJWE(requestBody["jwe"]);
    if (!token) return res.status(400).send("Invalid JWE");

    const pageId = await verifyJWE.getAccessablePageId(token);
    if (!pageId) res.status(400).send("Page ID not found");

    const responseUpload = await addBookReport.addBookReport(
      pageId,
      requestBody["isbn"],
      requestBody["report"]
    );

    return res
      .status(200)
      .json({ message: "Report uploaded successfully", data: responseUpload });
  } catch (error) {
    console.error("Error in __readnote_upload:", error);
    return res.status(500).send("Internal Server Error");
  }
}
