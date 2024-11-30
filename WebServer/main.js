// NOTE: 외부 모듈을 임포트합니다.
const express = require("express")
const fs = require("fs").promises

// NOTE: 본 프로젝트에서 구현한 모듈(소스 코드)을 임포트합니다.
const utility = require("./src/utility.js")

// NOTE: 서버가 포함할 API 모듈 목록을 이 곳에 작성합니다.
const api_main = require("./src/api/api_main.js")
const api_test = require("./src/api/api_test.js")
const api_search = require("./src/api/api_search.js")
const api_readnote = require("./src/api/api_readnote.js")

// NOTE: 상수
const c_NUM_PORT = 8080

// NOTE: 전역 변수
const app = express()

app.use(express.json())
app.use(express.static(utility.getStaticDirectory()))

// TODO: 이 곳에서 사용할 API 모듈을 초기화(init)합니다.
api_main.init(app)
api_test.init(app) // TODO: 배포 시 이 줄은 주석 처리하세요.
api_search.init(app)
api_readnote.init(app)

app.listen(c_NUM_PORT, () => {
    utility.printLogWithName(`서버를 시작합니다. (http://localhost:${c_NUM_PORT})`, "System")
})