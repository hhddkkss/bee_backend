const express = require('express')
const db = require('./../modules/db_connect')
const nodemailer = require('nodemailer')
const router = express.Router()
const bcrypt = require('bcrypt')

//登入路由
router.use((req, res, next) => {
  next()
})

router.get('/forget/:email', async (req, res) => {
  //接受email
  const { email } = req.params
  console.log(email)
  const sql = 'SELECT * FROM `member_list` WHERE `email` = ?'

  try {
    const [[rows]] = await db.query(sql, email)

    if (!rows) {
      res.send('此email還沒有註冊過')
    }

    if (rows.email) {
      const validationCode = Math.ceil(Math.random() * 98)

      // 建立 Nodemailer 傳輸器
      //   let testAccount = await nodemailer.createTestAccount()

      //   console.log({ user: testAccount.user, pass: testAccount.pass })

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'rllapxowweim2ni6@ethereal.email',
          pass: 'J6XUxePWHAWgYV212s',
        },
      })

      const mailOptions = {
        from: 'beebee@gmail.com',
        to: rows.email,
        subject: 'beebee忘記密碼驗證信',
        html: `<b>確認驗證碼為：${validationCode} 請在下方表單輸入欄位以完成驗證 再輸入新密碼</b>`,
      }

      transporter.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response)
      })

      //把之前的記錄都清空
      await db.query(
        'DELETE FROM `verification_code` WHERE `member_id` = ?',
        rows.member_id
      )

      //新增新的驗證碼
      await db.query(
        "INSERT INTO `verification_code`( `number`, `member_id`) VALUES ('?','?')",
        [validationCode, rows.member_id]
      )
    }
  } catch (error) {
    console.error('Error sending email:', error)
  }
})

router.get('/confirm_verification_code/:verificationCode', async (req, res) => {
  const output = {
    state: 'fail',
    msg: '驗證碼錯誤',
  }

  const { verificationCode } = req.params

  const sql = 'SELECT * FROM `verification_code` WHERE `number` = ?'

  const [[rows]] = await db.query(sql, verificationCode)
  console.log(rows)

  if (rows) {
    output.state = 'success'
    output.msg = '驗證成功'
  }

  res.send(output)
})

router.put('/', async (req, res) => {
  const { email, newPassword } = req.body
  console.log(email, newPassword)
  const newPassHashed = bcrypt.hashSync(newPassword, 10)

  const sql =
    'UPDATE `member_list` SET `password`=?,`last_edit_date`= NOW() WHERE email= ?'

  const [result] = await db.query(sql, [newPassHashed, email])

  console.log(result)
})

module.exports = router
