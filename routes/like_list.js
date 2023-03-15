const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()

//登入後才能做的事
router.use((req, res, next) => {
  next()
})

//獲得收藏清單
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM `like_list` WHERE 1')

  res.json(rows)
})

//新增收藏
router.post('/', async (req, res) => {
  //   const { member_id, product_id } = req.body

  const [rows] = await db.query(
    'INSERT INTO `like_list`( `member_id`, `product_id`, `modify_at`) VALUES (?,?,NOW())',
    [1, 2]
  )

  res.json([rows])
})

//刪除收藏
router.delete('/:sid', async (req, res) => {
  const sid = req.params.sid
  console.log(sid)

  const [rows] = await db.query('delete  FROM `like_list` WHERE `sid` = ?', [
    sid,
  ])
  res.json(rows)
})

module.exports = router
