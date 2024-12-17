console.log("load main.js");

let storedJWE = sessionStorage.getItem("jweToken");
const BOOKS_PER_PAGE = 12;

let pageNum = 1;
// isbn 리스트 | {0: 없음, 1: 추천, 2: 독서 기록}
let isbnList = [0, 0, 0];
let searchKeyword = "";
let mode = 0; // 0: 메인, 1: 추천, 2: 독서 기록, 3: 검색 기록

const statusText = document.getElementById("status-text");
const homeButton = document.getElementById("btn-home");
const recommendButton = document.getElementById("btn-recommend");
const recordButton = document.getElementById("btn-record");
const searchButton = document.getElementById("search-button");

homeButton.onclick = getHome;
recommendButton.onclick = getRecommend;
recordButton.onclick = getRecord;
searchButton.onclick = getSearch;

const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");

leftButton.onclick = () => {
  getNextPage(-1);
};
rightButton.onclick = () => {
  getNextPage(+1);
};

const loginButton = document.getElementById("login-button");
loginButton.onclick = () => {
  const loginPage = `https://api.notion.com/v1/oauth/authorize?client_id=15ed872b-594c-80f0-ab76-0037de8dd2b4&response_type=code&owner=user&redirect_uri=https%3A%2F%2Flocalhost%3A8443%2Fjwe%2Fcreate`;
  window.location.href = loginPage;
};

/**
 * 다른 HTML 페이지에서 네비게이션 바를 이용하여 이동한 경우 페이지 초기화를 위한 작업
 */
window.onload = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const jwe = urlParams.get("jwe");
  if (jwe) {
    sessionStorage.setItem("jweToken", jwe);
    storedJWE = sessionStorage.getItem("jweToken");
  }
  await isLogined();
  const eventData = JSON.parse(sessionStorage.getItem("event"));
  if (eventData) {
    const { function: funcName, mode } = eventData;
    if (funcName == "initBookList" && mode != null) {
      switch (mode) {
        case 0:
          getHome();
          break;
        case 1:
          getRecommend();
          break;
        case 2:
          getRecord();
          break;
      }
    }
    sessionStorage.removeItem("event"); // 실행 후 삭제
  } else {
    getHome();
  }
};

async function isLogined() {
  let logined = false;
  if (storedJWE != null) {
    const verifyResult = await fetch(`/jwe/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jwe: storedJWE,
      }),
    });
    if (verifyResult.ok) logined = true;
    else console.error("JWE 검증 실패:", await verifyResult.text());
  }
  if (logined) {
    document.querySelector("#btn-recommend").classList.remove("hide");
    document.querySelector("#btn-record").classList.remove("hide");
    document.querySelector("#login-button").classList.add("hide");
  }
}

/**
 * 상태 표시 텍스트를 변경
 * @param {string} string 변경할 텍스트
 */
function setStatus(string) {
  statusText.textContent = string;
}

// 홈 버튼 함수
async function getHome() {
  mode = 0;
  pageNum = 0;
  getNextPage(+1);
  setStatus("도서 목록");
}

// 추천 도서 버튼 함수
async function getRecommend() {
  mode = 1;
  pageNum = 0;
  // 서버에서 추천 받기
  isbnList[mode] = await (await fetch(`/search/by-recommendation`)).json();
  getNextPage(+1);
  setStatus("추천 도서");
}

// 독서 기록 버튼 함수
async function getRecord() {
  mode = 2;
  pageNum = 0;
  // notion 에서 리스트 가져오기
  isbnList[mode] = await (await fetch(`/search/by-history`)).json();
  getNextPage(+1);
  setStatus("독서 기록");
}

// 검색 버튼 함수
async function getSearch() {
  mode = 3;
  pageNum = 0;
  searchKeyword = document.getElementsByClassName("search-text")[0].value;
  getNextPage(+1);
  setStatus(`검색: ${searchKeyword}`);
}

function setStatus(string) {
  statusText.textContent = string;
}

/**
 * 페이지 버튼에 의한 책 목록 변경
 * @param {Number} dir 페이지 버튼 방향 - {-1: 이전, 1: 다음}
 */
async function getNextPage(dir) {
  if (pageNum + dir != 0) {
    const bookList = await getBookList(pageNum + dir);
    if (bookList && bookList.length > 0) {
      setBookShelf(bookList);
      pageNum += dir;
    } else {
      console.log("No more books to display");
    }
  } else {
    console.log("Cannot go to previous page from the first page");
  }
}

/**
 * 책 목록을 가져오는 함수
 * @param {number} pageNum 페이지 번호
 * @returns {Promise<Array>} 책 목록
 */
async function getBookList(pageNum) {
  let bookList = [];
  switch (mode) {
    case 0: // 메인
      // DB에 전체 목록에 대한 (pageNum, pageNum+12)의 요청
      const response_main = await fetch(
        `/search/all?pageNum=${pageNum}&booksPerPage=${BOOKS_PER_PAGE}`
      );
      bookList = await response_main.json();
      break;
    case 1: // 추천
    case 2: // 독서 기록
      if (isbnList[mode].length >= pageNum * 10) {
        for (let idx = (pageNum - 1) * 12 + 1; idx <= pageNum * 12; i++) {
          const isbn = isbnList[mode][idx];
          // DB에서 특정 ISBN에 대한 bookInfo의 요청
          const response_record = await fetch(`/search/by-isbn13/${isbn}`);
          // 결과를 bookList에 저장
          bookList.push(await response_record.json());
        }
      }
      break;
    case 3: // 검색 기록
      // DB에서 특정 검색 목록에 대한 (pageNum, pageNum+10)의 요청
      const response_search = await fetch(
        `/search/by-keyword/${searchKeyword}?pageNum=${pageNum}&booksPerPage=${BOOKS_PER_PAGE}`
      );
      bookList = await response_search.json();
      break;
    default:
      console.log("Invalid page mode");
      break;
  }
  return bookList;
}

/**
 * 책 목록의 설정을 위한 함수
 * @param {Array{JSON}} bookList 책 목록 - JSON 배열
 */
function setBookShelf(bookList) {
  if (typeof bookList === "string") {
    bookList = JSON.parse(bookList);
  }

  if (Array.isArray(bookList)) {
    for (let i = 1; i <= BOOKS_PER_PAGE; i++) {
      let bookSlot = document.getElementById(`book-slot-${i}`);
      if (i <= bookList.length) {
        let book = bookList[i - 1];
        setBook(bookSlot, book);
        bookSlot.classList.remove("hide");
      } else {
        bookSlot.classList.add("hide");
      }
    }
  } else {
    console.error("bookList is not an array");
  }
}

/**
 * 책 슬롯에 책을 설정
 * @param {HTMLElement} bookSlot 설정할 책 슬롯 - book-slot-[1:10]
 * @param {JSON} book 설정할 책
 */
function setBook(bookSlot, book) {
  const bookCover = bookSlot.querySelector(".book-cover");
  const bookTitle = bookSlot.querySelector(".book-title");
  const bookAuthor = bookSlot.querySelector(".book-author");

  bookCover.src = book["cover"];
  bookTitle.textContent = book["title"];
  const author =
    typeof book["author"] === "string"
      ? book["author"]
          .split(",")[0]
          .replace(/\([^)]*\)/g, "")
          .trim()
      : "Unknown Author";

  bookAuthor.textContent = author;

  bookSlot.onclick = () => {
    window.location.href = `/detail?isbn=${book["isbn13"]}`;
  };
}
