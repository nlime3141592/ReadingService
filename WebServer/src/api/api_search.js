module.exports = {
    init: __init
}

const utility = require("../utility.js")
const dbQuery = require("../db/db_query.js")

const BOOKS_PER_PAGE = 10

function __init(app)
{
    app.get("/search/all/:pageNum", __get_search_all)
    app.get("/search/by-isbn13/:isbn13/:pageNum", __get_search_by_isbn13)
    app.get("/search/by-keyword/:keyword/:pageNum", __get_search_by_keyword)
    app.get("/search/by-recommendation/:pageNum", __get_search_by_recommendation)
    app.get("/search/by-history/:pageNum", __get_search_by_history)
}

function __get_search_all(req, res)
{
    let { pageNum } = req.params

    jsonPages = dbQuery.query_page_from_all_books(pageNum, BOOKS_PER_PAGE)
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (전체)")
}

function __get_search_by_isbn13(req, res)
{
    let { isbn13, pageNum } = req.params

    jsonPages = dbQuery.query_page_from_isbn13(isbn13, pageNum, BOOKS_PER_PAGE)
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (isbn13)")
}

function __get_search_by_keyword(req, res)
{
    let { keyword, pageNum } = req.params

    jsonPages = dbQuery.query_page_from_keyword(keyword, pageNum, BOOKS_PER_PAGE)
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (키워드 검색)")
}

function __get_search_by_recommendation(req, res)
{
    let { pageNum } = req.params

    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (추천 도서)")
}

function __get_search_by_history(req, res)
{
    let { pageNum } = req.params

    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLog("검색 요청 처리 완료 (독서 기록)")
}