const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()

//登入後才能做的事
router.use((req, res, next) => {
  next()
})

//獲取某個會員的購物車
//- 網址 /cart/4
router.get('/api/:member_id', async (req, res) => {
  // request 中拿到 member_id
  const { member_id } = req.params

  try {
    const [rows] = await db.query(
      'SELECT DISTINCT product_total.* ,cart_item.* FROM `cart_item` INNER JOIN product_total ON cart_item.product_id = product_total.product_id WHERE cart_item.member_id = ?',
      [member_id]
    )

    //* 會有重複值
    // const [rows] = await db.query(
    //   'SELECT * FROM `cart_item` INNER JOIN product_total ON cart_item.product_id = product_total.product_id WHERE cart_item.member_id = ?',
    //   [member_id]
    // )

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

router.post('/', async (req, res) => {
  const { member_id, product_id } = req.body
  console.log('A1', member_id, 'A2', product_id)
  //判斷有沒有值進來 有的話找資料庫 有沒有member＿id的商品

  let [rows] = await db.query(
    'SELECT C.product_id FROM `cart_item` C WHERE member_id = ? ',
    [member_id]
  )
  // console.log(rows, 'result')
  rows = rows.map((v) => {
    return v.product_id
  })
  // console.log(rows, 'result2')

  // console.log('A3', product_id[0])
  // console.log('A4', !rows.includes(1))

  const waitToAdd = product_id.map((v) => {
    if (!rows.includes(v)) {
      // console.log('A3', v)
      return v
    } else {
      // console.log('A5', v)
      return
    }
  })
  // console.log(waitToAdd, 'waitToAdd')

  for (let i = 0; i < waitToAdd.length; i++) {
    try {
      const [results] = await db.query(
        'INSERT INTO `cart_item` (member_id, product_id, quantity,modify_at) VALUES (?, ?, 1,NOW())',
        [member_id, waitToAdd[i]]
      )

      res.json(results)
    } catch (e) {
      console.log('新增購物車錯誤')
    }
  }
})

//- 網址 post  /cart
// router.post('/', async (req, res) => {
//   const { member_id, product_id } = req.body

//   for (let i = 0; i < product_id.length; i++) {
//     //判斷有沒有值進來 有的話找資料庫 有沒有member＿id的商品
//     if (member_id && product_id) {
//       const [hasCartItem] = await db.query(
//         'SELECT * FROM `cart_item` WHERE `member_id` = ' +
//           member_id +
//           ' AND `product_id`=' +
//           product_id[i]
//       )

//       //判斷資料表裡沒有才寫入
//       if (hasCartItem) {
//       } else {
//         try {
//           const [results] = await db.query(
//             'INSERT INTO `cart_item` (member_id, product_id, quantity,modify_at) VALUES (?, ?, 1,NOW())',
//             [member_id, product_id[i]]
//           )

//           res.json(results)
//         } catch (e) {
//           console.log('新增購物車錯誤')
//         }
//       }
//     }
//   }
// })

//增加商品數量 /cart/1
router.put('/plus/:sid', async (req, res) => {
  const quantity = parseInt(req.body.quantity) + 1
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
//減少商品數量 /cart/1
router.put('/minus/:sid', async (req, res) => {
  const quantity = parseInt(req.body.quantity) - 1
  const sid = req.params.sid

  //數量不為0 正常-1
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
router.delete('/delete/:sid', async (req, res) => {
  const sid = req.params.sid

  if (sid == 0) {
    res.send('刪除失敗')
  }
  try {
    const results = await db.query('DELETE FROM `cart_item` WHERE `sid` = ? ', [
      sid,
    ])

    res.json(results)
  } catch (error) {
    console.log('刪除失敗')
  }
})

//商品細節頁的加入購物車
router.post('/detailAddCart', async (req, res) => {
  const memberId = req.body.memberId || 1
  const productId = req.body.productId || 1
  const count = req.body.count || 2

  //抓會員原cart資料
  let oriSql = `SELECT C.product_id FROM cart_item C WHERE C.member_id = ?  `
  let [alreadyCart] = await db.query(oriSql, [memberId])
  alreadyCart = alreadyCart.map((v) => {
    return v.product_id
  })
  //判斷是否已存在該商品?
  let isIn = alreadyCart.includes(parseInt(productId))
  console.log('A00', alreadyCart, 'A02', isIn, 'A03', typeof productId)
  if (isIn) {
    //更新數量
    let newCSQL =
      'UPDATE `cart_item` SET `quantity`=? ,`modify_at`=NOW() WHERE `member_id` = ? AND `product_id` = ?'
    let [updateResult] = await db.query(newCSQL, [count, memberId, productId])
    res.json(updateResult)
  } else {
    //加入購物車
    let addtSQL =
      'INSERT INTO `cart_item`(`member_id`, `product_id`, `quantity`, `modify_at`) VALUES (?,?,?,NOW())'
    let [addResult] = await db.query(addtSQL, [memberId, productId, count])
    res.json(addResult)
  }
})

module.exports = router
