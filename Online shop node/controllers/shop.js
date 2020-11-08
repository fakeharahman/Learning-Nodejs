const Product = require("../models/product");
// const Cart = require("../models/cart");
// const { deleteProduct } = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
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
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      // console.log(cart);
      // cart.getProducts().then((products) => {
        res.render("shop/cart", {
          path: "/cart",
          pageTitle: "Your Cart",
          products: products,
        // });
      });
    })
    .catch((err) => console.log(err));
};
exports.postCart = (req, res, next) => {
  const user = req.user;
  const prodId = req.body.productId;
  Product.findById(prodId).then(prod=>{
    return user.addToCart(prod);
  }).then(result=>{
    console.log(result);
    res.redirect("/cart");
  })
  // let newQuantity = 1;
  // let fetchedCart;
  // user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((prods) => {
  //     let prod;
  //     if (prods.length !== 0) {
  //       prod = prods[0];
  //     }
  //     if (prod) {
  //       const oldqty = prod.cartItem.qty;
  //       newQuantity += oldqty;
  //       return prod;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then((prod) => {
  //     return fetchedCart.addProduct(prod, {
  //       through: { qty: newQuantity },
  //     });
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.postDeleteCartItem = (req, res, next) => {
  const id = req.body.id;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: id } });
    })
    .then((prods) => {
      const prod = prods[0];
      return prod.cartItem.destroy();
    })
    .then(() => {
    res.redirect("/cart");
  }).catch((err) => console.log(err));
 
};

exports.postOrder=(req, res, next)=>{
  let fetchedCart;
  req.user.getCart().then(cart=>{
    fetchedCart=cart;
    return cart.getProducts()
  })
  .then(prods=>{
    req.user.createOrder()
    .then(order=>{
     return order.addProducts(prods.map(prod=>{
        prod.orderItem={qty: prod.cartItem.qty}
        return prod;
      }))
    })
    .then((result)=>{
      return fetchedCart.setProducts(null)
    })
    .then(()=>{
      res.redirect('/orders')
    })
    .catch(err=>{
      console.log(err);
    })
    console.log(prods);
  })
  .catch(err=> console.log(err))
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']}).then(orders=>{
    // console.log(order);
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders
    });
  }).catch(err=>console.log(err));
 
};

