var express = require("express");
var cors = require("cors");
var app = express();

app.use(cors());

app.get("/products/:id", function (req, res) {
  console.log(req);
  res.send("Hola estoy funcionando xd");
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});
