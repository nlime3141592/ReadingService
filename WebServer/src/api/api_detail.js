module.exports = {
  init: __init,
};

const utility = require("../utility.js");

function __init(app) {
  app.get("/detail", __get_detail);
}

function __get_detail(req, res) {
  res.sendFile(utility.getHtmlPath("./fr_bookDetail.html"));
}
