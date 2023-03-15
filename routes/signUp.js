const express = require('express')
const dataBase = require('./../modules/db_connect')
const router = express.Router()
//E-mail格式認證
const validator = require('email-validator')
//password格式認證
const passwordValidator = require('password-validator')
const passVali = new passwordValidator()
//密碼規則:最少6最多16含一大寫一小寫兩數字沒空白
passVali
  .is()
  .min(6)
  .is()
  .max(16)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .not()
  .spaces()

//密碼加密bcrypt
const bcrypt = require('bcryptjs')
//Token
const jwt = require('jsonwebtoken')

//申請會員API
router.post('/', async (req, res) => {
  let output = {
    success: true,
    affectedRows: 0,
    error: {},
    data: {},
  }
  output.data = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8) || 0,
    mobile: req.body.mobile,
    gender: req.body.gender,
    birthday: req.body.birthday,
    address_city: req.body.address_city,
    address_dist: req.body.address_dist,
    address_rd: req.body.address_rd,
  }
  //檢查各欄位資料
  if (output.data.name.length < 1) {
    output.success = false
    output.error.name = '請輸入正確姓名'
  }
  if (output.data.email.length < 1 || !validator.validate(output.data.email)) {
    output.success = false
    output.error.email = 'email格式不正確'
  }
  if (!req.body.password || !passVali.validate(req.body.password)) {
    output.success = false
    output.error.password = '密碼格式不正確'
  }

  const sql =
    'INSERT INTO `member_list`(`member_name`,`email`,`password`,`mobile`,`gender`,`birthday`,`address_city`,`address_dist`,`address_rd`,`last_edit_date`,`member_level_id`) VALUES (?,?,?,?,?,?,?,?,?,NOW(),3)'

  if (output.success) {
    const [result] = await dataBase.query(sql, [
      output.data.name,
      output.data.email,
      output.data.password,
      output.data.mobile,
      output.data.gender,
      output.data.birthday,
      output.data.address_city,
      output.data.address_dist,
      output.data.address_rd,
    ])
    output.affectedRows = result.affectedRows
    output.data.sid = result.insertId
    // 包成token
    output.token = jwt.sign(
      {
        member_id: output.data.sid,
        member_email: output.data.email,
      },
      process.env.JWT_SECRET
    )
    res.json(output)
    return
  }
  res.json([output])

  //[result] 結果為陣列,皆會塞進第一個值  這邊不用prepare 直接query,在第二個參數塞值
})

module.exports = router
