const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()
//密碼加密bcrypt
const bcrypt = require('bcryptjs')

//登入路由
router.use((req, res, next) => {
  next()
})

//申請API
router.post('/', async (req, res) => {
  //檢查各欄位資料
  let dataValue = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    mobile: req.body.mobile,
    gender: req.body.gender,
    birthday: req.body.birthday,
    address_city: req.body.address_city,
    address_dist: req.body.address_dist,
    address_rd: req.body.address_rd,
  }

  const sql =
    'INSERT INTO `member_list`(`member_name`,`email`,`password`,`mobile`,`gender`,`birthday`,`address_city`,`address_dist`,`address_rd`,`last_edit_date`,`member_level_id`) VALUES (?,?,?,?,?,?,?,?,?,NOW(),3)'

  const [result] = await db.query(sql, [
    dataValue.name,
    dataValue.email,
    dataValue.password,
    dataValue.mobile,
    dataValue.gender,
    dataValue.birthday,
    dataValue.address_city,
    dataValue.address_dist,
    dataValue.address_rd,
  ])
  //[result] 結果為陣列,皆會塞進第一個值  這邊不用prepare 直接query,在第二個參數塞值

  res.json({
    success: !!result.affectedRows,
    // postData: req.body,
    dataValue,
  })
})

module.exports = router
