const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "mediconnect",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
