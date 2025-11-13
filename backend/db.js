import mysql from "mysql2/promise";
export const pool = mysql.createPool({
  host: "shinkansen.proxy.rlwy.net",
  port: 45292,
  user: "root",
  password: "tu_contraseña_mysql",
  database: "railway",
  connectionLimit: 10,
});
