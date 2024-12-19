console.log("load navigation.js");

const homeButton = document.getElementById("btn-home");
const recommendButton = document.getElementById("btn-recommend");
const recordButton = document.getElementById("btn-record");
const loginButton = document.getElementById("login-button");

loginButton.onclick = () => {
    const loginPage = `https://api.notion.com/v1/oauth/authorize?client_id=15ed872b-594c-80f0-ab76-0037de8dd2b4&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fread-book-pjt.site%3A8443%2Fjwe%2Fcreate`;
    window.location.href = loginPage;
};
homeButton.onclick = () => {
    goBookList(0);
};
recommendButton.onclick = () => {
    goBookList(1);
};
recordButton.onclick = () => {
    goBookList(2);
};

/**
 * 네비게이션 바에서 이동을 위해 로컬 저장소에 mode를 저장
 * @param {Number} mode 이동하고자 하는 책 목록 화면 - {0: 메인, 1: 추천, 2: 기록}
 */
function goBookList(mode) {
    sessionStorage.setItem(
        "event",
        JSON.stringify({ function: "initBookList", mode: mode })
    );
    window.location = "/";
}
