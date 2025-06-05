import express from "express"
import crypto from "crypto"
import "dotenv/config"

const host = "https://sandbox-api-pay.line.me/v3"

function signKey(clientKey, msg) {
  const encoder = new TextEncoder()
  return crypto
    .createHmac("sha256", encoder.encode(clientKey))
    .update(encoder.encode(msg))
    .digest("base64")
}

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

app.post("/payment/linepay", (req, res) => {
  // 跳轉 linepay 頁面
  const { LINEPAY_CHANNEL_ID, LINEPAY_CHANNEL_SECRET_KEY } = process.env
  const apiPath = "/payments/request"
  const nonce = crypto.randomUUID()
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
            name: "Pen Brown",
            imageUrl: "https://pay-store.example.com/images/pen_brown.jpg",
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
  const msg = `${LINEPAY_CHANNEL_SECRET_KEY}${apiPath}${JSON.stringify(
    data
  )}${nonce}`

  const sig = signKey(LINEPAY_CHANNEL_SECRET_KEY, msg)
  const headers = {
    "Content-Type": "application/json",
    "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
    "X-LINE-Authorization": sig,
    "X-LINE-Authorization-Nonce": nonce,
  }

  console.log(headers)

  res.redirect("/payment/ok")
})

app.get("/payment/ok", (req, res) => {
  res.render("payment/ok")
})

app.listen(3888, () => {
  console.log("server is on!")
})

function orderGenerator() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()

  return `OD-${date}-${random}`
}
