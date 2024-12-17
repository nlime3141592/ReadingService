console.log("load bookDetail.js");

let storedJWE = localStorage.getItem("jweToken");

const loginButton = document.getElementById("login-button");
const userRankButton = document.getElementById("user-rank-button");

// 네비게이션 바
const homeButton = document.getElementById("btn-home");
const recommendButton = document.getElementById("btn-recommend");
const recordButton = document.getElementById("btn-record");

let rank = 0;

homeButton.onclick = () => {
  goBookList(0);
};
recommendButton.onclick = () => {
  goBookList(1);
};
recordButton.onclick = () => {
  goBookList(2);
};

userRankButton.onclick = () => {
  setUserRank();
};

window.onload = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isbn = urlParams.get("isbn");
  setBook(isbn);
  await isLogined();
};

async function isLogined() {}

/**
 * 네비게이션 바에서 이동을 위해 로컬 저장소에 mode를 저장
 * @param {Number} mode 이동하고자 하는 책 목록 화면 - {0: 메인, 1: 추천, 2: 기록}
 */
function goBookList(mode) {
  localStorage.setItem(
    "event",
    JSON.stringify({ function: "initBookList", mode: mode })
  );
  window.location = "/";
}

function setUserRank() {
  if (rank != 1) {
    rank = 1;
  } else {
    rank = -1;
  }
  document.querySelector("#user-rank img").src =
    rank == 1 ? "./img/pineappleIcon.png" : "./img/pineconeIcon.png";
}

/**
 * 책 설명을 설정
 * @param {*} isbn isbn번호
 */
async function setBook(isbn) {
  const bookInfo = await (await fetch(`/search/by-isbn13/${isbn}`)).json();
  setBookTitleSlot(bookInfo);
  setBookDetail(bookInfo);
  setBottomGrid(bookInfo);
}

/**
 * 표지, 제목 등을 설정
 * @param {JSON} bookInfo JSON 형식의 book info
 */
function setBookTitleSlot(bookInfo) {
  const bookCover = document.querySelector("#image-slot img");
  const bookTitle = document.querySelector("#book-title");
  const bookAuthor = document.querySelector("#book-author");

  bookCover.src = bookInfo["cover"];
  bookTitle.textContent = bookInfo["title"];
  bookAuthor.textContent = bookInfo["author"];
}

/**
 * 전체적인 세부 사항을 설정
 * @param {JSON} bookInfo JSON 형식의 book info
 */
function setBookDetail(bookInfo) {
  document.querySelector("#book-publisher").textContent = bookInfo["publisher"];
  document.querySelector("#book-pubdate").textContent = bookInfo["pubdate"];
  document.querySelector("#book-pricesales").textContent =
    bookInfo["pricesales"];
  document.querySelector("#book-pricestandard").textContent =
    bookInfo["pricestandard"];
  document.querySelector("#book-salesPoint").textContent =
    bookInfo["salesPoint"];
  document.querySelector("#book-description").textContent =
    bookInfo["description"];
}

/**
 * 하단부의 버튼들 설정
 * @param {JSON} bookInfo JSON 형식의 book info
 */
function setBottomGrid(bookInfo) {
  // set book link button
  document.querySelector("#book-link").href = bookInfo["link"];
  // set customer review rank
  const reviewRank = bookInfo["customerReviewRank"];
  const customerReviewRank = document.querySelector(
    "#book-customerReviewRank-slot"
  );
  customerReviewRank.querySelector("#clr_image").style.clipPath = `inset(${
    100 - reviewRank * 10
  }% 0 0 0)`;
  customerReviewRank.querySelector("#score").textContent = reviewRank;

  // set user rank
  const userRank = document.querySelector("#user-rank");
  // notion 에서 기존 유저의 평가 가져오는 방법이 필요
  const temp = "pineapple";
  if (temp == "pineapple") {
    rank = 1;
    userRank.querySelector("img").src = "./img/pineappleIcon.png";
  } else if (temp == "pinecone") {
    rank = -1;
    userRank.querySelector("img").src = "./img/pineconeIcon.png";
  }

  // set report button
  const reportButton = document.querySelector("#reading-note");
  // 세션에 따라 표시 여부 설정 필요
  // 연결될 url 삽입
  reportButton.href = "";
}
