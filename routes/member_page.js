const express = require('express')
const dataBase = require('./../modules/db_connect')

const router = express.Router()

//登入後才能檢視要塞這
router.use((req, res, next) => {
  next()
})

const getMemberData = async (req) => {
  let rows = []
  const sql = `SELECT * FROM member_list WHERE member_id = 1`
  ;[rows] = await dataBase.query(sql)

  return { rows }
}

router.get('/member_api', async (req, res) => {
  res.json(await getMemberData(req))
})

//記得!!!!----將路由作為模組打包匯出----
module.exports = router
