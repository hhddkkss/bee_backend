const express = require('express')
const dataBase = require('./../modules/db_connect')
const router = express.Router()
const { OAuth2Client } = require('google-auth-library')

// Step 1 :載入 GCP OAuth 2.0 用戶端 ID 憑證

// const keys = require(__dirname + '/../client_secret.json')
const oAuth2c = new OAuth2Client(
  // keys.web.client_id,
  // keys.web.client_secret,
  // keys.web.redirect_uris[0]
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URIS
)

// Step 2 :創建處理 Google 登錄的路由
router.get('/', async function (req, res, next) {
  const authorizeUrl = oAuth2c.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })
  res.json(authorizeUrl)
  next
})

//Step 3: 拿取資料
router.post('/googleBack', async function (req, res, next) {
  // 3-1拿取URL上的queryString
  const qs = req.body.qq
  // console.log('query', qs)
  // console.log('query type', typeof qs)
  let myData = {}
  let r = {}

  if (qs.code) {
    // 內容參考 /references/from-code-to-tokens.json
    //3-2 解析query string裡的token
    r = await oAuth2c.getToken(qs.code)
    // console.log('token:',JSON.stringify(r, null, 2));
    oAuth2c.setCredentials(r.tokens)
    //setCredentials將token設置為 OAuth2Client 實例的憑證屬性

    // 連線回應內容參考 /references/tokeninfo-results-oauth2.googleapis.com.json
    console.log(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${r.tokens.id_token}`
    )

    //3-3 讀取google oAuth資料
    const url =
      'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos'

    const response = await oAuth2c.request({ url })
    // response 內容參考 /references/people-api-response.json
    myData = response.data
  }
  myData = {
    email: myData.emailAddresses[0].value,
    name: myData.names[0].displayName,
    pic: myData.photos[0].url,
    token: r.tokens.id_token,
  }
  res.json(myData)
})

router.post('/isMember', async (req, res) => {
  let output = {}
  const sql =
    'SELECT `member_id`,`member_name` FROM `member_list` WHERE `email` = ?'
  const [result] = await dataBase.query(sql, req.body.email)
  if (result.length > 0) {
    output.memberId = result[0].member_id
    output.memberName = result[0].member_name
    output.succeess = true
  } else {
    output.succeess = false
  }

  res.json(output)
})

module.exports = router
