console.log("load bookDetail.js");

let bookInfo = null;
let rank = 0;
let storedJWE = sessionStorage.getItem("jweToken");

const userRankButton = document.getElementById("user-rank-button");

window.onload = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isbn = urlParams.get("isbn");
  bookInfo = await (await fetch(`/search/by-isbn13/${isbn}`)).json();
  setBook();
  setElement(storedJWE != null);
};

function setElement(isLogined) {
  if (isLogined) {
    document.querySelector("#btn-recommend").classList.remove("hide");
    document.querySelector("#btn-record").classList.remove("hide");
    document.querySelector("#reading-note").classList.remove("hide");
    document.querySelector("#user-rank").classList.remove("hide");
    document.querySelector("#login-button").classList.add("hide");
  }
}

function setRankButtonEnabled(enable) {
  userRankButton.disabled = !enable;

  if (enable) {
    userRankButton.onclick = () => {
      setUserRank();
    };
    userRankButton.classList.remove("disabled");
  } else {
    userRankButton.onclick = null;
    userRankButton.classList.add("disabled");
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
      isbn: bookInfo["isbn13"],
    }),
  });
  if (rankResult.status == 400) {
    sessionStorage.removeItem("jweToken");
    window.alert("로그인이 해제되었습니다. 다시 로그인해주세요.");
    location.reload();
  }
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
      isbn: bookInfo["isbn13"],
      rank: rank == 1 ? "❤" : "💙",
      bookName: bookInfo["title"],
    }),
  });
  if (rankUpdateResult.ok) {
    document.querySelector("#user-rank img").src =
      rank == 1 ? "./img/pineappleIcon.png" : "./img/pineconeIcon.png";
  } else {
    if (rankResult.status == 400) {
      sessionStorage.removeItem("jweToken");
      window.alert("로그인이 해제되었습니다. 다시 로그인해주세요.");
      location.reload();
    }
    rank = prevRank;
  }
  setRankButtonEnabled(true);
}

/**
 * 책 설명을 설정
 */
async function setBook() {
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
  // set report button
  const reportButton = document.querySelector("#reading-note");
  reportButton.href = `/readnote/?isbn=${bookInfo["isbn13"]}`;
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
  let rankMark = "🤍";
  if (storedJWE != null) {
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
}
