const axios = require("axios");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const xml2js = require("xml2js");

// MongoDB 설정
const MONGO_URI = "mongodb+srv://kyesjh:6fI0LzAzk8gTILfT@cluster0.5n9fk.mongodb.net/book?retryWrites=true&w=majority";
const TTB_KEY = "api key"; // 알라딘 API Key
const LOG_FILE = "info_fetch_log.json"; // 로그 파일 이름

// MongoDB 스키마 및 모델 정의
const keywordSchema = new mongoose.Schema({
  isbn13: String,
});
const Keyword = mongoose.model("bookisbn", keywordSchema, "bookisbn"); // 컬렉션 이름 변경

const bookInfoSchema = new mongoose.Schema({
  title: String,
  link: String,
  author: String,
  pubdate: String,
  description: String,
  isbn13: String,
  pricesales: Number,
  pricestandard: Number,
  mallType: String,
  stockstatus: String,
  cover: String,
  publisher: String,
  salesPoint: Number,
  customerReviewRank: Number, // 고객 리뷰 평점 추가
});
const BookInfo = mongoose.model("bookinfo", bookInfoSchema, "bookinfo");

// 마지막 처리된 로그 읽기
async function readLog() {
  try {
    const data = await fs.readFile(LOG_FILE, "utf-8");
    const log = JSON.parse(data);
    return log.lastIndex || 0; // 마지막 처리된 인덱스를 반환
  } catch {
    console.log("No log file found. Starting from the first record.");
    return 0; // 로그 파일이 없으면 처음부터 시작
  }
}

// 로그 파일 저장
async function writeLog(lastIndex) {
  const log = { lastIndex };
  try {
    await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
    console.log(`Log updated: Last index = ${lastIndex}`);
  } catch (err) {
    console.error("Failed to write log:", err.message);
  }
}

// 알라딘 API 요청 함수
async function fetchBookInfo(isbn13) {
  const url = `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?output=xml&Version=20131101&ttbkey=${TTB_KEY}&itemIdType=ISBN13&ItemId=${isbn13}`;
  try {
    const response = await axios.get(url);
    const xmlData = response.data;

    // XML을 JSON으로 변환
    const parsedData = await xml2js.parseStringPromise(xmlData, { explicitArray: false });

    // 에러 메시지 확인
    if (parsedData?.error?.errorMessage?.includes("쿼리 제한횟수 일일 5천회를 초과하였습니다")) {
      throw new Error("API request limit exceeded. Stopping execution.");
    }

    // 응답에서 item 정보 추출
    const item = parsedData?.object?.item;
    if (item) {
      return {
        title: item.title || "",
        link: item.link || "",
        author: item.author || "",
        pubdate: item.pubDate || "",
        description: item.description || "",
        isbn13: item.isbn13 || "",
        pricesales: parseInt(item.priceSales, 10) || 0,
        pricestandard: parseInt(item.priceStandard, 10) || 0,
        mallType: item.mallType || "",
        stockstatus: item.stockStatus || "",
        cover: item.cover || "",
        publisher: item.publisher || "",
        salesPoint: parseInt(item.salesPoint, 10) || 0,
        customerReviewRank: parseFloat(item.customerReviewRank) || 0, // 고객 리뷰 평점 추가
      };
    } else {
      console.log(`No item found for ISBN: ${isbn13}`);
      return null;
    }
  } catch (err) {
    if (err.message.includes("API request limit exceeded")) {
      console.error(err.message);
      throw err; // 한계 초과 에러를 상위로 전달
    } else {
      console.error(`Error fetching data for ISBN ${isbn13}:`, err.message);
      return null;
    }
  }
}

// MongoDB에 데이터 저장
async function saveBookInfo(bookInfo) {
  try {
    const result = await BookInfo.updateOne(
      { isbn13: bookInfo.isbn13 }, // ISBN13을 기준으로 중복 체크
      { $set: bookInfo }, // 데이터를 업데이트하거나 삽입
      { upsert: true } // 중복된 데이터가 없으면 새로 삽입
    );
    console.log(`Saved book info for ISBN: ${bookInfo.isbn13}, Result: ${JSON.stringify(result)}`);
  } catch (err) {
    console.error("Error saving book info:", err.message);
  }
}

// 실행 로직
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // 로그에서 마지막 처리된 인덱스 읽기
    const lastIndex = await readLog();

    // bookisbn 컬렉션에서 데이터를 정렬된 순서로 가져오기
    const keywords = await Keyword.find({}).sort({ _id: 1 });
    console.log(`Found ${keywords.length} keywords.`);

    for (let i = lastIndex; i < keywords.length; i++) {
      const keyword = keywords[i];
      console.log(`Fetching book info for ISBN: ${keyword.isbn13}`);
      try {
        const bookInfo = await fetchBookInfo(keyword.isbn13);
        if (bookInfo) {
          await saveBookInfo(bookInfo);
        }
        // 처리된 인덱스를 로그 파일에 저장
        await writeLog(i + 1);
      } catch (err) {
        if (err.message.includes("API request limit exceeded")) {
          console.log("Stopping execution due to API request limit.");
          break; // 작업 중단
        }
      }
    }

    mongoose.connection.close();
    console.log("Completed fetching and saving all book info.");
  } catch (err) {
    console.error("Error during execution:", err.message);
  }
})();
