// Importar los módulos requeridos
const express = require("express");
const agenciaController = require("../../controllers/AgenciaController");
const carritoController = require("../../controllers/ClienteController");
const mongoose = require("mongoose");
const Agencia = mongoose.model("Agencias");

const { json } = require("express");
const passport = require("passport");
// Configura y mantiene todos los endpoints en el servidor
const authController = require("../../controllers/authController");

// Configura y mantiene todos los endpoints en el servidor
const router = express.Router();

module.exports = () => {
  // Agregar producto al carrito
  router.get("/agregar-carrito/:agencia/:url", carritoController.agregarCarrito);

  //Ver carrito
  router.get("/carrito", carritoController.verCarrito);

  //sumar 1 platillo mas
  router.get("/agregaruno/:id", carritoController.agregarUno);

  //quitar un items
  router.post("/quitaruno/:id", carritoController.quitarUno);

  //crear orden
  router.post("/crear-orden", carritoController.crearOrden);

  return router;
};