if (process.argv[2] && process.argv[2] == "production") {
  require("dotenv").config({
    path: "./production.env",
  });
} else if (process.argv[2] && process.argv[2] == "em") {
  require("dotenv").config({
    path: "./em.env",
  });
} else {
  require("dotenv").config({
    path: "./dev.env",
  });
}

//引入區
//express
const express = require("express");
const dataBase = require("./modules/db_connect");
const cors = require("cors");

// app.listen(3007, () => {
//   console.log("OPEN");
// });
const upload = require(__dirname + "/modules/upload-img");
//2.建立 web server 物件
const app = express();
//EJS
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
//設定白名單
var corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
};
app.use(cors(corsOptions));
//上傳圖片
// app.post("/try-upload2", upload.array("photos"), async (req, res) => {
//   res.json(req.files);
// });

//Top-level middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.title = "Beebee";

  next();
});

//路由Routers

app.post("/try-upload", upload.single("avatar"), async (req, res) => {
  res.json(req.file);
  /*
  if(req.file && req.file.originalname){
      await fs.rename(req.file.path, `public/imgs/${req.file.originalname}`);
      res.json(req.file);
  } else {
      res.json({msg:'沒有上傳檔案'});
  }
  */
});

app.post("/try-upload2", upload.array("photos"), async (req, res) => {
  res.json(req.files);
});

app.get("/", (req, res) => {
  res.render("main", { name: "beebee" });
});

app.get("/try_db", async (req, res) => {
  const [rows] = await dataBase.query("SELECT * FROM member_list LIMIT 15");
  res.json(rows);
});

app.use("/member_page", require("./routes/member_page"));
app.use("/home_page", require("./routes/home_page"));
// app.use("/article_page", require("./routes/article_page"));

//靜態內容資料夾
app.use(express.static(__dirname + "/public"));
app.use(express.static("node_modules/bootstrap/dist"));
app.use(
  express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free")
);

//404錯誤頁面Router
app.use((req, res) => {
  res.status(404).send(`<h1>找不到QQ</h1>`);
});

//Server 偵聽
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`已啟動server:${port}`);
});
