const express = require('express')
const router = express.Router()
const dataBase = require('./../modules/db_connect')

router.get('/get_coupon/:couponId/:memberId', async (req, res) => {
  const sql = `UPDATE member_list SET member_coupon_list = CONCAT(member_coupon_list, ?) WHERE member_id=?;`
  const [result] = await dataBase.query(sql, [
    ',' + req.params.couponId,
    req.params.memberId,
  ])
  //   console.log(result)
  res.json(result)
})

router.get('/alreadyHas/:memberId', async (req, res) => {
  const sql =
    'SELECT `member_coupon_list` FROM `member_list` WHERE `member_id` =?'
  const [result] = await dataBase.query(sql, [req.params.memberId])
  let couponIds = result[0].member_coupon_list.split(',')
  //   console.log(couponIds)
  res.json(couponIds)
})

module.exports = router
