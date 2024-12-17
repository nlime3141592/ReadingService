module.exports = {
    query_page_from_all_books: __query_page_from_all_books,
    query_page_from_isbn13: __query_page_from_isbn13,
    query_page_from_keyword: __query_page_from_keyword
}

const utility = require("../utility.js")
const db_connection = require("./db_connection.js")

async function __query_page_from_all_books(pageNum, booksPerPage)
{
    const dbBook = db_connection.get_db("book")
    const sourceCollection = dbBook.collection("bookkeywords")

    booksPerPage = Number(booksPerPage)
    let skipBookNum = pageNum * booksPerPage

    const query = { weight: 25 }
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
            utility.printLogWithName(JSON.stringify(result), "dbQuery - TEST")
        }
    }
}

function __query_page_from_isbn13(isbn13, pageNum, booksPerPage)
{
    
}

function __query_page_from_keyword(keyword, pageNum, booksPerPage)
{

}