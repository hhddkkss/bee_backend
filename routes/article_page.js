const express = require('express')
const dataBase = require('./../modules/db_connect')

const router = express.Router()

const getAllArticles = async (category) => {
  let sql =
    'SELECT A.*,M.email,M.member_pic FROM articles A LEFT JOIN member_list M ON A.member_id = M.member_id WHERE 1'
  let [result] = await dataBase.query(sql)
  result = result.map((v) => {
    return {
      ...v,
      article_hashtag: v.article_hashtag.split('#'),
      email: v.email.split('@')[0],
    }
  })

  return result
}

const getFrontArticles = async () => {
  let sql =
    'SELECT A.*,M.email,M.member_pic FROM articles A LEFT JOIN member_list M ON A.member_id = M.member_id WHERE `article_category_id` = ? ORDER BY article_id DESC LIMIT 0 , 1'
  let result = []
  for (let i = 1; i < 4; i++) {
    let [a] = await dataBase.query(sql, [i])
    a = a.map((v) => {
      return {
        ...v,
        article_hashtag: v.article_hashtag.split('#'),
        email: v.email.split('@')[0],
      }
    })
    result = [...result, ...a]
  }
  console.log(result)
  return result
}

// 拿首頁資料
router.get('/frontArticle_api', async (req, res) => {
  res.json(await getFrontArticles())
})

// 拿全部文章
router.get('/allArticle_api', async (req, res) => {
  res.json(await getAllArticles())
})

// 發文
router.post('/memberPostArticle', async (req, res) => {
  let output = {
    success: true,
    data: {},
    error: {},
  }
  output.data = req.body
  let sql =
    'INSERT INTO `articles`( `article_category_id`, `title`, `content_1`, `content_2`, `member_id`, `created_at`, `article_pic_main`, `article_pic_content`, `article_hashtag`) VALUES (?,?,?,?,?,NOW(),?,?,?)'
  // 錯誤判斷
  if (!output.data.memberId) {
    output.error.member = '請先登入'
    output.success = false
  }
  if (!output.data.title) {
    output.error.title = '請輸入文章標題'
    output.success = false
  }
  if (!output.data.category) {
    output.error.category = '請為文章分類'
    output.success = false
  }
  if (!output.data.content1) {
    output.error.content = '請輸入文章內容'
    output.success = false
  }
  if (!output.data.main_pic) {
    output.error.main_pic = '請附上至少一張圖片'
    output.success = false
  }

  if (output.success) {
    const [result] = await dataBase.query(sql, [
      output.data.category,
      output.data.title,
      output.data.content1,
      output.data.content2,
      output.data.memberId,
      output.data.main_pic,
      output.data.content_pic,
      output.data.hashTag,
    ])
    output.success = !!result.affectedRows
    console.log(output.success)
  } else {
    output.error.sql = '新增至資料庫失敗'
  }

  res.json(output)
})

// 拿取留言資料
router.post('/articleComments', async (req, res) => {
  const sql =
    'SELECT A.*,M.member_pic,M.email FROM article_message A LEFT JOIN member_list M ON A.member_id = M.member_id WHERE `article_id` = ?'
  let [result] = await dataBase.query(sql, [req.body.article_id])
  result = result.map((v, i) => {
    return { ...v, email: v.email.split('@')[0] }
  })
  res.json(result)
})
// 會員留言
router.post('/postArticleComments', async (req, res) => {
  const sql =
    'INSERT INTO `article_message`( `article_id`, `member_id`, `message_content`, `created_at`) VALUES (?,?,?,NOW())'
  let [result] = await dataBase.query(sql, [
    req.body.article_id,
    req.body.member_id,
    req.body.content,
  ])
  res.json(result)
})

// 會員收藏歷史
router.post('/memberArticleLike', async (req, res) => {
  const sql =
    'SELECT A.*,M.email,M.member_pic FROM  `article_like` L LEFT JOIN `articles` A ON A.id=L.article_id LEFT JOIN member_list M ON A.member_id = M.member_id   WHERE L.member_id =?'
  let [result] = await dataBase.query(sql, [req.body.memberId])
  result = result.map((v, i) => {
    return { ...v, email: v.email.split('@')[0] }
  })
  res.json(result)
})

// 會員發文歷史
router.post('/memberArticlePosted', async (req, res) => {
  const sql =
    'SELECT A.*,M.email,M.member_pic FROM  `articles` A LEFT JOIN member_list M ON A.member_id = M.member_id   WHERE A.member_id =?'
  let [result] = await dataBase.query(sql, [req.body.memberId])
  result = result.map((v, i) => {
    return { ...v, email: v.email.split('@')[0] }
  })
  res.json(result)
})

module.exports = router
