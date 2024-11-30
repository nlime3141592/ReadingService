module.exports = {
    init: __init
}

const utility = require("../utility.js")

function __init(app)
{
    app.get("/search/keywords/:keywords", __post_search_keywords)
    app.get("/search/history", __post_search_history)
    app.get("/search/recommends", __post_recommends)
}

function __post_search_keywords(req, res)
{
    keywords = req.params.keywords.split(" ")

    for (keyword in keywords)
    {
        // TODO: 이 곳에서 분리된 검색어에 대한 연산을 수행할 수 있습니다.
    }

    // TODO:
    // sendFile 함수를 다른 것으로 교체합니다. 페이지 디자인이 완료된 후 취합 시 방법을 결정합니다.
    // 하나 떠오르는 방안은,
    // 1. 검색 결과가 존재할 페이지를 얻어옴.
    // 2. 검색 결과가 존재할 페이지에 있는 컨테이너에 검색 결과에 대한 html 코드를 삽입함. (innerHTML 등 사용)
    // 3. 과정 2에서 만들어진 페이지를 res 객체를 이용해 반환함.
    // res.sendFile(utility.getHtmlPath("./keywords.html"))
}

function __post_search_history(req, res)
{
    // TODO: 이 곳에 '독서 기록' 버튼을 눌렀을 때 이동할 페이지를 전송합니다.
    // res.sendFile(utility.getHtmlPath("./history.html"))
}

function __post_recommends(req, res)
{
    // TODO: 이 곳에 '추천 도서' 버튼을 눌렀을 때 이동할 페이지를 전송합니다.
    // res.sendFile(utility.getHtmlPath("./recommends.html"))
}