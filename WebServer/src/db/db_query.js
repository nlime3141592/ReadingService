module.exports = {
  query_page_from_all_books: __query_page_from_all_books,
  query_book_info_by_isbn13: __query_book_info_by_isbn13,
  query_page_from_keyword: __query_page_from_keyword,
};

const utility = require("../utility.js");
const db_connection = require("./db_connection.js");

async function __query_page_from_all_books(pageNum, booksPerPage) {
  const dbBook = db_connection.get_db("book");
  const sourceCollection = dbBook.collection("bookinfo");

  booksPerPage = Number(booksPerPage);
  let skipBookNum = (pageNum - 1) * booksPerPage;

  const query = {};
  const batch = await sourceCollection
    .find(query)
    // .sort({ _id: 1 })
    .skip(skipBookNum)
    .limit(booksPerPage)
    .toArray();

  return batch;
}

async function __query_book_info_by_isbn13(isbn13) {
  const dbBook = db_connection.get_db("book");
  const sourceCollection = dbBook.collection("bookinfo");

  const query = { isbn13: isbn13 };
  const batch = await sourceCollection.find(query).toArray();

  if (batch.length === 0) {
    utility.printLogWithName("No data gets.", "dbQuery");
    return {};
  } else {
    utility.printLogWithName("Success query by-isbn13.", "dbQuery");
    return batch[0];
  }
}

async function __query_page_from_keyword(keyword, pageNum, booksPerPage) {
  const dbBook = db_connection.get_db("book");
  const sourceCollection = dbBook.collection("bookinfo");

  keywordList = keyword.split(" ");

  booksPerPage = Number(booksPerPage);
  let skipBookNum = (pageNum - 1) * booksPerPage;

  const query = {
    $or: [],
  };

  for (let key of keywordList) {
    query["$or"].push({
      title: { $regex: `.*${key}*.` },
    });

    query["$or"].push({
      author: { $regex: `.*${key}*.` },
    });
  }

  const batch = await sourceCollection
    .find(query)
    .skip(skipBookNum)
    .limit(booksPerPage)
    .toArray();

  return batch;
}
