const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        qty: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  console.log(this.cart);
  let newQty = 1;
  const cartItems = [...this.cart.items];
  console.log(cartProductIndex);
  if (cartProductIndex >= 0) {
    newQty = +this.cart.items[cartProductIndex].qty + 1;
    cartItems[cartProductIndex].qty = newQty;
  } else {
    cartItems.push({
      productId: product._id,
      qty: newQty,
    });
  }
  const cart = { items: cartItems };
  console.log(cart);
  this.cart=cart
  return this.save();
};

userSchema.methods.deleteFromCart=function(id){
    const updatedCart = this.cart.items.filter(
        (i) => i.productId.toString() !== id.toString()
      );
      this.cart.items=updatedCart;
      return this.save()
}

userSchema.methods.clearCart=function(){
    this.cart.items=[];
    return this.save();
}

module.exports = mongoose.model("User", userSchema);

// const { getDb } = require("../util/database");
// const mongodb = require("mongodb");

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; //{items:[]}
//     this._id = id;
//   }
//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//     // .then((res) => console.log(res))
//     // .catch((err) => console.log(err));
//   }
//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQty = 1;
//     const cartItems = [...this.cart.items];
//     console.log(cartProductIndex);
//     if (cartProductIndex >= 0) {
//       newQty = this.cart.items[cartProductIndex].qty + 1;
//       cartItems[cartProductIndex].qty = newQty;
//     } else {
//       cartItems.push({
//         productId: new mongodb.ObjectID(product._id),
//         qty: newQty,
//       });
//     }

//     const cart = { items: cartItems };
//     return getDb()
//       .collection("users")
//       .updateOne({ _id: mongodb.ObjectID(this._id) }, { $set: { cart: cart } });
//   }

//   getCart() {
//     const prodIds = this.cart.items.map((cp) => cp.productId);
//     return getDb()
//       .collection("products")
//       .find({ _id: { $in: prodIds } })
//       .toArray()
//       .then((prods) => {
//         return prods.map((p) => {
//           return {
//             ...p,
//             qty: this.cart.items.find(
//               (cp) => cp.productId.toString() === p._id.toString()
//             ).qty,
//           };
//         });
//       });
//   }

//   deleteFromCart(id) {
//     const updatedCart = this.cart.items.filter(
//       (i) => i.productId.toString() !== id.toString()
//     );
//     return getDb()
//       .collection("users")
//       .updateOne(
//         { _id: mongodb.ObjectID(this._id) },
//         { $set: { cart: { items: updatedCart } } }
//       );
//   }

//   addOrder(id) {
//     const db = getDb();
//    return this.getCart()
//       .then((p) => {
//         const order = {
//           items: p,
//           user: {
//             _id: new mongodb.ObjectID(this._id),
//             name: this.name,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then((res) => {
//         this.cart = { items: [] };
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: mongodb.ObjectID(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection("orders").find({'user._id': new mongodb.ObjectID(this._id)}).toArray();
//   }

//   static findById(id) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: mongodb.ObjectID(id) })
//       .then((user) => {
//         console.log(user);
//         return user;
//       })
//       .catch((err) => console.log(err));
//   }
// }
// module.exports = User;
