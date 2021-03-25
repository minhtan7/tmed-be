const moment = require("moment");
/* orderItems: [
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
], */

const orderItems = [
  { quantity: 2, price: 50 },
  { quantity: 3, price: 40 },
  { quantity: 1, price: 30 },
];

const total = orderItems.reduce((total, x) => {
  /* console.log("total", total);
  console.log("x", x); */
  return total + x.quantity * x.price;
}, 0);
console.group(total);

let date_ob = new Date();

// current date
// adjust 0 before single digit date
let datex = date_ob.getDate();
let date = ("0" + date_ob.getDate()).slice(-2);

const x = moment([2020, 2, 24]);
console.log(x);
const y = moment([2021, 4, 24]);
const d = x.diff(y, "days"); //the number of different days
console.log(d);

var now = moment(); // object
var now1 = now.get("date"); //number; days = days of week; date of month
console.log(now);
const asd = { date: now };
console.log(asd.date.get("date"));
const n = now.toString();

/* const l = moment.parseZone(n); //// parse from string to date, it say error but still work */

/// Reservation fee: 100 000
///appointment fee: 300 000 $inc

/* {
  _id: 1,
  sku: "abc123",
  quantity: 10,
  metrics: {
    orders: 2,
    ratings: 3.5
  }
} */

/* db.products.update(
  { sku: "abc123" },
  { $inc: { quantity: -2, "metrics.orders": 1 } }
)
 */
