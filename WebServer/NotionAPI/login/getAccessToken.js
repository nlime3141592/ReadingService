const axios = require("axios");

async function getAccessToken(code) {
    try {
        const response = await axios.post(
            "https://api.notion.com/v1/oauth/token",
            {
                grant_type: "authorization_code",
                code: code,
                // api 설정을 바꾸어야함 - 실제 서버에서 사용 중인 라우터로
                redirect_uri: "https://read-book-pjt.site:8443/jwe/create",
            },
            {
                // 환경 변수로 변경하여 보안 높일 필요
                auth: {
                    username: process.env.OAuthClientID,
                    password: process.env.OAuthClientSecret,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const accessToken = response.data.access_token;
        return accessToken;
    } catch (error) {
        console.error(
            "Error fetching access token:",
            error.response ? error.response.data : error.message
        );
    }
}

async function getAccessablePageId(accessToken) {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Notion-Version": "2022-06-28",
        };
        const response = await axios.post(
            "https://api.notion.com/v1/search",
            {
                query: "",
                filter: {
                    value: "page",
                    property: "object",
                },
            },
            { headers }
        );
        const pageId = response["data"]["results"][0]["id"];
        return pageId;
    } catch (error) {
        console.error(
            "Error search Acessable page:",
            error.response ? error.response.data : error.message
        );
    }
}

module.exports = { getAccessToken, getAccessablePageId };
