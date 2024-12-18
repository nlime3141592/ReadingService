const axios = require("axios");
const getTupleByISBN = require("./getTupleByISBN");

const headers = {
  Authorization: "사용자 Token 들어가야함",
  "Notion-Version": "2022-06-28",
};

/**
 *
 * @param {string} pageId 독후감이 작성될 notion page id
 * @param {*} isbn 독후감 작성한 책의 isbn
 * @param {JSON} reportJson 등록될 감상문 - report 페이지에서 생성되는거 그대로 주면됨
 * @returns response 받음 - 200이면 ok
 */
async function addBookReport(token, pageId, isbn, reportJson, bookName = "") {
  headers["Authorization"] = token;
  const tupleId = await getTupleByISBN.getTuple(token, pageId, isbn, bookName);
  const addReportResult = await addReport(tupleId, reportJson);
  return addReportResult;
}

function addReport(tupleId, reportJson) {
  const bodyData = addWritingTime(reportJson);
  return axios
    .patch(`https://api.notion.com/v1/blocks/${tupleId}/children`, bodyData, {
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

function addWritingTime(reportJson) {
  reportJson.children.unshift({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          text: {
            content: `작성 시간: ${new Date().toISOString()}`,
          },
          annotations: {
            bold: false,
            underline: false,
            italic: false,
          },
        },
      ],
    },
  });
  return reportJson;
}

module.exports = { addBookReport };
