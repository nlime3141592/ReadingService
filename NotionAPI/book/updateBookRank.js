const axios = require("axios");
const getTupleByISBN = require("./getTupleByISBN");

// header에 api key와 notion version 명시
const headers = {
  Authorization: "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",
  "Notion-Version": "2022-06-28",
};

// 페이지 Id - 후에 OAuth로 받아야 할 부분
const pageId = "1479ede653a980c5aa9fe6f2109c4612";
const isbn = "testISBN";

(async () => {
  try {
    const updateResult = await updateBookRank(pageId, isbn, "😙"); // await 추가
    console.log(updateResult);
  } catch (error) {
    console.error("Failed: ", error);
  }
})();

async function updateBookRank(pageId, isbn, rank) {
  const tupleId = await getTupleByISBN.getTuple(pageId, isbn, rank);
  const updateResult = await updateTuple(tupleId, rank);
  return updateResult;
}

function updateTuple(tupleId, rank) {
  const bodyData = {
    properties: {
      평가: {
        rich_text: [{ text: { content: rank } }],
      },
    },
  };

  return axios
    .patch(`https://api.notion.com/v1/pages/${tupleId}`, bodyData, { headers })
    .then((response) => {
      console.log("Update success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Failed to update:", error);
      throw error;
    });
}
