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

// NOTE: OK.
async function __get_search_all(req, res)
{
    let { pageNum, booksPerPage } = req.query

    bookList = await dbQuery.query_page_from_all_books(pageNum, booksPerPage)
    res.send(JSON.stringify(bookList))

    if (bookList.length === 0)
        utility.printLogWithName("검색 요청 결과 없음 (전체)", "Search API")
    else
        utility.printLogWithName("검색 요청 처리 완료 (전체)", "Search API")
}

// NOTE: OK.
async function __get_search_by_isbn13(req, res)
{
    let { isbn13 } = req.params

    jsonBook = await dbQuery.query_book_info_by_isbn13(isbn13)
    res.send(JSON.stringify(jsonBook))

    utility.printLogWithName("검색 요청 처리 완료 (isbn13)", "Search API")
}

// NOTE: OK.
async function __get_search_by_keyword(req, res)
{
    let { keyword } = req.params
    let { pageNum, booksPerPage } = req.query

    bookList = await dbQuery.query_page_from_keyword(keyword, pageNum, booksPerPage)
    res.send(JSON.stringify(bookList))

    if (bookList.length === 0)
        utility.printLogWithName("검색 요청 결과 없음 (키워드 검색)", "Search API")
    else
        utility.printLogWithName("검색 요청 처리 완료 (키워드 검색)", "Search API")
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
        utility.printLogWithName("검색 요청 처리 완료 (추천 도서)", "Search API")
    else
        utility.printLogWithName("검색 요청 처리 실패 (추천 도서)", "Search API")
}

function __get_search_by_history(req, res)
{
    jsonPages = {
        "test-json": "please-this-json-remove-after-test"
    }
    res.send(JSON.stringify(jsonPages))

    utility.printLogWithName("검색 요청 처리 완료 (독서 기록)", "Search API")
}