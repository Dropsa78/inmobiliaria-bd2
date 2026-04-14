import { pool } from "./config/db.js";

const testDB = async () => {
  try {
    console.log("Conectando a la base de datos...");

    const res = await pool.query("SELECT NOW()");

    console.log("Se coencto la DB // ");
    console.log(res.rows);

  } catch (error) {
    console.error("No se conecto error de credenciales");
    console.error(error);
  }
};

testDB();