console.log("load bookReport.js");

const submitButton = document.getElementById("btn-done");

// 미구현 - Notion으로 올리는 함수 필요
submitButton.onclick = test;

// 네비게이션 바
const homeButton = document.getElementById("btn-home");
const recommendButton = document.getElementById("btn-recommend");
const recordButton = document.getElementById("btn-record");

homeButton.onclick = () => {
  goBookList(0);
};
recommendButton.onclick = () => {
  goBookList(1);
};
recordButton.onclick = () => {
  goBookList(2);
};

init();

/**
 * 초기화용 함수
 */
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const isbn = urlParams.get("isbn");
  // isbn으로 책 정보를 가져옴
  const response_isbn = await fetch(``);
  const bookInfo = await response_isbn.json();

  document.querySelector("#book-info-image").src = bookInfo["cover"];
  document.querySelector("#book-info-text").textContent = bookInfo["title"];
}

/**
 * 네비게이션 바에서 이동을 위해 로컬 저장소에 mode를 저장
 * @param {Number} mode 이동하고자 하는 책 목록 화면 - {0: 메인, 1: 추천, 2: 기록}
 */
function goBookList(mode) {
  localStorage.setItem(
    "event",
    JSON.stringify({ function: "initBookList", mode: mode })
  );
  window.location = "/main";
}

/**
 * 변환 확인용 테스트 함수
 */
function test() {
  const richText = document.getElementsByClassName("ql-editor")[0];
  console.log(htmlToNotion(richText));
}

/**
 * richTextEditor의 전체 HTML 코드를 Notion 형태로 변경
 * @param {HTMLObjectElement} element richTextEditor 1단계 하위의 HTML 코드들
 * @returns 변경된 string 반환 - 그대로 Notion에 넣으면 됨
 */
function htmlToNotion(element) {
  let children = element.children;
  let result = [];

  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    if (child.tagName.toLowerCase() != "ol") {
      let text = child.outerHTML;
      result.push(simpleTagChange(text));
    } else {
      result.push(listTagChange(child));
    }
  }

  return result.join("");
}

/**
 * 리스트 태그의 변환
 * @param {HTMLObjectElement} olTag 변환할 ol 태그
 * @returns 변환된 ol 태그의 string
 */
function listTagChange(olTag) {
  let numbering = 1;
  let children = olTag.children;
  let result = [];
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let listData = child.dataset.list;
    let text = simpleTagChange(child.innerHTML) + "\n";
    text = (listData == "ordered" ? `${numbering++}. ` : `* `) + text;
    result.push(text);
  }
  return result.join("");
}

/**
 * 태그를 직접 Notion 스타일로 변경
 * @param {HTMLObjectElement} text 변경할 태그 - <p></p> 단위로 받음, <br>은 예외
 * @returns 변환된 태그의 string
 */
function simpleTagChange(text) {
  // delete span
  text = text.replace(/<span[^>]*>.*?<\/span>/gs, "");
  // bold
  text = text.replace(/<strong>/g, "**").replace(/<\/strong>/g, "**");
  // italic
  text = text.replace(/<em>/g, "_").replace(/<\/em>/g, "_");
  // h1
  text = text.replace(/<h1>/g, "# ").replace(/<\/h1>/g, "\n");
  // h2
  text = text.replace(/<h2>/g, "## ").replace(/<\/h2>/g, "\n");
  // h3
  text = text.replace(/<h3>/g, "### ").replace(/<\/h3>/g, "\n");
  // <p>
  text = text.replace(/<p>/g, "").replace(/<\/p>/g, "\n");
  // <u>
  text = text.replace(/<u>/g, "").replace(/<\/u>/g, "");
  // <br>
  text = text.replace(/<br>/g, "\n");

  return text;
}
