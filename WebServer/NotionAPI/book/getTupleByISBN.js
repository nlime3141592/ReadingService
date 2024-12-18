const axios = require("axios");
const getDatabaseId = require("./getDatabaseId");

// header에 api key와 notion version 명시
const headers = {
  Authorization: "사용자 Token 들어가야함",
  "Notion-Version": "2022-06-28",
};

async function getTuple(token, pageId, isbn, bookName = "") {
  headers["Authorization"] = token;
  let tupleId = null;
  const databaseId = await getDatabaseId.getDatabaseId(token, pageId);
  const foundResult = await foundISBN(token, databaseId, isbn);
  if (foundResult["results"][0]) {
    tupleId = foundResult["results"][0]["id"];
  } else {
    const createdTuple = await createTuple(databaseId, isbn, bookName);
    tupleId = createdTuple["id"];
  }

  return tupleId;
}

function foundISBN(token, databaseId, isbn) {
  headers["Authorization"] = token;
  const bodyData = {
    filter: {
      property: "ISBN",
      title: {
        equals: isbn,
      },
    },
  };
  return axios
    .post(`https://api.notion.com/v1/databases/${databaseId}/query`, bodyData, {
      headers,
    })
    .then((response) => {
      console.log("ISBN found:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error found ISBN:", error);
      throw error;
    });
}

async function createTuple(database_id, isbn, bookName) {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  const bodyData = {
    parent: { database_id: database_id },
    properties: {
      ISBN: {
        title: [{ text: { content: isbn } }],
      },
      "책 제목": {
        rich_text: [{ text: { content: bookName } }],
      },
      "읽은 날짜": {
        date: { start: formattedDate },
      },
      평가: {
        rich_text: [{ text: { content: "🤍" } }],
      },
    },
  };

  return axios
    .post(`https://api.notion.com/v1/pages`, bodyData, { headers })
    .then((response) => {
      console.log("Tuple created:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error creating Tuple:", error);
      throw error;
    });
}

module.exports = { getTuple, foundISBN };
