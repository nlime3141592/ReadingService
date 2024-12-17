const axios = require("axios");

// header에 api key와 notion version 명시
const headers = {
  Authorization: "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",
  "Notion-Version": "2022-06-28",
};

// 페이지 Id - 후에 OAuth로 받아야 할 부분
const pageId = "1479ede653a980c5aa9fe6f2109c4612";

// test 부분
(async () => {
  // try {
  //   const databaseId = await getDatabaseId(pageId); // await 추가
  //   console.log("Database ID:", databaseId);
  // } catch (error) {
  //   console.error("Failed to get Database ID:", error);
  // }
})();

// 페이지 내의 데이터베이스 검색 - 있으면 Id 반환, 없으면 생성 후 반환
async function getDatabaseId(pageId) {
  const checkResult = await checkDatabase(pageId);
  let databaseId = null;
  checkResult["results"].forEach((element) => {
    if (
      element["child_database"] &&
      element["child_database"]["title"] == "독서 목록"
    ) {
      databaseId = element["id"];
    }
  });
  if (databaseId == null) {
    const createResult = await createDatabase(pageId);
    databaseId = createResult["id"];
  }
  return databaseId;
}

// 페이지 내의 데이터베이스가 있는지 검색
function checkDatabase(pageId) {
  return axios
    .get(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers,
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error fetching data: ${error}`);
      throw error;
    });
}

// 페이지 내에 데이터베이스를 생성
function createDatabase(pageId) {
  const bodyData = {
    parent: {
      type: "page_id",
      page_id: pageId,
    },
    title: [
      {
        type: "text",
        text: {
          content: "독서 목록",
        },
      },
    ],
    is_inline: true,
    properties: {
      ISBN: { title: {} },
      "책 제목": { rich_text: {} },
      "읽은 날짜": { date: {} },
      평가: { rich_text: {} },
    },
  };
  return axios
    .post(`https://api.notion.com/v1/databases`, bodyData, {
      headers,
    })
    .then((response) => {
      console.log("Database created:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error creating database:", error);
      throw error;
    });
}

module.exports = { getDatabaseId };
