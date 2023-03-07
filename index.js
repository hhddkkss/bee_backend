//aaron test  database 測試資料庫用 正式寫會刪除
if (process.argv[2] && process.argv[2] == 'production') {
  require('dotenv').config({
    path: './production.env',
  })
} else if (process.argv[2] && process.argv[2] == 'aaron') {
  require('dotenv').config({
    path: './aaron.env',
  })
} else {
  require('dotenv').config({
    path: './dev.env',
  })
}

//引入區
//express
const express = require('express')
const dataBase = require('./modules/db_connect')
const cors = require('cors')

// aaron database測試用
const db = require('./modules/mydb-connect')
//session
const session = require('express-session')
//mysql session(higher-order function)
const MysqlStore = require('express-mysql-session')(session);
//
const sessionStore = new MysqlStore({},dataBase);

//密碼加密bcrypt
const bcrypt = require('bcryptjs');
//Token
const jwt = require('jsonwebtoken')



//2.建立 web server 物件
const app = express()
//EJS
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
//設定白名單

//session設定
app.use(session({
  saveUninitialized:false,
  resave:false,
  secret:'fueihfiwjcf%%xsjw',
  store: sessionStore,
  cookie:{
      maxAge:12000000
  }
}));
//Top-level middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use((req, res, next) => {
  res.locals.title = 'Beebee'

  next()
})
app.use(cors())

//路由Routers

app.get('/', (req, res) => {
  res.render('main', { name: 'beebee' })
})

app.get('/try_db', async (req, res) => {
  const [rows] = await dataBase.query('SELECT * FROM member_list LIMIT 15')
  res.json(rows)
})

//aaron 測試用
app.get('/try_db2', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM `product_total` WHERE 1 LIMIT 15'
  )
  res.json(rows)
})



//會員登入登出
app.get('/login',(req,res)=>{
  res.send('hi!')
})
app.post('/login' ,async(req, res)=>{
  let output = {
    success : false,
    error:'',
    postData:req.body,
    token:'',
  }

  const sql = "SELECT * FROM `member_list` WHERE `email` = ?";
  const [rows] = await dataBase.query(sql,[req.body.email]);
  //帳號錯誤判斷
   if(!rows.length){
    output.error='Oh!帳號密碼錯誤!'
    return res.json(output);
   }

   //密碼驗證
   let passwordCorrect = false;
   try{
    passwordCorrect = await bcrypt.compare(req.body.password,rows[0].password)
   }catch(ex){}

   if(passwordCorrect){
        output.success = true;
      //把登入記錄在SESSION裡
        req.session.member = {
          member_id:rows[0].member_id, 
      }
      
     // 包成token
      output.token= jwt.sign({
        member_id:rows[0].member_id,
        email:rows[0].email
            },process.env.JWT_SECRET)
            output.memberId=rows[0].member_id;
            output.memberEmail=rows[0].email
            res.json(output);
     }else{
          output.error="402帳號密碼錯誤"
          return res.json(output);
        }




   

} )











app.use('/member_page', require('./routes/member_page'))
app.use('/article_page', require('./routes/article_page'))
app.use('/products', require('./routes/products'))
app.use('/cart', require('./routes/cart'))
app.use('/coupon', require('./routes/coupon'))

//靜態內容資料夾
app.use(express.static(__dirname + '/public'))
app.use(express.static('node_modules/bootstrap/dist'))
app.use(
  express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free')
)

//404錯誤頁面Router
app.use((req, res) => {
  res.status(404).send(`<h1>找不到QQ</h1>`)
})

//Server 偵聽
const port = process.env.PORT || 3000

app.listen(port, function () {
  console.log(`已啟動server:${port}`)
})
