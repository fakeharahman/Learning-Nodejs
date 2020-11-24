const Product = require("../models/product");
const Order = require("../models/order");
// const { deleteProduct } = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuth: req.session.isAuth

      });
    })
    .catch((err) => console.log(err));
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
        isAuth: req.session.isAuth

      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuth: req.session.isAuth

      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  console.log(req.session.user);
  req.session.user
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
        isAuth: req.session.isAuth

        // });
      });
    })
    .catch((err) => console.log(err));
};
exports.postCart = (req, res, next) => {
  const user = req.session.user;
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
  req.session.user
    .deleteFromCart(id)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.session.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { qty: i.qty, product: {...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.session.user.name,
          userId: req.session.user,
        },
        products: products,
      });
      return order.save();
    })

.then(()=>{
  return req.session.user.clearCart();
})

    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.session.user._id})
    .then((orders) => {
      // console.log(order);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuth: req.session.isAuth

      });
    })
    .catch((err) => console.log(err));
};
