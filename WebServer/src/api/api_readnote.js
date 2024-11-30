module.exports = {
    init: __init
}

const utility = require("../utility.js")

function __init(app)
{
    app.get("/readnote", __readnote)
}

function __readnote(req, res)
{

}