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
