const express = require("express");
const dataBase = require("./../modules/db_connect");
const jwt = require("jsonwebtoken");
const router = express.Router();
//登入後才能檢視要塞這

router.use((req, res, next) => {
  next();
});

// //首頁拉商品
const getproductdata = async (req) => {
  const sql = `SELECT product_id,product_name, product_price, product_pic FROM product_total LIMIT 0,6 `;

  // const [rows] = await dataBase.query(sql, [
  //   req.body.product_name,
  //   req.body.product_price,
  //   req.body.product_pic,
  //   req.params.product_id,
  // ]);

  const [rows] = await dataBase.query(sql);
  const a = rows.map((v, i) => {
    return { ...v, product_pic: v.product_pic.split(",") };
  });
  console.log(a[1].product_pic[0]);
  return [rows];
};

router.get("/home_product", async (req, res) => {
  res.json(await getproductdata(req));
});

// //首頁拉文章

const getarticles = async (req) => {
  const sql = `SELECT title, content_1, article_pic_main FROM articles LIMIT 0,3 `;
  const [rows] = await dataBase.query(sql, [req.params.id]);
  return rows;
};

router.get("/home_articles", async (req, res) => {
  res.json(await getarticles(req));
});

module.exports = router;
