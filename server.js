require("dotenv").config();
let express = require("express");
let request = require("request");
let querystring = require("querystring");

let app = express();

let FRONTEND_URI = process.env.FRONTEND_URI || "http://localhost:3000";
let REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:8888/callback";

// if (process.env.NODE_ENV !== "production") {
//   REDIRECT_URI = "http://localhost:8888/callback";
//   FRONTEND_URI = "http://localhost:3000";
// }

app.get("/login", function(req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope:
          "user-read-private user-read-email user-read-recently-played user-top-read",
        redirect_uri: REDIRECT_URI
      })
  );
});

app.get("/callback", function(req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code"
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64")
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    let access_token = body.access_token;
    let refresh_token = body.refresh_token;
    console.log(access_token, refresh_token);
    let uri = FRONTEND_URI || "http://localhost:3000";
    res.redirect(
      uri + "?access_token=" + access_token + "&refresh_token=" + refresh_token
    );
  });
});

let port = process.env.PORT || 8888;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);
app.listen(port);
