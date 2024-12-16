const axios = require("axios");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const xml2js = require("xml2js");

// MongoDB 설정
const MONGO_URI = "mongodb+srv://kyesjh:6fI0LzAzk8gTILfT@cluster0.5n9fk.mongodb.net/book?retryWrites=true&w=majority";
const AUTH_KEY = "api key";
const LOG_FILE = "fetch_log.json"; // 로그 파일

// MongoDB 스키마 및 모델 정의
const bookSchema = new mongoose.Schema({
  isbn13: String,
  bookname: String,
  authors: String,
  publisher: String,
  publication_year: String,
  vol: String,
  bookImageURL: String,
  bookDtlUrl: String,
  loan_count: Number,
});
const Book = mongoose.model("bookisbn", bookSchema, "bookisbn");

// 마지막 페이지 로그 읽기
async function readLog() {
  try {
    const data = await fs.readFile(LOG_FILE, "utf-8");
    const log = JSON.parse(data);
    return log.lastPage || 1;
  } catch {
    console.log("No log file found. Starting from page 1.");
    return 1; 
  }
}

// 마지막 페이지 로그 저장
async function writeLog(lastPage) {
  const log = { lastPage };
  try {
    await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
    console.log(`Log updated: Last page = ${lastPage}`);
  } catch (err) {
    console.error("Failed to write log:", err.message);
  }
}

// API 요청 함수
async function fetchBooks(pageNo, pageSize) {
  const url = `http://data4library.kr/api/srchBooks?authKey=${AUTH_KEY}&pageNo=${pageNo}&pageSize=${pageSize}`;
  try {
    const response = await axios.get(url);
    const xmlData = response.data;
    const parsedData = await xml2js.parseStringPromise(xmlData, { explicitArray: false });
    const books = parsedData.response?.docs?.doc;

    return Array.isArray(books) ? books : books ? [books] : [];
  } catch (err) {
    console.error(`Failed to fetch page ${pageNo}:`, err.message);
    return [];
  }
}

// MongoDB에 데이터 저장
async function saveBooks(books) {
  try {
    for (const book of books) {
      const bookData = {
        isbn13: book.isbn13,
        bookname: book.bookname,
        authors: book.authors,
        publisher: book.publisher,
        publication_year: book.publication_year,
        vol: Array.isArray(book.vol) ? book.vol.join(", ") : book.vol || "",
        bookImageURL: book.bookImageURL || "",
        bookDtlUrl: book.bookDtlUrl || "",
        loan_count: parseInt(book.loan_count, 10) || 0,
      };

      await Book.updateOne(
        { isbn13: bookData.isbn13 },
        { $set: bookData },
        { upsert: true }
      );
      console.log(`Saved book: ${bookData.bookname}`);
    }
  } catch (err) {
    console.error("Error saving books:", err.message);
  }
}

// 실행 로직
(async () => {
  let currentPage = await readLog(); 

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const pageSize = 1000;

    while (true) {
      console.log(`Fetching page ${currentPage}...`);
      const books = await fetchBooks(currentPage, pageSize);

      if (books.length === 0) {
        console.log("No more data to fetch. Exiting.");
        break;
      }

      await saveBooks(books);
      await writeLog(currentPage); 
      currentPage++;
    }
  } catch (err) {
    console.error("Error during execution:", err.message);
  } finally {
    await writeLog(currentPage); // 프로그램 종료 시 로그 저장
    await mongoose.connection.close();
    console.log("Completed fetching all data. Database connection closed.");
  }
})();
