const express = require("express");
const dataBase = require("./../modules/db_connect");
const jwt = require("jsonwebtoken");
const router = express.Router();
const MemberModifyMethod = require("../controllers/modify_controller");
const Base64 = require("crypto-js/enc-base64");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer({ dest: "../public/uploads" });
//登入後才能檢視要塞這

router.use((req, res, next) => {
  next();
});

const getMemberData = async (req) => {
  const sql = `SELECT * FROM member_list WHERE member_id = ?`;
  console.log(req.params.member_list);
  // const [rows] = await dataBase.query(sql, [req.params.member_list]);
  const re = await dataBase.query(sql, [req.params.member_list]);
  return { re };
};

router.get("/member_api/:member_list", async (req, res) => {
  res.json(await getMemberData(req));
});

// 修改密碼
const changeMemberPassword = async (id, newPassHashed) => {

  const sql =
    "UPDATE `member_list` SET `password`= ? ,`last_edit_date`= NOW() WHERE `member_id`=?";
  const [result1] = await dataBase.query(sql, [newPassHashed, id]);

  return result1;
};
const MatchMemberPassword = async (req) => {
  //將結果值先預設好
  let output = {
    success: false,
    error: "",
  };
  //將會員id宣告成變數
  
  let memberId = req.body.id;
  const passsql = `SELECT password FROM member_list WHERE member_id = ?`;
  const [rows] = await dataBase.query(passsql, [memberId]);

  const realOldPass = rows[0].password;
  const newPass = req.body.newPass;
  const oldPass = req.body.oldPass;

  //如果舊密碼一致,就更改密碼
  bcrypt.compare(oldPass, realOldPass, (err, isMatch) => {
    console.log("compareSync:",bcrypt.compareSync(oldPass, realOldPass)) 
    //if(真的舊密碼解密後 跟 輸入後舊密碼 一樣)
    if (!err) {
      // 比對出錯，處理錯誤
    }
    if (isMatch) {
      // 密碼正確，更改密碼

      //     //先把新密碼加密
      const newPassHashed = bcrypt.hashSync(newPass, 10);
      console.log("1:", newPassHashed);

      console.log(bcrypt.compareSync(oldPass, realOldPass))
      //     //將changeMemberPassword丟出的result設定給output.SqlResult
      //      // output.SqlResult = changeMemberPassword(會員id, 會員新密碼（加密  );
const a = changeMemberPassword(memberId,newPassHashed).then((data)=>{
  console.log(data,71)
})
console.log(a,73)
      output.SqlResult =  changeMemberPassword(memberId, newPassHashed);
      //     //是否成功更改密碼判斷
      console.log(output.SqlResult,76)
      if (output.SqlResult.affectedRows > 0) {
        output.success = true;
      } else {
        output.success = false;
        output.error = "資料未被修改成功";
      }
    } else {
      //     //輸入錯誤頁面
      output.success = false;
    }
    //console.log("out:", output);
    return output;
  });
};



router.put("/password", async (req, res) => {
  res.json(await MatchMemberPassword(req));
});
// router.get("/password", (req, res) => {
//   res.send("<h1>123</h1>");
// });

// 修改會員資料
// memberModifyMethod = new MemberModifyMethod();

// // 會員登入
// router.post('/member/login', memberModifyMethod.postLogin);

// 更新會員資料
// router.put('/member', memberModifyMethod.putUpdate);

// 更新會員資料（檔案上傳示範，可直接取代/member的PUT method）
// router.put('/updateimage', memberModifyMethod.putUpdateImage);

// modules.exports = router;

router.get("/edit/:member_id", async (req, res) => {
  const sql = ` SELECT * FROM member_list WHERE member_id=?`;
  const [rows] = await dataBase.query(sql, [req.params.member_id]);

  res.json(rows);
});
// if (!rows || !rows.length) {
//   return res.redirect(req.baseUrl); // 跳轉到列表頁
// }
// res.render("member_list/edit", rows[0]);

router.put("/edit/:member_id", async (req, res) => {
  const output = {
    success: false,
    code: 0,
    error: {},
    postData: req.body, // 除錯用
  };

  const sql =
    "UPDATE `member_list` SET `member_name` =?, `email` = ?, `password` = ?,`gender` = ?, `mobile` = ?, `birthday` = ?, `address_city` = ?, `address_dist` = ?, `address_rd` = ?, `last_edit_date`= NOW() WHERE `member_id` = ?";
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
  ]);

  if (result.affectedRows) output.success = true;
  output.result = result;
  res.json(output);
  console.log(output);
});

// router.get("/item/:member_id", async (req, res) => {
//   // 讀取單筆資料
// });

//上傳圖片還沒有資料庫
router.post(
  "/member_photo/:member_id",
  upload.single({ name: "avatar", maxCount: 1 }),
  async (req, res) => {
    const sql = `UPDATE member_list SET member_pic = ? WHERE member_id = ?`;
    const [result] = await dataBase.query(sql, [
      req.params.member_pic,
      req.params.member_id,
    ]);

    res.json(result);
  }
);

//記得!!!!----將路由作為模組打包匯出----
module.exports = router;