const fs = require("fs");
const path = require("path");
const { charAt } = require("../util/path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

const getProdsFromFile = (cb) => {
  return fs.readFile(p, (err, fileData) => {
    if (!err) {
      return cb(JSON.parse(fileData));
    }
    cb([]);
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  save() {
    getProdsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }
  static fetchAll(cb) {
    getProdsFromFile(cb);
  }
};
