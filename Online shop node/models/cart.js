const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static addProduct(id, prodPrice) {
    let cart = { products: [], totalPrice: 0 };
    fs.readFile(p, (err, data) => {
      if (!err) {
        cart = JSON.parse(data);
      }
      const existingProdIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProd = cart.products[existingProdIndex];
      let updatedProd;
      if (existingProd) {
        updatedProd = { ...existingProd };
        updatedProd.qty += 1;
        cart.products[existingProdIndex] = updatedProd;
      } else {
        updatedProd = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProd];
      }
      cart.totalPrice += +prodPrice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }
  static deleteProduct(id, price) {
    fs.readFile(p, (err, data) => {
      if (err) {
        return;
      }
      const newCart = { ...JSON.parse(data) };
      const prod = newCart.products.find((prod) => prod.id === id);
      if (prod) {
        console.log(prod);
        const qty = prod.qty;
        newCart.products = newCart.products.filter((prod) => prod.id !== id);
        newCart.totalPrice = newCart.totalPrice - qty * price;
        fs.writeFile(p, JSON.stringify(newCart), (err) => {});
      }
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, data) => {
      if (err) {
        return cb(null);
      }
      const cart = JSON.parse(data);
      cb(cart);
    });
  }
};
