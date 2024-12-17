// NOTE: 외부 모듈을 임포트합니다.
const express = require("express");
const https = require("https");
const fs = require("fs");

// NOTE: 본 프로젝트에서 구현한 모듈(소스 코드)을 임포트합니다.
const utility = require("./src/utility.js");

const db_connection = require("./src/db/db_connection.js");

// NOTE: 서버가 포함할 API 모듈 목록을 이 곳에 작성합니다.
const api_main = require("./src/api/api_main.js");
const api_test = require("./src/api/api_test.js");
const api_search = require("./src/api/api_search.js");
const api_readnote = require("./src/api/api_readnote.js");

// NOTE: 상수
const c_NUM_PORT = 8080;

// NOTE: https 서버 인증을 위한 키
const privateKey = fs.readFileSync("C:\\Programming\\web\\ssl\\private-key.pem", "utf8")
const certificate = fs.readFileSync("C:\\Programming\\web\\ssl\\certificate.pem", "utf8")
const credentials = { key: privateKey, cert: certificate }

// NOTE: 전역 변수
const app = express();

async function main()
{
  app.use(express.json());
  app.use(express.static(utility.getStaticDirectory()));

  // TODO: 이 곳에서 사용할 API 모듈을 초기화(init)합니다.
  api_main.init(app);
  api_test.init(app); // TODO: 배포 시 이 줄은 주석 처리하세요.
  api_search.init(app);
  api_readnote.init(app);

  await db_connection.init()

  // NOTE: 서버를 열고 클라이언트 요청 발생을 대기합니다. (https 서버)
  const server = https.createServer(credentials, app).listen(c_NUM_PORT, () => {
    utility.printLogWithName(`서버를 시작합니다. (http://localhost:${c_NUM_PORT})`, "System");
  });
  /*
  // NOTE: 서버를 열고 클라이언트 요청 발생을 대기합니다. (http 서버)
  const server = app.listen(c_NUM_PORT, () => {
    utility.printLogWithName(`서버를 시작합니다. (http://localhost:${c_NUM_PORT})`, "System");
  });
  */

  // NOTE:
  // CTRL+C 입력 시 발생하는 SIGINT signal에 대한 이벤트 핸들러를 등록합니다.
  // 서버 종료 작업을 수행합니다.
  process.on("SIGINT", async () => {
    utility.printLogWithName("서버 종료 중...", "System")

    await db_connection.final()

    server.close(() => {
      utility.printLogWithName("서버가 정상적으로 종료되었습니다.", "System")
      process.exit(0)
    })

    setTimeout(() => {
      utility.printLogWithName("서버가 종료되지 않아 강제 종료되었습니다.", "System")
      process.exit(1)
    }, 5000)
  })
}

main()