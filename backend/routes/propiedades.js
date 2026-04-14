import express from "express";
import {
  crearPropiedad,
  actualizarPropiedad,
  eliminarPropiedad,
  obtenerPropiedades,
  obtenerImagen
} from "../controllers/propiedadesController.js";
import { upload } from "../services/multer.js";

const router = express.Router();

// ✅ Rutas específicas ANTES que rutas con parámetros (:id)
router.get("/", obtenerPropiedades);
router.get("/imagen/:id", obtenerImagen);        // ← movida arriba
router.put("/:id", upload.single("imagen"), actualizarPropiedad); // ← agregar upload
router.post("/", upload.single("imagen"), crearPropiedad);

router.delete("/:id", eliminarPropiedad);

export default router;