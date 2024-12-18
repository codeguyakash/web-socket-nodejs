const mysql = require("mysql2/promise");
require("dotenv").config();

const connectDB = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    });
    return pool;
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    throw error;
  }
};
module.exports = connectDB;