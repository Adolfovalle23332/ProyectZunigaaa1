// Importar los módulos requeridos
const express = require("express");
const agenciaController = require("../../controllers/AgenciaController");
const mongoose = require("mongoose");
const Agencia = mongoose.model("Agencias");

const { json } = require("express");
const passport = require("passport");
// Configura y mantiene todos los endpoints en el servidor
const router = express.Router();
const authController = require("../../controllers/authController");

module.exports = () => {

  router.use(async function (req, res, next) {
    const { check } = require("express-validator");
    if (req.user != null) {
      if (req.user.roles.includes("agencia") && true) {

       // Rutas disponibles
       router.get("/", (req, res, next) => {
         console.log("entro");
        res.send("Agencias No implementado!");
      });

        // Rutas disponibles
        router.get("/Items", (req, res, next) => {
          res.send("Agencias No implementado!");
        });

        // Ver todos los items
        router.get("/:id/items", agenciaController.vistaItems);

        // vista modificar item
        router.get("/:id/items/:url", agenciaController.vistaEditarItems);

        // Crear item
        router.post("/:id/items/nuevo/item", agenciaController.subirImagen,
          [
            check("nombre", "Debes ingresar el nombre del producto")
              .not()
              .isEmpty()
              .escape(),
            check("descripcion", "Debes ingresar la descripción del producto")
              .not()
              .isEmpty()
              .escape(),
            check("precio", "Debes ingresar el precio del producto")
              .not()
              .isEmpty()
              .escape(),
            check("precio", "Valor incorrecto en el precio del producto").isNumeric(),
          ],
          agenciaController.crearItem);

        //modificar item
        router.post("/:id/items/:url",agenciaController.subirImagen, agenciaController.EditarItems);


        // eliminar item
        router.post("/:agencia/items/:item/eliminarItem", async (req, res, next) => {
          
          await Agencia.updateOne({"items._id":req.params.item},{$pull:{"detalleCarrito.$._id":req.params.item}});
          res.redirect("/agencias/" + req.params.agencia + "/items");
        });


        // Rutas disponibles
        router.get("/escritorio", (req, res, next) => {
          let tipo = "";
          if (req.user != null) {
            tipo = req.user.roles;
          }
          let pagActual = 'Inicio';
          let login = false;
          if (req.user != undefined) { login = true }
          res.render("administracion/agencias/adminAgencias/escritorio", {
            title: "HAZ - Escritorio",
            layout: "admin",
            login,
            tipo,
            pagActual,
            rutaBase: "agencias/",
            year: new Date().getFullYear(),
          });
        });

        // Rutas disponibles
        router.get("/lista-agencias", async (req, res, next) => {
          let tipo = "";
          if (req.user != null) {
            tipo = req.user.roles;
          }
          let pagActual = 'Inicio';
          let login = false;
          if (req.user != undefined) { login = true }

          // Obtener todos los restaurantes disponibles
          const agencias = await Agencia.find({ userId: req.user._id }).lean();
          let rutaImg = `/public/uploads/items`;
          res.render("administracion/agencias/adminAgencias/agencias", {
            title: "HAZ - Administracion de agencias",
            layout: "admin",
            login,
            tipo,
            pagActual,
            agencias,
            rutaImg,
            rutaBase: "agencias/",
            year: new Date().getFullYear(),
          });
        });

        router.get("/:url", async (req, res, next) => {
          //obtener agencia por url
          const agencia = await Agencia.findOne({ url: req.params.url }).lean();
          let tipo = "";
          if (req.user != null) {
            tipo = req.user.roles;
          }
          let pagActual = 'Inicio';
          let login = false;
          if (req.user != undefined) { login = true }

          let rutaImg = `/uploads/items`;
          res.render("administracion/agencias/adminAgencias/editarAgencia", {
            title: "HAZ - Administracion de agencias",
            layout: "admin",
            login,
            tipo,
            pagActual,
            agencia,
            rutaImg,
            rutaBase: "agencias/",
            year: new Date().getFullYear(),
          });
        });

        router.post("/:id/:accion", async (req, res, next) => {
          const messages = [];
          if (req.params.accion == "eliminarAgencia") {
            const agencia = Agencia.findById(req.params.id);
            if(agencia){
              await agencia.deleteOne({ _id: req.params.id })
              messages.push({
                message: "Agencia eliminada correctamente!",
                alertType: "success",
              });
              req.flash("messages", messages);
            }else{
              console.log("Error al borrar restaurante");
            }
            res.redirect("/agencias/lista-agencias");
          }
        });

        
        router.post("/editar", AgenciaController.subirImagen,
          [
            check("nombre", "Debes ingresar el nombre de la Agencia")
              .not()
              .isEmpty()
              .escape(),
            check("descripcion", "Debes ingresar la descripción de la Agencia")
              .not()
              .isEmpty()
              .escape()
          ],
          agenciaController.editarAgencia);

        // Formulario nueva Agencia
        router.get("/nuevo", (req, res, next) => {
          let tipo = "";
          if (req.user != null) {
            tipo = req.user.roles;
          }
          let pagActual = 'Inicio';
          let login = false;
          if (req.user != undefined) { login = true }
          res.render("administracion/agencias/adminAgencias/CrearNuevo", {
            title: "HAZ - Administracion Items",
            layout: "admin",
            login,
            tipo,
            pagActual,
            rutaBase: "agencias/",
            year: new Date().getFullYear(),
          });
        });

        // Agregando nueva Agencia
        router.post("/nuevo",
          agenciaController.subirImagen,
          [
            check("nombre", "Debes ingresar el nombre de la Agencia")
              .not()
              .isEmpty()
              .escape(),
            check("descripcion", "Debes ingresar la descripción de la Agencia")
              .not()
              .isEmpty()
              .escape()
          ],
          agenciaController.crearAgencia
        );


      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
    next();
  });
  return router;
};