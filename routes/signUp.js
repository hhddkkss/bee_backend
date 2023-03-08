const express = require('express')
const dataBase = require('./../modules/db_connect')
//E-mail格式認證
const validator = require('email-validator')
//password格式認證
const passwordValidator = require('password-validator')
const passVali = new passwordValidator()
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

const router = express.Router()
//密碼加密bcrypt
const bcrypt = require('bcryptjs')

//登入路由
router.use((req, res, next) => {
  next()
})

//申請API
router.post('/', async (req, res) => {
  let output = {
    success: true,
    affectedRows: 0,
    error: {},
    data: {},
  }
  let dataValue = {
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
  if (dataValue.name.length < 1) {
    output.success = false
    output.error.name = '請輸入正確姓名'
  }
  if (dataValue.email.length < 1 || !validator.validate(dataValue.email)) {
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
    output.affectedRows = result.affectedRows

    res.json([output, dataValue])
    return
  }
  res.json([output, dataValue])

  //[result] 結果為陣列,皆會塞進第一個值  這邊不用prepare 直接query,在第二個參數塞值
})

module.exports = router
