// NOTE: 이 곳에 외부로 노출시킬 함수를 정의합니다. JSON 형식으로 정의합니다.
module.exports = {
    getStaticDirectory: __getStaticDirectory,
    getHtmlPath: __getHtmlPath,
    // getHtmlAsync: __getHtmlAsync, // NOTE: Deprecated.
    printLog: __printLog,
    printLogWithName: __printLogWithName
}

const path = require("path")
const fs = require("fs").promises

function __getStaticDirectory()
{
    return path.resolve("./static")
}

function __getHtmlPath(relpath)
{
    let relpathFromProject = __getStaticDirectory() + "/html/" + relpath
    relpathFromProject = relpathFromProject.replace("//", "/")
    return path.resolve(relpathFromProject)
}

async function __getHtmlAsync(relpath)
{
    return await fs.readFile(__getHtmlPath(relpath))
}

function __printLog(message)
{
    messageFormat = ` * ${message}`
    console.log(messageFormat)

    // NOTE: 이 곳에 로그 메시지를 파일에 저장하는 코드를 추가할 수 있습니다.
}

function __printLogWithName(message, name)
{
    nameFormat = `[${name}]`
    messageFormat = `${nameFormat} ${message}`

    __printLog(messageFormat)
}