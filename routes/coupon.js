const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()

//登入後才能做的事
router.use((req, res, next) => {
  next()
})

//優惠券 /coupon/:code
router.get('/:code', async (req, res) => {
  const code = req.params.code
  console.log(code)

  const sql = 'SELECT * FROM `coupon` WHERE `code` = ?'

  try {
    const [rows] = await db.query(sql, [code])

    if (rows[0].code) {
      res.json(rows[0])
    }
  } catch (error) {
    res.send('沒有此優惠券 請重新輸入')
  }
})

module.exports = router
