import express from "express";
import propiedadesRoutes from "./routes/propiedades.js";
import authRoutes from "./routes/authRoutes.js";  // ← corregido
import { pool } from "./config/db.js";
import cors from "cors";
import favoritosRoutes from "./routes/favoritosRoutes.js";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/favoritos", favoritosRoutes);
app.use("/propiedades", propiedadesRoutes);
app.use("/auth", authRoutes);               // → /auth/cliente/login ✅
                                            // → /auth/cliente/registro ✅
                                            // → /auth/agente/login ✅

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});