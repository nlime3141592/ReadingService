console.log("load main.js");

let storedJWE = sessionStorage.getItem("jweToken");
let pageNum = 1;
let searchKeyword = "";
// 0: 메인, 1: 추천, 2: 독서 기록, 3: 검색 기록
let mode = 0;
// isbn 리스트 | {0: 없음, 1: 추천, 2: 독서 기록}
let isbnList = [];

const BOOKS_PER_PAGE = 12;
const statusText = document.getElementById("status-text");
const homeButton = document.getElementById("btn-home");
const recommendButton = document.getElementById("btn-recommend");
const recordButton = document.getElementById("btn-record");
const searchButton = document.getElementById("search-button");
const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");
const loginButton = document.getElementById("login-button");

window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const jwe = urlParams.get("jwe");
    if (jwe) {
        sessionStorage.setItem("jweToken", jwe);
        storedJWE = sessionStorage.getItem("jweToken");
    }

    const eventData = JSON.parse(sessionStorage.getItem("event"));
    if (eventData) {
        const { function: funcName, mode } = eventData;
        if (funcName == "initBookList" && mode != null) {
            getPage(mode);
        }
        sessionStorage.removeItem("event"); // 실행 후 삭제
    } else {
        getPage(0);
    }
    setElement(storedJWE != null);
};

homeButton.onclick = () => {
    getPage(0);
};
recommendButton.onclick = () => {
    getPage(1);
};
recordButton.onclick = () => {
    getPage(2);
};
searchButton.onclick = () => {
    getPage(3);
};

leftButton.onclick = () => {
    getNextPage(-1);
};
rightButton.onclick = () => {
    getNextPage(+1);
};

loginButton.onclick = () => {
    const loginPage = `https://api.notion.com/v1/oauth/authorize?client_id=15ed872b-594c-80f0-ab76-0037de8dd2b4&response_type=code&owner=user&redirect_uri=https%3A%2F%2Flocalhost%3A8443%2Fjwe%2Fcreate`;
    window.location.href = loginPage;
};

function setElement(isLogined) {
    if (isLogined) {
        document.querySelector("#btn-recommend").classList.remove("hide");
        document.querySelector("#btn-record").classList.remove("hide");
        document.querySelector("#login-button").classList.add("hide");
    }
}

async function getPage(_mode) {
    setBookShelf([]);
    searchKeyword = document.getElementsByClassName("search-text")[0].value;
    mode = _mode;
    pageNum = 0;
    let statusString = [
        "도서 목록",
        `추천 도서 - 키워드:`,
        "독서 기록",
        `검색: ${searchKeyword}`,
    ];
    setStatus(statusString[mode]);
    if (mode == 2) {
        const searchByHistoryResult = await fetch(`/search/by-history`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jwe: storedJWE,
            }),
        });
        if (searchByHistoryResult.status == 400) {
            sessionStorage.removeItem("jweToken");
            window.alert("로그인이 해제되었습니다. 다시 로그인해주세요.");
            location.reload();
        }
        isbnList = await searchByHistoryResult.json();
    }
    getNextPage(+1);
}

/**
 * 상태 표시 텍스트를 변경
 * @param {string} string 변경할 텍스트
 */
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
            const recommendResult = await fetch(`/search/by-recommendation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jwe: storedJWE,
                }),
            });
            if (recommendResult.status == 400) {
                sessionStorage.removeItem("jweToken");
                window.alert("로그인이 해제되었습니다. 다시 로그인해주세요.");
                location.reload();
            }
            const data = await recommendResult.json();
            bookList = data["bookList"];
            setStatus(`추천 도서 - 키워드: ${data["selectedKeyword"]}`);
            break;
        case 2: // 독서 기록
            if (Object.keys(isbnList).length >= (pageNum - 1) * 10) {
                for (
                    let idx = (pageNum - 1) * BOOKS_PER_PAGE + 1;
                    idx <= pageNum * BOOKS_PER_PAGE;
                    idx++
                ) {
                    const isbn = Object.keys(isbnList)[idx - 1];
                    if (isbn) {
                        // DB에서 특정 ISBN에 대한 bookInfo의 요청
                        const response_record = await fetch(
                            `/search/by-isbn13/${isbn}`
                        );
                        // 결과를 bookList에 저장
                        bookList.push(await response_record.json());
                    }
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
