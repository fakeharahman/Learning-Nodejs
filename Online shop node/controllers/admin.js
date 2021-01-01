// const { response } = require("express");
const { validationResult } = require("express-validator/check");
// const Mongoose = require("mongoose");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isAuth) {
    res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  console.log(image);
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: "Invalid image",
      validationErrors: [],
      product: {
        title: title,
        description: description,
        price: price,
      },
    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: {
        title: title,
        description: description,
        price: price,
      },
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    // _id: new Mongoose.Types.ObjectId("5fad1392f4c03e3e30f4acd5"),
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
    .catch((err) => {
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   errorMessage: 'Error Occured, sorry! Please try again.',
      //   validationErrors: [],
      //   product: {
      //     title: title,
      //     description: description,
      //     price: price,
      //     imageUrl: imageUrl,
      //   },
      // });
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
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
        hasError: false,
        validationErrors: [],
        product: product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: {
        title: title,
        description: description,
        price: price,
        _id: id,
      },
    });
  }

  Product.findById(id)
    .then((prod) => {
      if (prod.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      prod.title = title;
      prod.price = price;
      if (image) {
        prod.imageUrl = image.path;
      }
      prod.description = description;
      return prod
        .save()
        .then((response) => {
          res.redirect("/admin/products");
          console.log("UPDATED PRODUCT");
        })
        .catch((err) => {
          const error = new Error(err);
          error.setStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  console.log(req.body.id);
  Product.deleteOne({ _id: req.body.id, userId: req.user._id }).then(() => {
    res.redirect("/admin/products");
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price')
    .populate("userId")
    .then((products) => {
      console.log(products.userId);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};
