import express from "express"
import "dotenv/config"

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
