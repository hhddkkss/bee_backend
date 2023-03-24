const express = require('express')
const dataBase = require('./../modules/db_connect')
// const jwt = require('jsonwebtoken')
const router = express.Router()
// const MemberModifyMethod = require('../controllers/modify_controller')
const bcrypt = require('bcrypt')
const multer = require('multer')
const uploads = require('./../modules/upload-img')
//登入後才能檢視要塞這

router.use((req, res, next) => {
  next()
})

const getMemberData = async (req) => {
  const sql = `SELECT * FROM member_list WHERE member_id = ?`
  console.log(req.params.member_list)
  // const [rows] = await dataBase.query(sql, [req.params.member_list]);
  const re = await dataBase.query(sql, [req.params.member_list])
  return { re }
}

router.get('/member_api/:member_list', async (req, res) => {
  res.json(await getMemberData(req))
})

// 修改密碼
const changeMemberPassword = async (id, newPassHashed) => {
  const sql =
    'UPDATE `member_list` SET `password`= ? ,`last_edit_date`= NOW() WHERE `member_id`=?'
  const result1 = await dataBase.query(sql, [newPassHashed, id])
  console.log('result1', result1)
  return result1
}
const MatchMemberPassword = async (req) => {
  //將結果值先預設好
  let output = {
    success: false,
    error: '',
  }
  //將會員id宣告成變數

  let memberId = req.body.memberId
  // console.log('aaaa:', memberId)
  const passsql = `SELECT password FROM member_list WHERE member_id = ?`
  const [rows] = await dataBase.query(passsql, [memberId])
  // console.log('bbb:', rows)
  const realOldPass = rows[0].password
  const newPass = req.body.newPass
  const oldPass = req.body.oldPass
  // console.log('ccc:', newPass)

  //如果舊密碼一致,就更改密碼
  const isMatch = bcrypt.compare(oldPass, realOldPass)
  // console.log('compareSync:', bcrypt.compareSync(oldPass, realOldPass))
  //if(真的舊密碼解密後 跟 輸入後舊密碼 一樣)
  if (!isMatch) {
    // 比對出錯，處理錯誤
    // console.log('error')
  }
  if (isMatch) {
    // console.log('yes')
    // 密碼正確，更改密碼

    //     //先把新密碼加密
    const newPassHashed = bcrypt.hashSync(newPass, 10)
    //   console.log('1:', newPassHashed)

    //   console.log(bcrypt.compareSync(oldPass, realOldPass))
    //     //將changeMemberPassword丟出的result設定給output.SqlResult
    //   //      // output.SqlResult = changeMemberPassword(會員id, 會員新密碼（加密  );
    const sql =
      'UPDATE `member_list` SET `password`= ? ,`last_edit_date`= NOW() WHERE `member_id`=?'
    const [result1] = await dataBase.query(sql, [newPassHashed, memberId])

    // const [changeResult] = changeMemberPassword(memberId, newPassHashed)
    output.SqlResult = result1
    //     //是否成功更改密碼判斷
    console.log(result1.affectedRows, 76, output.SqlResult.affectedRows)
    if (output.SqlResult.affectedRows > 0) {
      output.success = true
    } else {
      output.success = false
      output.error = '資料未被修改成功'
    }
  } else {
    //     //輸入錯誤頁面
    output.success = false
  }
  console.log('out:', output)
  return output
}

router.put('/password/:member_id', async (req, res) => {
  res.json(await MatchMemberPassword(req))
})

// const getpassword = async (req) => {
//   const sql = `SELECT password FROM member_list WHERE member_id = ?`
//   const [rows] = await dataBase.query(sql, [req.params.member_id])
//   return rows
// }

// router.get('/password/:member_id', async (req, res) => {
//   res.json(await getpassword(req))
// })

// router.get("/password", (req, res) => {
//   res.send("<h1>123</h1>");
// });

// modules.exports = router;

router.get('/edit/:member_id', async (req, res) => {
  const sql = ` SELECT * FROM member_list WHERE member_id=?`
  const [rows] = await dataBase.query(sql, [req.params.member_id])

  res.json(rows)
})
// if (!rows || !rows.length) {
//   return res.redirect(req.baseUrl); // 跳轉到列表頁
// }
// res.render("member_list/edit", rows[0]);

router.put('/edit/:member_id', async (req, res) => {
  const output = {
    success: false,
    code: 0,
    error: {},
    postData: req.body, // 除錯用
  }

  const sql =
    'UPDATE `member_list` SET `member_name` =?, `email` = ?, `password` = ?,`gender` = ?, `mobile` = ?, `birthday` = ?, `address_city` = ?, `address_dist` = ?, `address_rd` = ?, `last_edit_date`= NOW() WHERE `member_id` = ?'
  //NOW()是一個function
  const [result] = await dataBase.query(sql, [
    req.body.member_name,
    req.body.email,
    req.body.password,
    req.body.gender,
    req.body.mobile,
    req.body.birthday || null,
    req.body.address_city,
    req.body.address_dist,
    req.body.address_rd,
    req.params.member_id,
  ])

  if (result.affectedRows) output.success = true
  output.result = result
  res.json(output)
  // console.log('AAA', output)
})

// router.get("/item/:member_id", async (req, res) => {
//   // 讀取單筆資料
// });

//上傳圖片
router.post(
  '/member_photo/:member_id',
  uploads.single('avatar'),
  async (req, res) => {
    // console.log('name', req.file.filename)
    const fileName = req.file.filename
    console.log(fileName)
    const sql = `UPDATE member_list SET member_pic = ? WHERE member_id = ?`
    const [result] = await dataBase.query(sql, [
      `http://localhost:3003/uploads/${fileName}`,
      req.params.member_id,
    ])
    console.log('res:', result)
    res.json(result)
  }
)

//移除用戶本來的頭貼回預設值
router.get('/member_photo_delete/:member_id', async (req, res) => {
  const sql = `UPDATE member_list SET member_pic = ? WHERE member_id = ?`
  const [result] = await dataBase.query(sql, [
    `http://localhost:3003/uploads/member_default_avatar.png`,
    req.params.member_id,
  ])
  console.log('res:', result)
  res.json(result)
})
//讀取圖片
const readpic = async (req) => {
  const sql = `SELECT member_pic FROM member_list WHERE member_id =? `
  const [rows] = await dataBase.query(sql, [req.params.member_id])
  // console.log('AAA', rows)
  return rows
}

router.get('/member_readphoto/:member_id', async (req, res) => {
  res.json(await readpic(req))
})

//回復初始圖片
// const updatepic = async (req) => {
//   const sql = `UPDATE member_list SET member_pic = ? WHERE member_id = ? `
//   const [rows] = await dataBase.query(sql, [req.params.member_id])
//   // console.log('AAA', rows)
//   return rows
// }
// router.post('/member_readphoto/:member_id', async (req, res) => {
//   res.json(await updatepic(req))
// })

//訂單
// const getshoppinglist = async (req) => {
//   const sql = `SELECT * FROM order_all WHERE member_id =? `
//   const [rows] = await dataBase.query(sql, [req.params.id])
//   return rows
// }

// router.get('/membershoppinglist/:member_id', async (req, res) => {
//   res.json(await getshoppinglist(req))
// })

//navbar name
const getnavname = async (req) => {
  const sql = `SELECT email, member_name,member_pic FROM member_list WHERE member_id =? `
  const [rows] = await dataBase.query(sql, [req.params.member_id])
  // console.log('AAA', rows)
  return rows
}

router.get('/getnavname/:member_id', async (req, res) => {
  res.json(await getnavname(req))
})

//優惠卷
// const getcoupon = async (req) => {
//   const sql = `SELECT coupon_name, code, discount, end_time, id FROM coupon LIMIT 0,3; `
//   // SELECT article_id, title, content_1, article_pic_main FROM articles LIMIT 0,3
//   // SELECT coupon_name, code, discount, end_time, id FROM coupon WHERE id = ?
//   const [rows] = await dataBase.query(sql, [req.params.id])
//   // console.log('AAA', rows)
//   return rows
// }

router.get('/getcoupon/:id', async (req, res) => {
  const sql = `SELECT member_coupon_list FROM member_list WHERE member_id = ?`
  let [couponIds] = await dataBase.query(sql, [req.params.id])
  couponIds = couponIds[0].member_coupon_list
  couponIds = couponIds.split(',') //現在是個陣列
  let rows = []
  for (let i = 0; i < couponIds.length; i++) {
    const couponSql = `SELECT coupon_name, code, discount, end_time, id FROM coupon WHERE id = ?`
    let [newRows] = await dataBase.query(couponSql, [couponIds[i]])
    console.log('newRows', newRows)
    rows = [...rows, ...newRows]
  }
  console.log(rows)
  res.json(rows)
})

// const getcouponmember = async (req) => {
//   const sql = `SELECT member_coupon_list FROM member_list WHERE member_id = ?`
//   const [rows] = await dataBase.query(sql, [req.params.member_id])
//   // console.log('AAA', rows)
//   return rows
// }

// router.get('/getmembercoupon/:member_id', async (req, res) => {
//   res.json(await getcouponmember(req))
// })

//記得!!!!----將路由作為模組打包匯出----
module.exports = router
