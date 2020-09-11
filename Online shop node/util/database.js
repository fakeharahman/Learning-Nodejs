const mysql = require("mysql2");

const pool=mysql.createPool({
    host: "localhost",
    user: "root",
    database: "node-complete",
    password: "14789632@A"
})

module.exports= pool.promise();
