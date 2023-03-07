const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()

//登入後才能做的事
router.use((req, res, next) => {
  next()
})

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM `like_list` WHERE 1')

  res.json(rows)
})

router.post('/', async (req, res) => {
  //   const { member_id, product_id } = req.body

  const [rows] = await db.query(
    'INSERT INTO `like_list`( `member_id`, `product_id`, `modify_at`) VALUES (?,?,NOW())',
    [1, 2]
  )

  res.json([rows])
})

router.delete('/:sid', async (req, res) => {
  const sid = req.params.sid

  const [rows] = db.query('delete  FROM `like_list` WHERE `sid` = ?', [sid])
  res.json(rows)
})

module.exports = router
