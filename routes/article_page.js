const express = require('express')
const dataBase = require('./../modules/db_connect')

const router = express.Router()

//登入後才能檢視要塞這
router.use((req, res, next) => {
  next()
})

const getMemberData = async (req) => {
  const perPage = 9
  let page = +req.query.page || 1
  page = parseInt(page)
  let redirect = ''

  if (page < 1) {
    redirect = req.baseUrl
  }

  const [[{ totalRows }]] = await dataBase.query(
    'SELECT COUNT(1) totalRows FROM articles'
  )
  const totalPages = Math.ceil(totalRows / perPage)

  let rows = []
  const sql = `SELECT * FROM articles LIMIT ${perPage}`
  ;[rows] = await dataBase.query(sql)

  return {
    totalPages,
    totalRows,
    perPage,
    page,
    redirect,
    rows,
  }
}

router.get('/article_api', async (req, res) => {
  res.json(await getMemberData(req))
})

//記得!!!!----將路由作為模組打包匯出----
module.exports = router
