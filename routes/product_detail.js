const express = require('express')
const dataBase = require('./../modules/db_connect')

const router = express.Router()

//登入路由
router.use((req, res, next) => {
  next()
})

//拿到全部商品
const getProductDetailData = async (cat, pid) => {
  // console.log('c2', typeof cat, pid)
  let sql =
    // 'SELECT * FROM product_total A LEFT JOIN product_comment C ON A.product_id = C.product_id LEFT JOIN product_brand B ON A.brand_category_id = B.brand_category_id LEFT JOIN member_list M ON C.member_id = M.member_id WHERE  A.`product_id` = ?'
    'SELECT A.product_id,A.product_name,A.product_price,A.product_pic,A.product_category_id,A.brand_category_id,A.product_detail_content,B.brand_category,C.p_comment_id,C.star,C.content,C.comment_created_at,M.email,M.member_id,M.member_pic FROM product_total A LEFT JOIN product_brand B ON A.brand_category_id = B.brand_category_id LEFT JOIN product_comment C ON A.product_id = C.product_id AND C.comment_done = 1 LEFT JOIN member_list M ON C.member_id = M.member_id WHERE A.product_id =?'
  // console.log('sql', sql)
  try {
    const [rows] = await dataBase.query(sql, [pid])
    // console.log('r', rows)

    return rows
  } catch (error) {}
}

router.post('/product_detail_api', async (req, res) => {
  let cat = JSON.parse(req.body.product_category) || 1
  let pid = JSON.parse(req.body.product_id) || 1
  // console.log(cat, pid)
  res.json(await getProductDetailData(cat, pid))
})

module.exports = router
