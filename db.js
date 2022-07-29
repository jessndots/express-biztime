/** Database setup for BizTime. */

const {Client} = require("pg");
const password = require("./password")
const DB_URI = (process.env.NODE_ENV === "test") ? "postgresql:///biztime_test": "postgresql:///biztime";
let db = new Client({connectionString: DB_URI});
db.password = password;
db.connect();

module.exports = db;
