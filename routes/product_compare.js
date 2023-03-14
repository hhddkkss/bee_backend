const express = require('express')
const dataBase = require('./../modules/db_connect')
const router = express.Router()

const getCompareProducts = async (req) => {
  // 記得資料要轉成string才能往後傳!
  const compareProductIds = JSON.parse(req.body.comparedList) || []
  //const compareProductIds = '7,25,35,50,66,75,172,181,247,211'.split(',')
  // console.log('B001', compareProductIds)
  let rows = []
  const sql = 'SELECT * FROM `product_total` WHERE `product_id` = ?'
  for (let i = 0; i <= compareProductIds.length; i++) {
    let [result] = await dataBase.query(sql, [compareProductIds[i]])
    rows = [...rows, ...result]
  }
  // console.log('B002', rows)
  return rows
}

// 比價列表API
router.post('/', async (req, res) => {
  res.send(await getCompareProducts(req))
})

// 比價區API
router.post('/compareIng', async (req, res) => {
  // 記得資料要轉成string才能往後傳!
  //用JSON.parse()就可以把[]刪掉!
  const compareProductIds = JSON.parse(req.body.compareIngList) || []
  console.log('前端拿來的ID:', compareProductIds)
  let key = req.body.compareType
  console.log('前端拿來的key:', key)
  let sql = ''
  switch (key) {
    case 1:
      sql =
        'SELECT * FROM product_cell_phone A LEFT JOIN product_total T ON A.product_id = T.product_id WHERE  A.`product_id` = ?'
      break
    case 2:
      sql =
        'SELECT * FROM product_tablet_computer A LEFT JOIN product_total T ON A.product_id = T.product_id WHERE  A.`product_id` = ?'
      break
    case 3:
      sql =
        'SELECT * FROM product_headphones A LEFT JOIN product_total T ON A.product_id = T.product_id WHERE  A.`product_id` = ?'
      break
    default:
      sql =
        'SELECT * FROM product_cell_phone A LEFT JOIN product_total T ON A.product_id = T.product_id WHERE  A.`product_id` = ?'
  }
  let rows = []
  for (let i = 0; i <= compareProductIds.length; i++) {
    let [result] = await dataBase.query(sql, [compareProductIds[i]])
    rows = [...rows, ...result]
  }
  console.log('rows:', rows)
  res.send(rows)
})

module.exports = router
