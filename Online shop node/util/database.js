const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "14789632@A", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
