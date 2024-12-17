const axios = require("axios");
const getDatabaseId = require("./getDatabaseId");
const getTupleByISBN = require("./getTupleByISBN");

const headers = {
  Authorization: "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",
  "Notion-Version": "2022-06-28",
};

const pageId = "1479ede653a980c5aa9fe6f2109c4612";
const isbn = "testISBN";

async function getEveryBookRank(pageId) {
  const databaseId = await getDatabaseId.getDatabaseId(pageId);
  const everyTupleData = await getEveryTuple(databaseId);
  const bookRanks = extractRankFromTuples(everyTupleData);
  return bookRanks;
}

async function getBookRankByISBN(pageId, isbn) {
  const databaseId = await getDatabaseId.getDatabaseId(pageId);
  const tupleData = await getTupleByISBN.foundISBN(databaseId, isbn);
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

async function getEveryTuple(databaseId) {
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
