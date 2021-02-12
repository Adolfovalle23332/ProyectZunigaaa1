// Importar los módulos requeridos
const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuarios");
const Agencia = mongoose.model("Agencias");
const Carrito = mongoose.model("Cliente");
const { validationResult } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");

const year = new Date().getFullYear();

// Mostrar el formulario de creación de items
exports.itemsAgencia = async (req, res, next) => {
    let tipo = "";
    let agencia;
    let carritoItems;
    if(req.user != null){
      tipo = req.user.roles;
    }
    let pagActual = 'Inicio';
    let login = false;
    if(req.user != undefined){
      login=true;
       agencia = await Agencia.findOne({url: req.params.agencia}).lean();
       carritoItems = await Carrito.findOne({userId:req.user._id}).lean();
    }
     
    res.render("cliente/itemsAgencia", {
        title: "HAZ - Administracion Items",
        layout: "frontend",
        login,
        tipo,
        Agencia,
        cantidad: carritoItems ? carritoItems.detalleCarrito.length : 0,
        pagActual,
        rutaBase:"agencias/",
        year: new Date().getFullYear(),
    });
  };