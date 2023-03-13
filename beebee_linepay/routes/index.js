const express = require("express");
const router = express.Router();
require("dotenv").config();
const axios = require("axios");
const { HmacSHA256 } = require("crypto-js");
const Base64 = require("crypto-js/enc-base64");

const sampleData = require("../sample/sampleData");

// 環境變數
const {
  LINEPAY_CHANNEL_ID,
  LINEPAY_RETURN_HOST,
  LINEPAY_SITE,
  LINEPAY_VERSION,
  LINEPAY_CHANNEL_SECRET_KEY,
  LINEPAY_RETURN_CONFIRM_URL,
  LINEPAY_RETURN_CANCEL_URL,
} = process.env;

let orders = {};

//前段頁面//
router
  .get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
  })
  .get("/checkout/:id", (req, res) => {
    const { id } = req.params;

    const order = sampleData[id];
    order.orderId = parseInt(new Date().getTime() / 1000);
    orders[order.orderId] = order;
    res.render("checkout", { order });
  });
//   .get("/success/:id", (req, res) => {
//     const { id } = req.params;
//     const order = orders[id];

//     res.render("success", { order });
//   });

//跟linepay串接的api
router.post("/createOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const order = orders[orderId];
  console.log(orderId, order, 1234121);
  console.log("createOrder", orders, 555555);
  try {
    const linePayBody = {
      ...order,
      redirectUrls: {
        confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
        cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`,
      },
    };

    const uri = "/payments/request";
    createSignature(uri, linePayBody);
    const { signature, headers } = createSignature(uri, linePayBody);
    console.log(signature, headers);
    const nonce = parseInt(new Date().getTime() / 1000);
    //nonce可以是自訂的訂單編號或是產生的亂數做為編號
    const string = `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
      linePayBody
    )}${nonce}`;
    //簽章
    // const signature = Base64.stringify(HmacSHA256(string,LINEPAY_CHANNEL_SECRET_KEY));
    // const headers = {
    //  'X-LINE-ChannelId':LINEPAY_CHANNEL_ID,
    //  'Content-Type': 'application/json',
    //  'X-LINE-Authorization-Nonce':nonce,
    //  'X-LINE-Authorization':signature
    //  };

    //準備送給linepay的資訊
    console.log(linePayBody, signature, 9999999999999);
    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
    //發出請求的路徑

    const linePayRes = await axios.post(url, linePayBody, { headers });

    if (linePayRes?.data?.returnCode === "0000") {
      //！！要同時寫入資料庫
      res.redirect(linePayRes?.data?.info.paymentUrl.web);
      //幫客戶轉址的網址
    }
  } catch (error) {
    console.log(error);
    // 錯誤的回饋都會在這
  }
  res.end();
});

//客戶付款完成之後轉回網站
router.get("/linepay/confirm", async (req, res) => {
  const { transactionId, orderId } = req.query;

  try {
    const order = orders[orderId];
    const linePayBody = {
      amount: order.amount,
      currency: "TWD",
    };

    const uri = `/payments/${transactionId}/confirm`;
    const headers = createSignature(uri, linePayBody);

    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
    const linePayRes = await axios.post(url, linePayBody, { headers });
    console.log(linePayRes);
    res.end();
  } catch (error) {
    res.end();
  }
});

//驗證成功，再轉址到交易成功的頁面

// router
//   .post("/linePay/:orderNo", async (req, res) => {
//     const { orderNo } = req.params;
//     const order = orders[orderNo];

// //     try {
//       // 建立 LINE Pay 請求規定的資料格式
//       const linePayBody = createLinePayBody(order);

//       // CreateSignature 建立加密內容
//       const uri = "/payments/request";
//       const headers = createSignature(uri, linePayBody);

//       // API 位址
//       const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
//       const linePayRes = await axios.post(url, linePayBody, { headers });

//       // 請求成功...
//       if (linePayRes?.data?.returnCode === "0000") {
//         res.redirect(linePayRes?.data?.info.paymentUrl.web);
//       } else {
//         res.status(400).send({
//           message: "訂單不存在",
//         });
//       }
//     } catch (error) {
//       // 各種運行錯誤的狀態：可進行任何的錯誤處理
//       console.log(error);
//       res.end();
//     }
//   })
//   .get("/linePay/confirm", async (req, res) => {
//     const { transactionId, orderId } = req.query;
//     const order = orders[orderId];

//     try {
//       // 建立 LINE Pay 請求規定的資料格式
//       const uri = `/payments/${transactionId}/confirm`;
//       const linePayBody = {
//         amount: order.amount,
//         currency: "TWD",
//       };

//       // CreateSignature 建立加密內容
//       const headers = createSignature(uri, linePayBody);

//       // API 位址
//       const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
//       const linePayRes = await axios.post(url, linePayBody, { headers });
//       console.log(linePayRes);

//       // 請求成功...
//       if (linePayRes?.data?.returnCode === "0000") {
//         res.redirect(`/success/${orderId}`);
//       } else {
//         res.status(400).send({
//           message: linePayRes,
//         });
//       }
//     } catch (error) {
//       console.log(error);
//       // 各種運行錯誤的狀態：可進行任何的錯誤處理
//       res.end();
//     }
//   });

// function createLinePayBody(order) {
//   return {
//     ...order,
//     currency: "TWD",
//     redirectUrls: {
//       confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
//       cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`,
//     },
//   };
// }

// function createSignature(uri, linePayBody) {
//   const nonce = new Date().getTime();
//   const encrypt = hmacSHA256(
//     `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
//       linePayBody
//     )}${nonce}`,
//     LINEPAY_CHANNEL_SECRET_KEY
//   );
//   const signature = Base64.stringify(encrypt);

//   const headers = {
//     "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
//     "Content-Type": "application/json",
//     "X-LINE-Authorization-Nonce": nonce,
//     "X-LINE-Authorization": signature,
//   };
//   return headers;
// }

function createSignature(uri, linePayBody) {
  console.log(uri, linePayBody, 0909090);
  const nonce = parseInt(new Date().getTime() / 1000);
  //nonce可以是自訂的訂單編號或是產生的亂數做為編號
  const string = `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
    linePayBody
  )}${nonce}`;
  // //簽章
  const signature = Base64.stringify(
    HmacSHA256(string, LINEPAY_CHANNEL_SECRET_KEY)
  );
  const headers = {
    "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
    "Content-Type": "application/json",
    "X-LINE-Authorization-Nonce": nonce,
    "X-LINE-Authorization": signature,
  };
  return { signature, headers };
}
module.exports = router;
