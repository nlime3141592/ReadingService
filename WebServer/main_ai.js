module.exports = {
    init: __init
}

const { spawn } = require("child_process")
const path = require("path")

const utility = require("./src/utility.js")

let pythonProcess = null

async function __init()
{
    return new Promise((resolve, reject) => {
        let aiModulePath = utility.getPythonPath("word2vec.py")
        pythonProcess = spawn("python", [aiModulePath])
    
        pythonProcess.stdout.on("data", (data) => {
            const message = data.toString().trim()

            if (message === "<INITIALIZED>") {
                resolve()
            }
            else {
                utility.printLogWithName(data, "PythonAI")
            }
        })

        pythonProcess.stderr.on("data", (data) => {
            utility.printLogWithName(data, "PythonAI")
        })

        pythonProcess.on("close", (code) => {
            utility.printLogWithName(`AI process exited with code ${code}.`, "PythonAI")
        })
    })
}