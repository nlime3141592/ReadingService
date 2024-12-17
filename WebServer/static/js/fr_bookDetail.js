console.log("load bookDetail.js");

let storedJWE = sessionStorage.getItem("jweToken");
let logined = false;
let isbn = "";

const userRankButton = document.getElementById("user-rank-button");

const loginButton = document.getElementById("login-button");
loginButton.onclick = () => {
  const loginPage = `https://api.notion.com/v1/oauth/authorize?client_id=15ed872b-594c-80f0-ab76-0037de8dd2b4&response_type=code&owner=user&redirect_uri=https%3A%2F%2Flocalhost%3A8443%2Fjwe%2Fcreate`;
  window.location.href = loginPage;
};

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

window.onload = async function () {
  await isLogined();
  const urlParams = new URLSearchParams(window.location.search);
  isbn = urlParams.get("isbn");
  setBook();
};

async function isLogined() {
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
    document.querySelector("#reading-note").classList.remove("hide");
    document.querySelector("#user-rank").classList.remove("hide");
    document.querySelector("#login-button").classList.add("hide");
  }
}

/**
 * 네비게이션 바에서 이동을 위해 로컬 저장소에 mode를 저장
 * @param {Number} mode 이동하고자 하는 책 목록 화면 - {0: 메인, 1: 추천, 2: 기록}
 */
function goBookList(mode) {
  sessionStorage.setItem(
    "event",
    JSON.stringify({ function: "initBookList", mode: mode })
  );
  window.location = "/";
}

function setRankButtonEnabled(enable) {
  userRankButton.disabled = !enable;

  if (enable) {
    userRankButton.onclick = () => {
      setUserRank();
    };
  } else {
    userRankButton.onclick = null;
  }
}

async function getUserRank() {
  const rankResult = await fetch("/notion/rank/get/isbn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jwe: storedJWE,
      isbn: isbn,
    }),
  });
  return rankResult.text();
}

async function setUserRank() {
  setRankButtonEnabled(false);
  let prevRank = rank;
  if (rank != 1) {
    rank = 1;
  } else {
    rank = -1;
  }
  const rankUpdateResult = await fetch("/notion/rank/update/isbn", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jwe: storedJWE,
      isbn: isbn,
      rank: rank == 1 ? "❤" : "💙",
    }),
  });
  if (rankUpdateResult.ok) {
    document.querySelector("#user-rank img").src =
      rank == 1 ? "./img/pineappleIcon.png" : "./img/pineconeIcon.png";
  } else {
    rank = prevRank;
  }
  setRankButtonEnabled(true);
}

/**
 * 책 설명을 설정
 */
async function setBook() {
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
async function setBottomGrid(bookInfo) {
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
  let rankMark = "🤍";
  if (logined) {
    rankMark = await getUserRank();
  }
  if (rankMark == "❤") {
    rank = 1;
    userRank.querySelector("img").src = "./img/pineappleIcon.png";
  } else if (rankMark == "💙") {
    rank = -1;
    userRank.querySelector("img").src = "./img/pineconeIcon.png";
  } else {
    rank = 0;
    userRank.querySelector("img").src = "";
  }

  setRankButtonEnabled(true);

  // set report button
  const reportButton = document.querySelector("#reading-note");
  // 세션에 따라 표시 여부 설정 필요
  // 연결될 url 삽입
  reportButton.href = `/readnote/?isbn=${isbn}`;
}
