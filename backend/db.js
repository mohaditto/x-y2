import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "mysql.railway.internal",
  port: 3306,
  user: "root",
  password: "hUxSgiYeIPcnlAOkCycSLDNceWItZeMC",
  database: "railway",
  connectionLimit: 10,
});
