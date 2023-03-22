const express = require('express')
const db = require('../modules/db_connect')
const dayjs = require('dayjs')

const router = express.Router()

//新增訂單
router.post('/order_all', async (req, res) => {
  let orderAllOutput = {
    orderNum: '',
    order_recipient: '',
    order_email: '',
    orderDate: '',
    totalPrice: '',
  }

  const {
    member_id,
    order_memo,
    coupon_id,
    firstName,
    lastName,
    order_phone,
    order_address_city,
    order_address_dist,
    order_address,
    order_email,
    postalCode,
    quantity,
    product_price,
    discount,
  } = req.body

  const fee = 120
  //形成訂單編號
  const time = new Date()
  //算出總價
  const getTotalPrice = (arr1, arr2) => {
    let result = []
    for (let i = 0; i < arr1.length; i++) {
      result.push(Number(arr1[i] - 1000) * Number(arr2[i]))
    }
    const totalPrice = result.reduce((a, c) => {
      return a + c
    }, 0)
    return Number(totalPrice)
  }

  //算出折扣後
  const getFinalPrice = (totalPrice) => {
    if (discount) {
      return totalPrice - Number(discount)
    } else {
      return totalPrice
    }
  }

  //組成姓名
  let order_money = getFinalPrice(getTotalPrice(product_price, quantity))
  let order_recipient = lastName + firstName

  const sql =
    'INSERT  INTO `order_all`( `order_id`,`order_day`, `member_id`, `order_state`, `order_money`, `order_memo`, `order_ship_money`, `coupon_id`, `order_recipient`, `order_phone`, `order_address_city`, `order_address_dist`, `order_address`, `order_email`, `postalCode`) VALUES (?,NOW(),?,2,?,?,120,?,?,?,?,?,?,?,?)'

  orderAllOutput = {
    orderNum: 'bee' + dayjs(time).format('YYYYMMDDhhmmss'),
    order_recipient: order_recipient,
    order_email: order_email,
    orderDate: dayjs(time).format('YYYY / MM / DD'),
    totalPrice: getTotalPrice(product_price, quantity),
    finalPrice: getFinalPrice(getTotalPrice(product_price, quantity)) + fee,
    discount: discount,
  }
  console.log(
    {
      member_id,
      order_memo,
      coupon_id,
      lastName,
      firstName,
      order_phone,
      order_address_city,
      order_address_dist,
      order_address,
      order_email,
      postalCode,
      quantity,
      product_price,
      discount,
      orderId: orderAllOutput.orderNum,
    },
    99999
  )

  let [rows] = await db.query(sql, [
    orderAllOutput.orderNum,
    member_id,
    order_money + fee,
    order_memo,
    coupon_id ? coupon_id : null,
    order_recipient,
    order_phone,
    order_address_city,
    order_address_dist,
    order_address,
    order_email,
    postalCode,
  ])
  console.log(rows, 1111)

  res.send(orderAllOutput) //回傳訂單id
})

//新增訂單細節

router.post('/order_detail', async (req, res) => {
  const {
    order_id,
    product_id,
    product_name,
    product_amount,
    product_price,
    payment_method,
    product_pic,
  } = req.body

  console.log({
    order_id,
    product_id,
    product_name,
    product_amount,
    product_price,
    payment_method,
    product_pic,
  })
  console.log(55555)

  let productInfo = []
  for (let i = 0; i < product_id.length; i++) {
    let newProductInfo = {
      product_id: product_id[i],
      product_name: product_name[i],
      product_amount: product_amount[i],
      product_price: product_price[i],
      product_pic: product_pic[i],
    }

    productInfo.push(newProductInfo)
  }

  console.log(productInfo, 'product-info')
  //要傳回去前端的檔案
  const orderDetailOutput = {
    orderId: order_id,
    product_info: productInfo,
    payment_method: payment_method,
  }

  const sql =
    'INSERT  INTO `order_detail`(`order_id`, `product_id`, `product_name`, `product_amount`, `product_price`, `payment_method`) VALUES (?,?,?,?,?,?)'

  for (let i = 0; i < product_id.length; i++) {
    let [rows] = await db.query(sql, [
      order_id,
      product_id[i],
      product_name[i],
      product_amount[i],
      product_price[i],
      payment_method,
    ])
  }

  res.send(orderDetailOutput)
})

//記得!!!!----將路由作為模組打包匯出----
module.exports = router
