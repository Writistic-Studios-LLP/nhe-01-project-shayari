const crypto = require("crypto");
const https = require("https");

const {
  X_API_KEY,
  X_API_SECRET,
  X_ACCESS_TOKEN,
  X_ACCESS_SECRET
} = process.env;

if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
  console.error("Missing X API credentials");
  process.exit(1);
}

const tweetText = "Hello X 🚀 This tweet was posted for FREE using GitHub Actions";

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/[!*()']/g, c => "%" + c.charCodeAt(0).toString(16));
}

function createOAuthHeader() {
  const oauth = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: "1.0"
  };

  const baseString =
    "POST&" +
    percentEncode("https://api.x.com/2/tweets") +
    "&" +
    percentEncode(
      Object.keys(oauth)
        .sort()
        .map(k => `${percentEncode(k)}=${percentEncode(oauth[k])}`)
        .join("&")
    );

  const signingKey =
    percentEncode(X_API_SECRET) +
    "&" +
    percentEncode(X_ACCESS_SECRET);

  oauth.oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  return (
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map(k => `${percentEncode(k)}="${percentEncode(oauth[k])}"`)
      .join(", ")
  );
}

const data = JSON.stringify({ text: tweetText });

const options = {
  hostname: "api.x.com",
  path: "/2/tweets",
  method: "POST",
  headers: {
    Authorization: createOAuthHeader(),
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
  }
};

const req = https.request(options, res => {
  let body = "";
  res.on("data", chunk => (body += chunk));
  res.on("end", () => console.log("Response:", body));
});

req.on("error", err => {
  console.error("Request error:", err);
});

req.write(data);
req.end();
