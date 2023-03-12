const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()

//登入後才能做的事
router.use((req, res, next) => {
  next()
})

//獲取某個會員的購物車
//- 網址 /cart/4
router.get('/:member_id', async (req, res) => {
  // request 中拿到 member_id
  const { member_id } = req.params
  console.log(member_id)

  try {
    const [rows] = await db.query(
      'SELECT * FROM `cart_item` WHERE `member_id` = ?',
      [member_id]
    )

    //總共幾樣商品
    const [[{ totalRows }]] = await db.query(
      'SELECT COUNT(1) totalRows FROM `cart_item` WHERE `member_id` = ?',
      [member_id]
    )

    res.json({ rows, totalRows })
  } catch (e) {
    console.log('讀取錯誤')
  }
})

//新增商品進購物車
//- 網址 post  /cart
router.post('/', async (req, res) => {
  const { member_id, product_id } = req.body

  for (let i = 0; i < product_id.length; i++) {
    try {
      const [results] = await db.query(
        'INSERT INTO `cart_item` (member_id, product_id, quantity,modify_at) VALUES (?, ?, 1,NOW())',
        [member_id, product_id[i]]
      )

      res.json(results)
    } catch (e) {
      console.log('新增購物車錯誤')
    }
  }
})

//更改商品數量 /cart/1
router.put('/:sid', async (req, res) => {
  const quantity = req.body.quantity
  const sid = req.params.sid

  try {
    const results = await db.query(
      'UPDATE `cart_item` SET quantity = ? WHERE sid = ?',
      [quantity, sid]
    )

    res.json(results)
  } catch (error) {
    console.log('修改失敗')
  }
})

//刪除購物車內商品 /cart/1
router.delete('/:sid', async (req, res) => {
  const sid = req.params.sid

  try {
    const results = await db.query('DELETE FROM `cart_item` WHERE `sid` = ? ', [
      sid,
    ])

    res.json(results)
  } catch (error) {
    console.log('刪除失敗')
  }
})

module.exports = router
