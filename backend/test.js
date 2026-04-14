import fs from "fs";
import { subirImagen } from "./services/upload.js";
import { storage } from "../backend/config/firebase.js"
const test = async () => {
  const file = fs.readFileSync("./test.jpg");

  const fakeFile = {
    name: "test.jpg",
    type: "image/jpeg"
  };

  const blob = new Blob([file], { type: "image/jpeg" });

  blob.name = fakeFile.name;

  const url = await subirImagen(blob);

  console.log("Imagen subida:", url);
};

test();