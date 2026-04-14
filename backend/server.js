import express from "express";
import propiedadesRoutes from "./routes/propiedades.js";
import authRoutes from "./routes/authRoutes.js";
import favoritosRoutes from "./routes/favoritosRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://inmobiliaria-app-c64be.web.app"
}));
app.use(express.json());
app.use(express.static("public"));

app.use("/favoritos", favoritosRoutes);
app.use("/propiedades", propiedadesRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});