const express = require('express')
const dataBase = require('./../modules/db_connect')
const router = express.Router()

// 拿取歷史評論
router.post('/getAllComment', async (req, res) => {
  const sql =
    'SELECT c.*,o.product_name FROM `product_comment` c LEFT JOIN order_detail o ON c.order_id=o.order_id WHERE c.`member_id` = ?'

  let [result] = await dataBase.query(sql, [req.body.member_id])
  console.log(result)
})

module.exports = router
