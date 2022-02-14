let express = require("express");
let app = express();
let http = require("http").createServer(app);

app.get("/", (req, res) => {
  res.send("Hello Admins!");
});

http.listen(process.env.PORT || 3000);
