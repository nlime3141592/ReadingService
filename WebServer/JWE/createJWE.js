const fs = require("fs");
const crypto = require("crypto");
const jose = require("jose");

const publicKeyPem = fs.readFileSync("./static/ssl/public.pem", "utf-8");
const publicKey = crypto.createPublicKey(publicKeyPem);

async function createJWE(token) {
    const data = {
        token: token,
        exp: new Date(
            new Date().setDate(new Date().getDate() + 1)
        ).toISOString(),
    };
    const jwe = await new jose.CompactEncrypt(
        new TextEncoder().encode(JSON.stringify(data))
    )
        .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
        .encrypt(publicKey);

    return jwe;
}

module.exports = { createJWE };
