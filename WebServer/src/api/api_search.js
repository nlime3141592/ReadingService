module.exports = {
    init: __init
}

const utility = require("../utility.js")
const dbQuery = require("../db/db_query.js")

function __init(app)
{
    app.get("/search/all", __get_search_all)
    app.get("/search/by-isbn13/:isbn13", __get_search_by_isbn13)
    app.get("/search/by-keyword/:keyword", __get_search_by_keyword)
    app.get("/search/by-recommendation", __get_search_by_recommendation)
    app.get("/search/by-history", __get_search_by_history)
}

function __get_search_all(req, res)
{
    let { pageNum, booksPerPage } = req.query

    jsonPages = dbQuery.query_page_from_all_books(pageNum, booksPerPage)
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (전체)")
}

function __get_search_by_isbn13(req, res)
{
    let { isbn13 } = req.params
    let { pageNum, booksPerPage } = req.query

    jsonPages = dbQuery.query_page_from_isbn13(isbn13, pageNum, booksPerPage)
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (isbn13)")
}

function __get_search_by_keyword(req, res)
{
    let { keyword } = req.params
    let { pageNum, booksPerPage } = req.query

    jsonPages = dbQuery.query_page_from_keyword(keyword, pageNum, booksPerPage)
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (키워드 검색)")
}

async function __get_search_by_recommendation(req, res)
{
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    let modulePath = utility.getPythonPath("api_recommendation.py")

    let command = `python ${modulePath}`
    let execSuccess = await utility.execPromise(command)

    if (execSuccess === true)
        utility.printLog("검색 요청 처리 완료 (추천 도서)")
    else
        utility.printLog("검색 요청 처리 실패 (추천 도서)")
}

function __get_search_by_history(req, res)
{
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (독서 기록)")
}