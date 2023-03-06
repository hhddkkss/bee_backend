const express = require('express')
const db = require('../modules/mydb-connect')

const router = express.Router()

//登入路由
router.use((req, res, next) => {
  next()
})

//拿到全部商品
const getProductsData = async (req, res) => {
  const sql = 'SELECT * FROM `product_total` WHERE 1'
  // const sql2 = 'SELECT COUNT(1) totalRows FROM `product_total` WHERE 1'
  try {
    const [rows] = await db.query(sql)
    // const [[{ totalRows }]] = await db.query(sql2)
    console.log(rows)

    return rows
  } catch (error) {
    res.send(error + '出現錯誤')
  }
}

// const getproductDetail = async() => {
//   const sql = 'SELECT * FROM `product_total` WHERE 1'

//   const data = await db.query(sql,[])
// }

router.get('/pd_api', async (req, res) => {
  res.json(await getProductsData())
})

module.exports = router
