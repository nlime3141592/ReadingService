const axios = require("axios");
const getTupleByISBN = require("./getTupleByISBN");

// header에 api key와 notion version 명시
const headers = {
  Authorization: "사용자 Token 들어가야함",
  "Notion-Version": "2022-06-28",
};

async function updateBookRank(token, pageId, isbn, rank) {
  headers["Authorization"] = token;
  const tupleId = await getTupleByISBN.getTuple(token, pageId, isbn, rank);
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

module.exports = { updateBookRank };
