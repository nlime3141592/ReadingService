console.log("load bookReport.js");

let bookInfo = null;
let logined = false;
let storedJWE = sessionStorage.getItem("jweToken");

// 감상문 등록 버튼
const submitButton = document.getElementById("btn-done");
submitButton.onclick = submit;

window.onload = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isbn = urlParams.get("isbn");
  bookInfo = await (await fetch(`/search/by-isbn13/${isbn}`)).json();
  setBook();
  await isLogined();
};

submitButton.onclick = submit;

/**
 * 현재 저장된 JWE 토큰의 유효성 판단을 통해 로그인되었는지 확인함
 */
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
  setElement(logined);
}

function setElement(isLogined) {
  if (isLogined) {
    document.querySelector("#btn-recommend").classList.remove("hide");
    document.querySelector("#btn-record").classList.remove("hide");
    document.querySelector("#btn-done").classList.remove("hide");
    document.querySelector("#login-button").classList.add("hide");
  }
}

async function setBook() {
  document.querySelector("#book-info-image").src = bookInfo["cover"];
  document.querySelector("#book-info-text").textContent = bookInfo["title"];
}

/**
 * 작성한 감상문을 등록하는 함수
 */
async function submit() {
  const richText = htmlToNotion(
    document.getElementsByClassName("ql-editor")[0]
  );
  const responseUploadReport = await fetch(`/readnote/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jwe: storedJWE,
      isbn: bookInfo["isbn13"],
      report: richText,
      bookName: bookInfo["title"],
    }),
  });
  if (responseUploadReport.ok) {
    window.alert("등록되었습니다.");
    // 등록 완료 후 메인 화면으로 이동
    goBookList(0);
  } else {
    window.alert("오류가 발생하였습니다. 다시 시도해주세요.");
  }
}

/**
 * Rich Text에 작성된 텍스트의 HTML을 Notion api의 형태에 맞추어 변환함 - api 키는 설정하지않음
 * @param {HTMLObjectElement} element Rich Text에 작성된 HTML
 * @returns Notion api에 입력될 body의 JSON
 */
function htmlToNotion(element) {
  let children = element.children;
  let result = {
    children: [],
  };

  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    if (child.tagName.toLowerCase() != "ol") {
      richText = lineParser(child);
      result["children"].push(richText);
    } else {
      richText = listParser(child);
      result["children"].push(...richText);
    }
  }
  return result;
}

/**
 * 한 줄로 끝나는 태그를 변환
 * @param {HTMLObjectElement} text <ol>이 아닌 태그들 - 한 줄로 종료되는
 * @returns 변환된 JSON 오브젝트
 */
function lineParser(text) {
  const nameDict = {
    p: "paragraph",
    h1: "heading_1",
    h2: "heading_2",
    h3: "heading_3",
  };

  const tagName = text.tagName.toLowerCase();
  const blockType = nameDict[tagName];

  if (!blockType) {
    throw new Error(`Unsupported tag name: ${tagName}`);
  }

  return {
    object: "block",
    type: blockType,
    [blockType]: { rich_text: recursiveParser(text) },
  };
}

/**
 * 한 줄로 끝나지 않는 태그를 반환
 * @param {HTMLObjectElement} text <ol> 태그 - 여러 줄이 자식 요소
 * @returns 변환된 JSON 오브젝트
 */
function listParser(text) {
  const nameDict = {
    ordered: "numbered_list_item",
    bullet: "bulleted_list_item",
  };
  const children = text.children;
  let result = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const type = child.dataset.list;
    const typeValue = nameDict[type];
    result.push({
      object: "block",
      type: typeValue,
      [typeValue]: {
        rich_text: recursiveParser(child),
      },
    });
  }
  return result;
}

/**
 * 자식 노드들까지 반복하며 스타일을 부여함
 * @param {HTMLObjectElement} text 변환할 HTML 코드
 * @param {string} option 스타일을 string의 형태로 나타냄 - 'b':bold, 'u':underline, 'i':italic
 * @returns 변환된 JSON 오브젝트
 */
function recursiveParser(text, option = "") {
  let richText = [];
  const childNodes = text.childNodes;
  for (let i = 0; i < childNodes.length; i++) {
    if (childNodes[i].nodeType != Node.TEXT_NODE) {
      const tagName = childNodes[i].tagName.toLowerCase();
      let additionalOption = "";
      if (tagName === "br") {
        // 줄바꿈을 나타내는 빈 텍스트 조각 추가
        richText.push({ text: { content: "" }, annotations: {} });
        continue; // 다음 노드로 넘어갑니다.
      }
      switch (tagName) {
        case "strong":
          additionalOption = "b";
          break;
        case "u":
          additionalOption = "u";
          break;
        case "em":
          additionalOption = "i";
          break;
      }
      richText.push(
        ...recursiveParser(childNodes[i], option + additionalOption)
      );
    } else {
      let annotationed = {
        text: { content: childNodes[i].textContent },
        annotations: {
          bold: option.includes("b"),
          underline: option.includes("u"),
          italic: option.includes("i"),
        },
      };
      richText.push(annotationed);
    }
  }
  return richText;
}
