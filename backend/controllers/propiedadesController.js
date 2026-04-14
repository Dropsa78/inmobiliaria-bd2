import { pool } from "../config/db.js";
import { db } from "../config/firebase.js";
import { collection, addDoc } from "firebase/firestore";

export const crearPropiedad = async (req, res) => {
  try {
    const { titulo, descripcion, precio, tipo } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No hay imagen" });

    // ✅ Primero guardar en Firebase y obtener el ID
    const firebaseDoc = await addDoc(collection(db, "propiedades"), {
      titulo, descripcion, precio, tipo
    });

    // ✅ Guardar en PostgreSQL incluyendo firebase_id
    const result = await pool.query(
      "INSERT INTO propiedades (titulo, descripcion, precio, tipo, firebase_id) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [titulo, descripcion, precio, tipo, firebaseDoc.id]
    );

    const propiedadId = result.rows[0].id;

    await pool.query(
      "INSERT INTO imagenes (propiedad_id, imagen) VALUES ($1, $2)",
      [propiedadId, file.buffer]
    );

    res.json({ mensaje: "Propiedad creada correctamente", id: propiedadId });

  } catch (error) {
    console.error("Error crearPropiedad:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerPropiedades = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM propiedades ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener propiedades" });
  }
};

export const actualizarPropiedad = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, tipo } = req.body;
    const file = req.file;

    await client.query("BEGIN");

    // Actualizar datos
    await client.query(
      "UPDATE propiedades SET titulo=$1, descripcion=$2, precio=$3, tipo=$4 WHERE id=$5",
      [titulo, descripcion, precio, tipo, id]
    );

    // Actualizar imagen solo si se subió una nueva
    if (file) {
      const existe = await client.query(
        "SELECT id FROM imagenes WHERE propiedad_id = $1",
        [id]
      );

      if (existe.rowCount > 0) {
        await client.query(
          "UPDATE imagenes SET imagen=$1 WHERE propiedad_id=$2",
          [file.buffer, id]
        );
      } else {
        await client.query(
          "INSERT INTO imagenes (propiedad_id, imagen) VALUES ($1,$2)",
          [id, file.buffer]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ mensaje: "Propiedad actualizada" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error actualizarPropiedad:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

import { doc, deleteDoc } from "firebase/firestore";

export const eliminarPropiedad = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // Obtener firebase_id antes de borrar
    const prop = await client.query(
      "SELECT firebase_id FROM propiedades WHERE id = $1",
      [id]
    );

    if (prop.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    // Borrar imagen primero (FK)
    await client.query("DELETE FROM imagenes WHERE propiedad_id = $1", [id]);

    // Borrar propiedad
    await client.query("DELETE FROM propiedades WHERE id = $1", [id]);

    await client.query("COMMIT");

    // ✅ Borrar de Firebase solo si tiene firebase_id
    const firebaseId = prop.rows[0].firebase_id;
    if (firebaseId) {
      try {
        await deleteDoc(doc(db, "propiedades", firebaseId));
      } catch (fbError) {
        console.warn("Firebase no pudo borrar:", fbError.message);
        // No falla la respuesta — PostgreSQL ya fue borrado
      }
    }

    res.json({ mensaje: "Propiedad eliminada" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const obtenerImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT imagen FROM imagenes WHERE propiedad_id = $1 LIMIT 1",
      [id]
    );

    if (result.rows.length === 0 || !result.rows[0].imagen) {
      // ✅ Placeholder local, sin servicios externos
      res.setHeader("Content-Type", "image/svg+xml");
      return res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
        <rect width="300" height="200" fill="#e2e8f0"/>
        <text x="150" y="105" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#94a3b8">Sin imagen</text>
      </svg>`);
    }

    const img = result.rows[0].imagen;
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    // ✅ Conversión correcta del bytea de PostgreSQL
    res.end(Buffer.isBuffer(img) ? img : Buffer.from(img));

  } catch (error) {
    console.error("Error obtenerImagen:", error);
    res.status(500).end();
  }
};