const { getDb } = require("../util/database");
const mongodb = require("mongodb");

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; //{items:[]}
    this._id = id;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
    // .then((res) => console.log(res))
    // .catch((err) => console.log(err));
  }
  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQty = 1;
    const cartItems = [...this.cart.items];
    console.log(cartProductIndex);
    if (cartProductIndex >= 0) {
      newQty = this.cart.items[cartProductIndex].qty + 1;
      cartItems[cartProductIndex].qty = newQty;
    } else {
      cartItems.push({
        productId: new mongodb.ObjectID(product._id),
        qty: newQty,
      });
    }

    const cart = { items: cartItems };
    return getDb()
      .collection("users")
      .updateOne({ _id: mongodb.ObjectID(this._id) }, { $set: { cart: cart } });
  }

  getCart() {
    const prodIds = this.cart.items.map((cp) => cp.productId);
    return getDb()
      .collection("products")
      .find({ _id: { $in: prodIds } })
      .toArray()
      .then((prods) => {
        return prods.map((p) => {
          return {
            ...p,
            qty: this.cart.items.find(
              (cp) => cp.productId.toString() === p._id.toString()
            ).qty,
          };
        });
      });
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: mongodb.ObjectID(id) })
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => console.log(err));
  }
}
module.exports = User;
