module.exports = {
  init: __init,
};

const utility = require("../utility.js");
const dbQuery = require("../db/db_query.js");

function __init(app) {
  app.get("/search/all", __get_search_all);
  app.get("/search/by-isbn13/:isbn13", __get_search_by_isbn13);
  app.get("/search/by-keyword/:keyword", __get_search_by_keyword);
  app.get("/search/by-recommendation", __get_search_by_recommendation);
  app.get("/search/by-history", __get_search_by_history);
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
  let modulePath = utility.getPythonPath("api_recommendation.py");

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
  let command = `python ${modulePath} \"음악/미술/수학/경제/\" \"사회/문화/체육/국어/\" \"컴퓨터/정보/과학/진로/미래/전기/공학/기계/조각/\"`;
  let { stdout, stderr } = await utility.execPromise(command);

  if (stdout === "")
  {
    utility.printLogWithName("검색 요청 처리 실패 (추천 도서)", "Search API");
    res.send([])
  }
  else
  {
    let temp_pageNum = 1
    let temp_booksPerPage = 12

    // NOTE:
    // stdout에서 최종 결과가 출력됩니다.
    // WordAI/recommender.py 함수의 recommend_one_keyword() 함수의 결과입니다.
    // TODO:
    // 한국어의 인코딩 문제로 인한 글자 깨짐 현상을 해결해야 합니다. (영어는 잘 됩니다.)
    utility.printLogWithName(`키워드 추천 성공 ! 키워드 == ${stdout}`, "Search API - TEST")

    bookList = await dbQuery.query_page_from_keyword(
      stdout,
      temp_pageNum,
      temp_booksPerPage
    );
    let temp_jsonString = JSON.stringify(bookList)
    res.send(temp_jsonString);
    
    utility.printLogWithName("검색 요청 처리 완료 (추천 도서)", "Search API");
  }
}

function __get_search_by_history(req, res) {
  jsonPages = {
    "test-json": "please-this-json-remove-after-test",
  };
  res.send(JSON.stringify(jsonPages));

  utility.printLogWithName("검색 요청 처리 완료 (독서 기록)", "Search API");
}
