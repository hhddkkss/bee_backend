const express = require('express')
const dataBase = require('./../modules/db_connect')
const articleUpload = require('./../modules/article_upload')
//jimp 圖片處理
const router = express.Router()

const getAllArticles = async () => {
  let sql =
    'SELECT A.article_id,A.article_category_id,A.title,A.content_1,A.member_id,A.article_pic_main,A.article_hashtag,M.email,M.member_pic FROM articles A LEFT JOIN member_list M ON A.member_id = M.member_id WHERE `article_OnPublic` = 1'
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
const getSingleArticle = async (id) => {
  let sql =
    'SELECT A.*,M.email,M.member_pic FROM articles A LEFT JOIN member_list M ON A.member_id = M.member_id WHERE A.article_id = ? '
  let [result] = await dataBase.query(sql, [id])
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
    'SELECT A.*,M.email,M.member_pic FROM articles A LEFT JOIN member_list M ON A.member_id = M.member_id WHERE `article_category_id` = ? AND `article_OnPublic`=1 ORDER BY article_id DESC LIMIT 0 , 1'
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
  // console.log(result)
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
// 拿單篇文章
router.post('/singleArticle_api', async (req, res) => {
  res.json(await getSingleArticle(req.body.article_id))
})

// 發文圖片
router.post(
  '/memberPostArticlePic',
  articleUpload.single('articlePic'),
  (req, res) => {
    // console.log('files:', req.file)
    res.json(req.file)
  }
)

// 發文
router.post('/memberPostArticle', async (req, res) => {
  let output = {
    success: true,
    data: {},
    error: {},
  }
  output.data = req.body
  console.log(output.data)
  let sql =
    'INSERT INTO `articles`( `article_category_id`, `title`, `content_1`, `content_2`, `member_id`, `created_at`, `article_pic_main`, `article_pic_content`, `article_hashtag`, `article_OnPublic`) VALUES (?,?,?,?,?,NOW(),?,?,?,?)'
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
  if (!output.data.content_1) {
    output.error.content_1 = '請輸入文章內容'
    output.success = false
  }
  if (!output.data.article_pic_main) {
    output.error.article_pic_main = '請附上至少一張圖片'
    output.success = false
  }

  if (output.success) {
    const [result] = await dataBase.query(sql, [
      output.data.category,
      output.data.title,
      output.data.content_1,
      output.data.content_2,
      output.data.memberId,
      output.data.article_pic_main,
      output.data.article_pic_content,
      output.data.hashtags,
      output.data.article_OnPublic,
    ])
    output.success = !!result.affectedRows
    // console.log(output.success)
  } else {
    output.error.sql = '新增至資料庫失敗'
  }
  console.log('output', output)
  res.json(output)
})

// 更新文章
router.post('/memberEditPostArticle', async (req, res) => {
  let output = {
    success: true,
    data: {},
    error: {},
  }
  output.data = req.body
  console.log(output.data)
  let sql =
    'UPDATE `articles` SET `article_category_id`=?,`title`=?,`content_1`=?,`content_2`=?,`member_id`=?,`created_at`=NOW(),`article_pic_main`=?,`article_pic_content`=?,`article_hashtag`=?,`article_Onpublic`=? WHERE `article_id`=?'
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
  if (!output.data.content_1) {
    output.error.content_1 = '請輸入文章內容'
    output.success = false
  }
  if (!output.data.article_pic_main) {
    output.error.article_pic_main = '請附上至少一張圖片'
    output.success = false
  }

  if (output.success) {
    const [result] = await dataBase.query(sql, [
      output.data.category,
      output.data.title,
      output.data.content_1,
      output.data.content_2,
      output.data.memberId,
      output.data.article_pic_main,
      output.data.article_pic_content,
      output.data.hashtags,
      output.data.article_OnPublic,
      output.data.article_id,
    ])
    output.success = !!result.affectedRows
    // console.log(output.success)
  } else {
    output.error.sql = '更新至資料庫失敗'
  }
  console.log('output', output)
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

// 加入收藏文章
router.post('/memArticleLikeOrRemove', async (req, res) => {
  let output = {
    success: false,
    res: [],
  }
  //先尋找該會員原本喜愛資料
  const getOgSql =
    'SELECT article_id FROM `article_like` WHERE `like_member_id` = ?'
  let [ogResult] = await dataBase.query(getOgSql, [req.body.memberId])
  ogResult = ogResult.map((v) => {
    return v.article_id
  })
  //將丟入資料與舊資料比對,是否已經加入過?
  const newLike = JSON.parse(req.body.likeArticle)
  const isIn = ogResult.includes(newLike)
  //若有新資料再加入
  let endResult = {}
  if (!isIn) {
    output.message = '加入成功!'
    const addToLikeSql =
      'INSERT INTO `article_like`(`article_id`,`like_member_id`) VALUES (?,?)'
    ;[endResult] = await dataBase.query(addToLikeSql, [
      newLike,
      req.body.memberId,
    ])
  } else {
    output.message = '已移除'
    const delToLikeSql =
      'DELETE FROM `article_like` WHERE `article_id`=? AND `like_member_id` = ?'
    ;[endResult] = await dataBase.query(delToLikeSql, [
      newLike,
      req.body.memberId,
    ])
  }
  console.log(endResult)
  output.success = !!endResult.affectedRows
  output.res = endResult

  res.json(output)
})

// 會員收藏歷史
router.post('/memberArticleLike', async (req, res) => {
  const sql =
    'SELECT A.*,M.email,M.member_pic,L.like_member_id  FROM article_like L LEFT JOIN articles A ON A.article_id=L.article_id LEFT JOIN member_list M ON A.member_id = M.member_id WHERE L.like_member_id =?'
  let [result] = await dataBase.query(sql, [req.body.memberId])
  result = result.map((v, i) => {
    return {
      ...v,
      email: v.email.split('@')[0],
      article_hashtag: v.article_hashtag.split('#'),
    }
  })
  res.json(result)
})
// 會員收藏歷史ID
router.post('/memberArticleLikeID', async (req, res) => {
  const sql =
    'SELECT A.*,M.email,M.member_pic,L.like_member_id  FROM article_like L LEFT JOIN articles A ON A.article_id=L.article_id LEFT JOIN member_list M ON A.member_id = M.member_id WHERE L.like_member_id =?'
  let [result] = await dataBase.query(sql, [req.body.memberId])
  result = result.map((v, i) => {
    return {
      ...v,
      email: v.email.split('@')[0],
      article_hashtag: v.article_hashtag.split('#'),
    }
  })
  res.json(result)
})

// 會員發文歷史
router.post('/memberArticlePosted', async (req, res) => {
  const sql =
    'SELECT A.*,M.email,M.member_pic FROM  `articles` A LEFT JOIN member_list M ON A.member_id = M.member_id   WHERE A.member_id =?'
  let [result] = await dataBase.query(sql, [req.body.memberId])
  result = result.map((v, i) => {
    return {
      ...v,
      email: v.email.split('@')[0],
      article_hashtag: v.article_hashtag.split('#'),
    }
  })
  res.json(result)
})

//最熱門文章(收藏數及留言數)
router.get('/hotIssue', async (req, res) => {
  const SQL =
    'SELECT a.article_id,a.title,a.article_pic_main,M.email,M.member_pic, COUNT(b.message_id)+COUNT(c.sid) AS hotGrade FROM articles a LEFT JOIN article_message b ON a.article_id = b.article_id LEFT JOIN article_like c ON a.article_id = c.article_id LEFT JOIN member_list M ON a.member_id = M.member_id WHERE a.`article_OnPublic`=1 GROUP BY a.article_id  ORDER BY hotGrade DESC LIMIT 0,5'
  let [result] = await dataBase.query(SQL)
  result = result.map((v, i) => {
    return {
      ...v,
      email: v.email.split('@')[0],
    }
  })
  res.json(result)
})

//該文章案讚數
router.post('/singleArtLikes', async (req, res) => {
  const SQL =
    'SELECT COUNT(c.sid) AS likesCount FROM articles a LEFT JOIN article_like c ON a.article_id = c.article_id WHERE a.article_id =?'
  let [result] = await dataBase.query(SQL, [req.body.article_id])

  res.json(result)
})

// 刪除文章
router.post('/deleteArticle', async (req, res) => {
  const sql = 'DELETE FROM `articles` WHERE `article_id` = ?'
  let [result] = await dataBase.query(sql, [req.body.article_id])
  res.json(result)
})
module.exports = router
