module.exports = {
    query_page_from_all_books: __query_page_from_all_books,
    query_book_info_by_isbn13: __query_book_info_by_isbn13,
    query_page_from_keyword: __query_page_from_keyword
}

const utility = require("../utility.js")
const db_connection = require("./db_connection.js")

async function __query_page_from_all_books(pageNum, booksPerPage)
{
    const dbBook = db_connection.get_db("book")
    const sourceCollection = dbBook.collection("bookisbn")

    booksPerPage = Number(booksPerPage)
    let skipBookNum = pageNum * booksPerPage

    const query = {}
    const batch = await sourceCollection
        .find(query)
        // .sort({ _id: 1 })
        .skip(skipBookNum)
        .limit(booksPerPage)
        .toArray()

    if (batch.length === 0) 
    {
        utility.printLogWithName("No data gets.", "dbQuery")
    }
    else
    {
        for (let result of batch)
        {
            utility.printLogWithName(JSON.stringify(result), "dbQuery")
        }
    }
}

async function __query_book_info_by_isbn13(isbn13)
{
    const dbBook = db_connection.get_db("book")
    const sourceCollection = dbBook.collection("bookisbn")

    const query = { isbn13: isbn13 }
    const batch = await sourceCollection
        .find(query)
        .toArray()

    if (batch.length === 0) 
    {
        utility.printLogWithName("No data gets.", "dbQuery")
        return {}
    }
    else
    {
        utility.printLogWithName("Success query by-isbn13.", "dbQuery")
        return batch[0]
    }
}

async function __query_page_from_keyword(keyword, pageNum, booksPerPage)
{
    const dbBook = db_connection.get_db("book")
    const sourceCollection = dbBook.collection("bookisbn")

    keywordList = keyword.split(" ")

    booksPerPage = Number(booksPerPage)
    let skipBookNum = pageNum * booksPerPage

    const query = {}
    const batch = await sourceCollection
        .find(query)
        // .sort({ _id: 1 })
        .skip(skipBookNum)
        .limit(booksPerPage)
        .toArray()

    if (batch.length === 0) 
    {
        utility.printLogWithName("No data gets.", "dbQuery")
    }
    else
    {
        for (let result of batch)
        {
            utility.printLogWithName(JSON.stringify(result), "dbQuery")
        }
    }
}