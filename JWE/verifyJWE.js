const fs = require("fs");
const crypto = require("crypto");
const jose = require("jose");

const privateKeyPem = fs.readFileSync("private.pem", "utf-8");
const privateKey = crypto.createPrivateKey(privateKeyPem);

async function decryptJWE(jwe) {
  // JWE 복호화
  const { plaintext, _ } = await jose.compactDecrypt(jwe, privateKey);

  const payload = JSON.parse(plaintext.toString());

  const now = new Date();
  if (now > new Date(payload["exp"])) {
    return false;
  }

  const res = await fetch("https://api.notion.com/v1/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${payload["token"]}`,
      "Notion-Version": "2022-06-28",
    },
  });
  if (!res.ok) {
    return false;
  }

  return payload["token"];
}
