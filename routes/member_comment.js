const express = require('express')
const dataBase = require('./../modules/db_connect')
const router = express.Router()

// 拿取歷史評論
router.post('/getAllComment', async (req, res) => {
  const sql =
    'SELECT c.*,o.product_name FROM `product_comment` c LEFT JOIN order_detail o ON c.order_id=o.order_id AND c.product_id=o.product_id WHERE c.`member_id` = ?'

  let [result] = await dataBase.query(sql, [req.body.member_id])
  //   console.log(result)
  res.json(result)
})

// 判斷有沒有新到貨商品的若有就加新評論
router.post('/handlenewComment', async (req, res) => {
  const sql =
    'INSERT INTO `product_comment`(`order_id`, `product_id`, `member_id`, `comment_done`) VALUES (?,?,?,0)'
  let oid = req.body.oid
  let pid = req.body.pid //包成陣列
  let mid = req.body.mid
  console.log(oid, pid, mid)
  let result

  for (let i = 0; i < pid.length; i++) {
    const [newL] = await dataBase.query(sql, [oid, pid[i], mid])
    result = { ...result, newL }
  }
  const makeReceiveSQL =
    'UPDATE `order_all` SET `receive_done`=1 WHERE `order_id` = ?'
  const [Receive] = await dataBase.query(makeReceiveSQL, [oid])
  result = { ...result, Receive }

  res.json(result)
})

// 拿單獨評價
router.post('/getSingleComment', async (req, res) => {
  const sql =
    'SELECT c.*,o.product_name, p.product_category_id FROM `product_comment` c LEFT JOIN order_detail o ON c.order_id=o.order_id AND c.product_id=o.product_id LEFT JOIN product_total p ON c.product_id = p.product_id  WHERE c.`p_comment_id` = ?'

  let [result] = await dataBase.query(sql, [req.body.cid])
  //   console.log('sigle', result)
  res.json(result)
})

// 修改評價
router.post('/upDateComment', async (req, res) => {
  let result = {}
  if (req.body.star) {
    const sql =
      'UPDATE `product_comment` SET `star`=?,`content`=?,`comment_created_at`=NOW(),`comment_done`=1 WHERE `p_comment_id`=? '
    ;[result] = await dataBase.query(sql, [
      req.body.star,
      req.body.content,
      req.body.pid,
    ])
    result = { ...result, success: !!result.affectedRows }
  } else {
    result.success = false
    result.error = '請給予星數'
  }

  //   console.log('sigle', result)
  res.json(result)
})

module.exports = router
