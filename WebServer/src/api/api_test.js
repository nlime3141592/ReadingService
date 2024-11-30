module.exports = {
    init: __init
}

const { exec } = require("child_process")

const utility = require("../utility.js")

function __init(app)
{
    app.get("/test", __test)
    app.post("/test/send", __test_send)
    app.post("/test/calc/:opcode", __test_calc)
}

function __test(req, res)
{
    res.sendFile(utility.getHtmlPath("./test.html"))
}

function __test_send(req, res)
{
    let { name0, name1, input0, input1 } = req.body
    console.log(`${name0} == ${input0}, ${name1} == ${input1}`)

    res.json({
        message: "data received successfully!",
        data: req.body
    })
}

function __test_calc(req, res)
{
    let { opcode, operand_a, operand_b } = req.body

    let command = `python ../WordAI/test.py ${opcode} ${operand_a} ${operand_b}`

    function onCommandEnd(error, stdout, stderr)
    {
        if (error)
        {
            console.error(`exec error: ${error}`)
            return
        }

        if (stderr)
        {
            console.error(`stderr: ${stderr}`)
            return
        }

        utility.printLogWithName("calc operation occured.", "TestAPI")

        res.json({
            message: "calculation completed.",
            data: stdout
        })
    }

    exec(command, onCommandEnd)
}