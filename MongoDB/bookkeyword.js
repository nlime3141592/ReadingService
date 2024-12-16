const axios = require("axios");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const xml2js = require("xml2js");

// MongoDB 설정
const MONGO_URI = "mongodb+srv://kyesjh:6fI0LzAzk8gTILfT@cluster0.5n9fk.mongodb.net/book?retryWrites=true&w=majority";
const AUTH_KEY = "api key";
const LOG_FILE = "keyword_fetch_log.json"; // 로그 파일

// MongoDB 스키마 및 모델 정의
const Keyword = mongoose.model("bookkeyword", { isbn13: String, word: String, weight: Number });
const ISBN = mongoose.model("bookisbn", { isbn13: String }, "bookisbn");

// 로그 읽기
async function readLog() {
    try {
        const data = await fs.readFile(LOG_FILE, "utf-8");
        const log = JSON.parse(data);
        return log.lastIndex || 0;
    } catch {
        console.log("No log file found. Starting from the first record.");
        return 0;
    }
}

// 로그 쓰기
async function writeLog(lastIndex) {
    const log = { lastIndex };
    try {
        await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
        console.log(`Log updated: Last index = ${lastIndex}`);
    } catch (err) {
        console.error("Failed to write log:", err.message);
    }
}

// 키워드 API 요청
async function fetchKeywords(isbn13) {
    const url = `http://data4library.kr/api/keywordList?authKey=${AUTH_KEY}&isbn13=${isbn13}&additionalYN=Y`;
    try {
        const response = await axios.get(url);
        const xmlData = response.data;

        if (typeof xmlData === "string" && xmlData.includes("1일 500건 이상 요청")) {
            throw new Error("API request limit reached for the day.");
        }

        const parsedData = await xml2js.parseStringPromise(xmlData, { explicitArray: false });
        const items = parsedData?.response?.items?.item;

        if (items) {
            return Array.isArray(items) ? items : [items];
        } else {
            console.log(`No keywords found for ISBN: ${isbn13}`);
            return [];
        }
    } catch (err) {
        if (err.message.includes("API request limit reached")) {
            console.error(err.message);
            throw err;
        } else {
            console.error(`Failed to fetch keywords for ISBN ${isbn13}:`, err.message);
            return [];
        }
    }
}

// MongoDB에 키워드 저장 (배치 업데이트)
async function saveKeywordsBatch(isbn13, keywords) {
    try {
        const bulkOps = keywords.map((keyword) => ({
            updateOne: {
                filter: { isbn13, word: keyword.word },
                update: { $set: { weight: parseFloat(keyword.weight) || 0 } },
                upsert: true,
            },
        }));

        if (bulkOps.length > 0) {
            await Keyword.bulkWrite(bulkOps);
            console.log(`Keywords saved for ISBN: ${isbn13}`);
        }
    } catch (err) {
        console.error(`Error saving keywords for ISBN ${isbn13}:`, err.message);
    }
}

// 실행 로직
(async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB.");

        const lastIndex = await readLog();
        const isbns = await ISBN.find({}).sort({ _id: 1 });
        console.log(`Found ${isbns.length} ISBN records.`);

        for (let i = lastIndex; i < isbns.length; i++) {
            const isbnRecord = isbns[i];
            console.log(`Fetching keywords for ISBN: ${isbnRecord.isbn13}`);

            try {
                const keywords = await fetchKeywords(isbnRecord.isbn13);

                if (keywords.length > 0) {
                    await saveKeywordsBatch(isbnRecord.isbn13, keywords);
                }

                await writeLog(i + 1);
            } catch (err) {
                if (err.message.includes("API request limit reached")) {
                    console.log("Stopping execution due to API request limit.");
                    break;
                }
            }
        }

        mongoose.connection.close();
        console.log("Completed processing all ISBNs.");
    } catch (err) {
        console.error("Error during execution:", err.message);
    }
})();
