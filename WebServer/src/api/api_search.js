module.exports = {
  init: __init,
};

const axios = require("axios");
const utility = require("../utility.js");
const dbQuery = require("../db/db_query.js");
const verifyJWE = require("../../JWE/verifyJWE.js");
const getBookRank = require("../../NotionAPI/book/getBookRank.js");

function __init(app) {
  app.get("/search/all", __get_search_all);
  app.get("/search/by-isbn13/:isbn13", __get_search_by_isbn13);
  app.get("/search/by-keyword/:keyword", __get_search_by_keyword);
  app.get("/search/by-recommendation", __get_search_by_recommendation);
  app.post("/search/by-history", __post_search_by_history);
}

// NOTE: OK.
async function __get_search_all(req, res) {
  let { pageNum, booksPerPage } = req.query;

  bookList = await dbQuery.query_page_from_all_books(pageNum, booksPerPage);
  res.send(JSON.stringify(bookList));

  if (bookList.length === 0)
    utility.printLogWithName("검색 요청 결과 없음 (전체)", "Search API");
  else utility.printLogWithName("검색 요청 처리 완료 (전체)", "Search API");
}

// NOTE: OK.
async function __get_search_by_isbn13(req, res) {
  let { isbn13 } = req.params;

  jsonBook = await dbQuery.query_book_info_by_isbn13(isbn13);
  res.send(JSON.stringify(jsonBook));

  utility.printLogWithName("검색 요청 처리 완료 (isbn13)", "Search API");
}

// NOTE: OK.
async function __get_search_by_keyword(req, res) {
  let { keyword } = req.params;
  let { pageNum, booksPerPage } = req.query;

  bookList = await dbQuery.query_page_from_keyword(
    keyword,
    pageNum,
    booksPerPage
  );
  res.send(JSON.stringify(bookList));

  if (bookList.length === 0)
    utility.printLogWithName("검색 요청 결과 없음 (키워드 검색)", "Search API");
  else
    utility.printLogWithName("검색 요청 처리 완료 (키워드 검색)", "Search API");
}

async function __get_search_by_recommendation(req, res) {
  // NOTE:
  // 추천 시스템을 사용하기 위한 Sub Process를 호출합니다.
  // python ${modulePath} <좋아요키워드리스트> <싫어요키워드리스트> <랜텀키워드리스트>
  // 모든 키워드 리스트는 (키워드 + /)의 나열로 제공되어야 합니다.
  // NOTE:
  // 랜덤 키워드 리스트 중 싫어요 성향이 없으면서 좋아요 성향이 높은 키워드 하나를 반환합니다.
  // 좋아요 키워드 리스트: 최대 10개
  // 싫어오 키워드 리스트: 최대 10개
  // 랜덤 키워드 리스트: 최대 100개
  // TODO:
  // 랜덤 키워드 리스트는 DB에서 아무 키워드나 쿼리하면 됩니다.
  const data = {
    positiveKeywords: "음악/미술/수학/경제/",
    negativeKeywords: "사회/문화/체육/국어/",
    randomKeywords: "컴퓨터/정보/과학/진로/미래/전기/공학/기계/조각/",
  };

  // TODO: 최종 배포할 때 host 주소를 올바르게 설정해야 합니다.
  const host = "localhost";
  const recommendationResponse = await axios.post(
    `http://${host}:8088/ai/recommendation`,
    data
  );
  let selectedKeyword = recommendationResponse.data.trim();

  if (selectedKeyword === "") {
    utility.printLogWithName("검색 요청 처리 실패 (추천 도서)", "Search API");
    res.send([]);
  } else {
    let temp_pageNum = 1;
    let temp_booksPerPage = 12;

    utility.printLogWithName(
      `키워드 추천 성공 ! 키워드 == ${selectedKeyword}`,
      "Search API - TEST"
    );

    bookList = await dbQuery.query_page_from_keyword(
      selectedKeyword,
      temp_pageNum,
      temp_booksPerPage
    );
    let temp_jsonString = JSON.stringify(bookList);
    res.send(temp_jsonString);

    utility.printLogWithName("검색 요청 처리 완료 (추천 도서)", "Search API");
  }
}

async function __post_search_by_history(req, res) {
  try {
    const requestBody = req.body;

    const token = await verifyJWE.verifyJWE(requestBody["jwe"]);
    if (!token) return res.status(400).send("Invalid JWE");

    const pageId = await verifyJWE.getAccessablePageId(token);
    if (!pageId) res.status(400).send("Page ID not found");

    const responseEveryRank = await getBookRank.getEveryBookRank(token, pageId);
    utility.printLogWithName("검색 요청 처리 완료 (독서 기록)", "Search API");
    return res.status(200).send(JSON.stringify(responseEveryRank));
  } catch (error) {
    console.error("Error in __get_search_by_history:", error);
    return res.status(500).send("Internal Server Error");
  }
}
