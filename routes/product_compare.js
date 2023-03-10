const express = require('express')
const dataBase = require('./../modules/db_connect')
const router = express.Router()

const getCompareProducts = async (req) => {
  // 記得資料要轉成string才能往後傳!
  //   const compareProductIds = req.body.Ids.toString().split(',')
  const compareProductIds = '7,25,35,50,66,75,172,181,247,211'.split(',')
  let rows = []
  const sql = 'SELECT * FROM `product_total` WHERE `product_id` = ?'
  for (let i = 0; i <= compareProductIds.length; i++) {
    let [result] = await dataBase.query(sql, [compareProductIds[i]])
    rows = [...rows, ...result]
  }
  return rows
}

// 比價列表API
router.get('/', async (req, res) => {
  res.send(await getCompareProducts(req))
})

// 比價區API
router.get('/compareIng', async (req, res) => {
  // 記得資料要轉成string才能往後傳!
  // const compareProductIds = req.body.Ids.toString().split(',')
  const compareProductIds = '7,25,35'.split(',')
  let ogRow = await getCompareProducts(req)
  ogRow = ogRow[0]
  let key1 = ogRow.product_category_id
  console.log(key1)
  let sql = ''
  switch (key1) {
    case 1:
      sql = 'SELECT * FROM `product_cell_phone` WHERE  `product_id` = ?'
      break
    case 2:
      sql = 'SELECT * FROM `product_tablet_computer` WHERE  `product_id` = ?'
      break
    case 3:
      sql = 'SELECT * FROM `product_headphones` WHERE  `product_id` = ?'
      break
    default:
      sql = 'SELECT * FROM `product_cell_phone` WHERE  `product_id` = ?'
  }
  let rows = []
  for (let i = 0; i <= compareProductIds.length; i++) {
    let [result] = await dataBase.query(sql, [compareProductIds[i]])
    rows = [...rows, ...result]
  }
  res.send(rows)
})

module.exports = router
