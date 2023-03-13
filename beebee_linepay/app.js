//1.import
const express = require("express");
var path = require("path");
//2.
const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
//3. web server
app.get("/", (req, res) => {
  res.json(123);
});

//static folder
app.use("/linepay", require("./routes/index"));

//4. server port listening
const port = 3032;

app.listen(port, function () {
  console.log(`start server ${port}`);
});
