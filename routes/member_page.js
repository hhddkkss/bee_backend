const express = require('express')
const dataBase = require('./../modules/db_connect')

const router = express.Router()

//登入後才能檢視要塞這
router.use((req, res, next) => {
  next()
})

const getMemberData = async (req, res) => {
  const id = req.id
  let rows = []
  const sql = `SELECT * FROM member_list WHERE member_id =?`
  ;[rows] = await dataBase.query(sql, id)

  return { rows }
}

router.get('/member_api', async (req, res) => {
  res.json(await getMemberData(req))
})

//記得!!!!----將路由作為模組打包匯出----
module.exports = router
