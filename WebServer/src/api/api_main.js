module.exports = {
  init: __init,
};

const utility = require("../utility.js");

function __init(app) {
  app.get("/", __get_main);
}

function __get_main(req, res) {
  res.sendFile(utility.getHtmlPath("./fr_main.html"));
}
