const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const pdfkit = require("pdfkit");
// const { deleteProduct } = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.id;

  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  console.log(req.user);
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      // console.log(user.cart.items);
      const products = user.cart.items;
      // console.log(cart);
      // cart.getProducts().then((products) => {
      // console.log(req.session);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,

        // });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};
exports.postCart = (req, res, next) => {
  const user = req.user;
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((prod) => {
      return user.addToCart(prod);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postDeleteCartItem = (req, res, next) => {
  const id = req.body.id;
  req.user
    .deleteFromCart(id)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log(user);
      const products = user.cart.items.map((i) => {
        return { qty: i.qty, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })

    .then(() => {
      return req.user.clearCart();
    })

    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      // console.log(order);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("Order doesn't exist"));
      }
      console.log(order.user.userId + " " + req.user._id);
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/orders");
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      console.log(invoiceName);
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new pdfkit();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", { align: "center", underline: true });
      pdfDoc.text("------------------------------", { align: "center" });
      console.log(order);
      let tot = 0;
      order.products.forEach((prod) => {
        tot = tot + prod.product.price * prod.qty;
        pdfDoc.fontSize(22).text(
          prod.product.title + " - " + prod.qty + " x $" + prod.product.price
        );
      });
      pdfDoc.text("   ");
      pdfDoc.text("Total Price : $" + tot.toFixed(2));
      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(new Error(err));
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader(
      //   "Content-Disposition",
      //   'inline; filename="' + invoiceName + '"'
      // );
      // file.pipe(res);
    })
    .catch((err) => next(new Error(err)));
};
