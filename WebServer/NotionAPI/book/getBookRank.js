const axios = require("axios");
const getDatabaseId = require("./getDatabaseId");
const getTupleByISBN = require("./getTupleByISBN");

const headers = {
  Authorization: "사용자 Token 들어가야함",
  "Notion-Version": "2022-06-28",
};

async function getEveryBookRank(token, pageId) {
  headers["Authorization"] = token;
  const databaseId = await getDatabaseId.getDatabaseId(token, pageId);
  const everyTupleData = await getEveryTuple(token, databaseId);
  const bookRanks = extractRankFromTuples(everyTupleData);
  return bookRanks;
}

async function getBookRankByISBN(token, pageId, isbn) {
  headers["Authorization"] = token;
  const databaseId = await getDatabaseId.getDatabaseId(token, pageId);
  const tupleData = await getTupleByISBN.foundISBN(token, databaseId, isbn);
  const bookRank = extractRankFromTuple(tupleData) ?? false;
  return bookRank;
}

function extractRankFromTuple(tupleData) {
  try {
    return tupleData["results"][0]["properties"]["평가"]["rich_text"][0][
      "plain_text"
    ];
  } catch (error) {
    console.error("Can not extract Rank from data:", error);
    return null;
  }
}

function extractRankFromTuples(everyTupleData) {
  const result = {};
  everyTupleData.forEach((tuple) => {
    const isbn = tuple["ISBN"]["title"][0]["plain_text"];
    const rank = tuple["평가"]["rich_text"][0]["plain_text"];
    result[isbn] = rank;
  });

  return result;
}

async function getEveryTuple(token, databaseId) {
  headers["Authorization"] = token;
  let has_more = true,
    next_cursor = null,
    totalResult = [];

  while (has_more) {
    try {
      const body = next_cursor ? { start_cursor: next_cursor } : {};
      const response = await axios.post(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        body,
        {
          headers,
        }
      );

      const data = response.data;
      totalResult.push(...data.results.map((result) => result.properties));
      has_more = data.has_more;
      next_cursor = data.next_cursor;
    } catch (error) {
      console.error("Error get every Tuple:", error);
      throw error;
    }
  }
  return totalResult;
}

module.exports = { getEveryBookRank, getBookRankByISBN };
