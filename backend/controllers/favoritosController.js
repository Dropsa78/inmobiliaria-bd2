import { pool } from "../config/db.js";

// Agregar o quitar favorito (toggle)
export const toggleFavorito = async (req, res) => {
  try {
    const { id_propiedad } = req.params;
    const id_cliente = req.body.id_cliente;

    if (!id_cliente) {
      return res.status(400).json({ error: "id_cliente requerido" });
    }

    // Ver si ya existe
    const existe = await pool.query(
      "SELECT id FROM favoritos WHERE id_cliente=$1 AND id_propiedad=$2",
      [id_cliente, id_propiedad]
    );

    if (existe.rowCount > 0) {
      // Ya es favorito → quitar
      await pool.query(
        "DELETE FROM favoritos WHERE id_cliente=$1 AND id_propiedad=$2",
        [id_cliente, id_propiedad]
      );
      return res.json({ favorito: false, mensaje: "Eliminado de favoritos" });
    }

    // No es favorito → agregar
    await pool.query(
      "INSERT INTO favoritos (id_cliente, id_propiedad) VALUES ($1,$2)",
      [id_cliente, id_propiedad]
    );
    res.json({ favorito: true, mensaje: "Agregado a favoritos" });

  } catch (error) {
    console.error("Error toggleFavorito:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Obtener favoritos de un cliente
export const obtenerFavoritos = async (req, res) => {
  try {
    const { id_cliente } = req.params;

    const result = await pool.query(
      `SELECT p.id, p.titulo, p.descripcion, p.precio, p.tipo
       FROM favoritos f
       JOIN propiedades p ON f.id_propiedad = p.id
       WHERE f.id_cliente = $1
       ORDER BY f.fecha DESC`,
      [id_cliente]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error obtenerFavoritos:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Obtener IDs de favoritos de un cliente (para marcar corazones)
export const obtenerIdsFavoritos = async (req, res) => {
  try {
    const { id_cliente } = req.params;

    const result = await pool.query(
      "SELECT id_propiedad FROM favoritos WHERE id_cliente=$1",
      [id_cliente]
    );

    const ids = result.rows.map(r => r.id_propiedad);
    res.json(ids);

  } catch (error) {
    console.error("Error obtenerIdsFavoritos:", error.message);
    res.status(500).json({ error: error.message });
  }
};