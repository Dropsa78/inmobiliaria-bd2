import express from "express";
import {
  registrarCliente,
  loginCliente,
  loginAgente
} from "../controllers/authController.js";

const router = express.Router();

router.post("/cliente/registro", registrarCliente);
router.post("/cliente/login",    loginCliente);
router.post("/agente/login",     loginAgente);

export default router;