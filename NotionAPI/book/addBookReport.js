const axios = require("axios");
const getTupleByISBN = require("./getTupleByISBN");

const headers = {
  Authorization: "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",
  "Notion-Version": "2022-06-28",
};
const pageId = "1479ede653a980c5aa9fe6f2109c4612";
const isbn = "testISBN";

testReport = {
  children: [
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            text: {
              content:
                "테스트용 JSON, 후에 Report HTML 에서 생성되는 JSON으로만 바꾸면 됨",
            },
            annotations: {
              bold: false,
              underline: false,
              italic: false,
            },
          },
        ],
      },
    },
  ],
};

(async () => {
  try {
    console.log(await addBookReport(pageId, isbn, testReport));
  } catch (error) {
    console.error("Failed: ", error);
  }
})();

async function addBookReport(pageId, isbn, reportJson) {
  const tupleId = await getTupleByISBN.getTuple(pageId, isbn);
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
