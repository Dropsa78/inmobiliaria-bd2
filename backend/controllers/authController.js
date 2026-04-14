import { pool } from "../config/db.js";
import { db } from "../config/firebase.js";
import { collection, addDoc } from "firebase/firestore";

const PASSWORD_AGENTE = "Gu7hs2ki1";

//////////////////////////////////////////////////
// REGISTRO CLIENTE
//////////////////////////////////////////////////
export const registrarCliente = async (req, res) => {
  try {
    const { nombre, correo, telefono } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ error: "Nombre y correo son obligatorios" });
    }

    // Verificar si ya existe
    const existe = await pool.query(
      "SELECT id_cliente FROM clientes WHERE correo = $1",
      [correo]
    );

    if (existe.rowCount > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // Guardar en PostgreSQL
    const result = await pool.query(
      "INSERT INTO clientes (nombre, correo, telefono) VALUES ($1, $2, $3) RETURNING *",
      [nombre, correo, telefono || null]
    );

    const cliente = result.rows[0];

    // Guardar en Firebase
    try {
      await addDoc(collection(db, "clientes"), {
        nombre,
        correo,
        telefono: telefono || null,
        fecha_registro: new Date().toISOString()
      });
    } catch (fbError) {
      console.warn("Firebase no pudo guardar cliente:", fbError.message);
    }

    // Guardar sesión
    res.json({
      mensaje: "Registro exitoso",
      cliente: {
        id: cliente.id_cliente,
        nombre: cliente.nombre,
        correo: cliente.correo,
        tipo: "cliente"
      }
    });

  } catch (error) {
    console.error("Error registrarCliente:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////
// LOGIN CLIENTE
//////////////////////////////////////////////////
export const loginCliente = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ error: "Correo requerido" });
    }

    const result = await pool.query(
      "SELECT * FROM clientes WHERE correo = $1",
      [correo]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cliente no encontrado. Regístrate primero." });
    }

    const cliente = result.rows[0];

    res.json({
      mensaje: "Login exitoso",
      cliente: {
        id: cliente.id_cliente,
        nombre: cliente.nombre,
        correo: cliente.correo,
        tipo: "cliente"
      }
    });

  } catch (error) {
    console.error("Error loginCliente:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////
// LOGIN AGENTE
//////////////////////////////////////////////////
export const loginAgente = async (req, res) => {
  try {
    const { password } = req.body;

    if (password !== PASSWORD_AGENTE) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login agente exitoso",
      tipo: "agente"
    });

  } catch (error) {
    console.error("Error loginAgente:", error.message);
    res.status(500).json({ error: error.message });
  }
};