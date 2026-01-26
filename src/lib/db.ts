import mysql from 'mysql2/promise';

// This utility connects your app to the database using your .env.local variables
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306, // Standard MySQL port for Domain.pk
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});