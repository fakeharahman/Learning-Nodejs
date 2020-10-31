const getDb = require("../util/database").getDb;
const mongodb=require("mongodb")

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then(prods=>{
        console.log(prods);
        return prods;
      })
      .catch((err) => console.log(err));
  }
  static findById(prodId){
    const db = getDb();
    return db
      .collection("products")
      .find({_id: new mongodb.ObjectID( prodId)})
      .next()
      .then(prod=>{
        console.log(prod);
        return prod;
      })
      .catch((err) => console.log(err));
  }
  
}

module.exports = Product;
