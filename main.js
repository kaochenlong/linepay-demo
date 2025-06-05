import express from "express"
import { orderGenerator } from "./lib/order.js"
import { requestOnlineAPI } from "./lib/linepay.js"

const app = express()
app.set("views", "./templates")
app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/cart", (req, res) => {
  res.render("cart/cart")
})

app.get("/cart/order", (req, res) => {
  res.render("cart/order")
})

app.post("/payment/linepay", async (req, res) => {
  // 跳轉 linepay 頁面
  const data = {
    amount: 100,
    currency: "TWD",
    orderId: orderGenerator(),
    packages: [
      {
        id: "1",
        amount: 100,
        products: [
          {
            id: "PEN-B-001",
            name: "威猛布丁狗",
            imageUrl:
              "https://unsplash.com/photos/gKXKBY-C-Dk/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzQ5MTkxMTYwfA&force=true&w=640",
            quantity: 2,
            price: 50,
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl: "http://localhost:3888/order/confirm",
      cancelUrl: "http://localhost:3888/order/cancel",
    },
  }

  const response = await requestOnlineAPI({
    method: "POST",
    apiPath: "/v3/payments/request",
    data: data,
  })

  if (response.returnCode == "0000") {
    const paymentURL = response.info.paymentUrl.web
    res.redirect(paymentURL)
  } else {
    res.redirect("/payment/fail")
  }
})

app.get("/payment/ok", (req, res) => {
  res.render("payment/ok")
})

app.get("/payment/fail", (req, res) => {
  res.render("payment/fail")
})

app.get("/order/confirm", (req, res) => {
  // 存 transactionId & orderId
  const { transactionId, orderId } = req.query
  console.log("存", transactionId, orderId)

  res.redirect("/payment/ok")
})

app.listen(3888, () => {
  console.log("server is on!")
})
