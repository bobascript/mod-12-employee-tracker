const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employees_db',
  },
  console.log(`Connected to the employee_db database.`)
);

module.exports = db;