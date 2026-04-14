import express from "express";
import {
  toggleFavorito,
  obtenerFavoritos,
  obtenerIdsFavoritos
} from "../controllers/favoritosController.js";

const router = express.Router();

router.post("/:id_propiedad/toggle",   toggleFavorito);
router.get("/cliente/:id_cliente",     obtenerFavoritos);
router.get("/cliente/:id_cliente/ids", obtenerIdsFavoritos);

export default router;