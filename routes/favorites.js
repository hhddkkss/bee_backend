const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()

//登入後才能做的事
router.use((req, res, next) => {
  next()
})

//獲得收藏清單
router.get('/:member_id', async (req, res) => {
  const { member_id } = req.params

  const [rows] = await db.query(
    'SELECT  `product_total`.* ,`like_list`.* FROM `product_total` INNER JOIN like_list ON like_list.product_id = product_total.product_id WHERE like_list.member_id = ?',
    [member_id]
  )

  res.json(rows)
})

//新增收藏
router.post('/', async (req, res) => {
  const { member_id, product_id } = req.body

  let [rows] = await db.query(
    'SELECT * FROM `like_list`  WHERE member_id = ?  AND `product_id` = ? ',
    [member_id, product_id]
  )
  console.log([member_id, product_id])
  console.log(rows)

  if (rows.length === 0) {
    const [result] = await db.query(
      'INSERT INTO `like_list`( `member_id`, `product_id`, `modify_at`) VALUES (?,?,NOW())',
      [member_id, product_id]
    )
    console.log('新增最愛')
    res.json([result])
  } else {
    res.send('新增錯誤')
  }
})

//刪除收藏
router.delete('/', async (req, res) => {
  const { member_id, product_id } = req.body
  console.log(member_id, product_id)
  const [rows] = await db.query(
    'delete  FROM `like_list` WHERE `member_id` = ? AND product_id = ?',
    [member_id, product_id]
  )
  console.log('刪除最愛')
  res.json(rows)
})

module.exports = router
