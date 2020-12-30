// const { response } = require("express");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((response) => {
      console.log("created Product!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.error(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.id;
  console.log(prodId, editMode);
  if (!editMode) {
    return res.redirect("/");
  }
  // Product.findByPk(prodId)
  Product.findById(prodId)
    .then((product) => {
      // const product=products;
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  Product.findById(id)
    .then((prod) => {
      prod.title = title;
      prod.price = price;
      prod.imageUrl = imageUrl;
      prod.description = description;
      return prod.save();
    })
    .then((response) => {
      res.redirect("/admin/products");
      console.log("UPDATED PRODUCT");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  console.log(req.body.id);
  Product.findByIdAndDelete(req.body.id).then(() => {
    res.redirect("/admin/products");
  });
};

exports.getProducts = (req, res, next) => {
  Product.find()
  // .select('title price')
  .populate('userId')
    .then((products) => {
      console.log(products.userId);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};
