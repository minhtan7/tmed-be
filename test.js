const moment = require("moment");
const faker = require("faker");
const fs = require("fs");
const Appointment = require("./models/Appointment");
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

const x = moment([2020, 2, 28]);
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

/* const l = JSON.stringify(now);
console.log("l", l);
const ll = JSON.stringify({ appdate: now });
console.log("ll", ll);
const lll = `${now}`;

const k = JSON.parse(l);
const kk = JSON.parse(ll);
console.log(moment(k.appDate).format());
console.log(moment(kk).format());
console.log(moment(lll).format()); */
/* ---------- */

const nownow = moment().format();
console.log(nownow);
/* const ob = { date: `${nownow}` };
console.log("ob", ob);
console.log(typeof ob.date);
console.log(ob.date.format());
 */

const ran = Math.floor(Math.random() * 10);

const today = moment();
console.log("today", today.format());
console.log(today.add(3, "date").format());
/* console.log((today + 3).format()); */
for (i = 0; i < 10; i++) {
  let dates = faker.date.between("2012", "2021");
  console.log(moment(dates).get("date"));
  /* console.log(faker.date.between("2015-01-01", "2015-01-05")); */
}

let sevenDaysAppointments = [];
const addApp = async () => {
  for (i = 0; i < 3; i++) {
    date = moment();
    const currentDay = date.add(i, "date");
    console.log("currentDay", currentDay);
    let appointment = await Appointment.find({ currentDay });
    sevenDaysAppointments.push(appointment);
  }
  console.log(sevenDaysAppointments);
};
let currentDay = moment();
console.log(currentDay);
for (i = 0; i < 3; i++) {
  currentDay = currentDay.add(i, "days");
  console.log(currentDay);
}

const xx = moment().format("YYYY-MM-DD");
console.log(typeof xx);
const yy = moment(xx);
console.log(yy);
console.log(faker.image.lorempixel.business());
