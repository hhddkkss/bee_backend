const express = require('express')
const dataBase = require('./../modules/db_connect')

const router = express.Router()

//登入路由
router.use((req, res, next) => {
  next()
})

const getAddressData = async (req) => {
  let rows = []
  const sql = `SELECT * FROM address_list `
  ;[rows] = await dataBase.query(sql)

  return { rows }
}

router.get('/', async (req, res) => {
  res.json(await getAddressData(req))
})

module.exports = router
