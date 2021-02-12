// Importar los módulos requeridos
const express = require("express");
const usuarioController = require("../controllers/usuarioController");
const authController = require("../controllers/authController");
const homeController = require("../controllers/HomeController");
const { check } = require("express-validator");
const { json } = require("express");
const passport = require("passport");
const agencia = require("./agencia");
const Agencias = require("../models/Agencias");
const mongoose = require("mongoose");
const Agencia = mongoose.model("Agencias");
const Carrito = mongoose.model("Cliente");
// Configura y mantiene todos los endpoints en el servidor
const router = express.Router();

module.exports = () => {
// Rutas disponibles
router.get("/", async (req, res, next) =>  {
  if(req.user != undefined || req.isAuthenticated()){
    if(req.user.roles.includes('cliente')){
      res.redirect("/inicio");
    }
    if(req.user.roles.includes('agencia')){
      res.redirect("/agencias");
    }
    
    
  }else{
    let agencias = await Agencias.find().lean();
    res.render("inicio", {
      title: "HAZ",
      layout: "landingpage",
      agencias,
      login:false
    });
  }
  
});

router.get("/inicio", async (req,res,next)=>{
  let agencias;
  let carritoItems;
  let tipo = "";
  if(req.user != null){
    tipo = req.user.roles;
  }
  let pagActual = 'Inicio';
  let login = false;
  if(req.user != undefined){
    login=true;
     agencias = await Agencias.find().lean();
      carritoItems = await Carrito.findOne({userId:req.user._id}).lean();
  }
  
  res.render("cliente/inicio", {
    title: "HAZ",
    layout: "frontend",
    login,
    agencias,
    tipo,
    cantidad: carritoItems ? carritoItems.detalleCarrito.length : 0,
    pagActual,
    year: new Date().getFullYear(),
  });
});

router.get("/agencias", (req,res,next)=>{
  if(req.user){
    if(req.user.roles.includes('agencia')){
      let tipo = "";
    let rutaBase = "agencias/"
    if(req.user != null){
      tipo = req.user.roles;
    }
    let pagActual = 'Inicio';
    let login = false;
    if(req.user != undefined){login=true}
    res.render("administracion/agencias/inicio", {
      title: "HAZ - Administracion Agencias",
      layout: "admin",
      login,
      tipo,
      rutaBase,
      pagActual,
      year: new Date().getFullYear(),
    });
    }else{
      res.redirect("/")
    }
  }else{
    res.redirect("/")
  }
});


router.get("/cerrar-sesion",authController.cerrarSesion)

router.post(
  "/crear-cuenta",
  [
    // Realizar una verificación de los atributos del formulario
    // https://express-validator.github.io/docs/index.html
    check("nombre", "Debes ingresar tu nombre completo.")
      .not()
      .isEmpty()
      .escape(),
    check("email", "Debes ingresar un correo electrónico.").not().isEmpty(),
    check("email", "El correo electrónico ingresado no es válido.")
      .isEmail()
      .normalizeEmail(),
    check("password", "Debes ingresar una contraseña").not().isEmpty(),
  ],
  usuarioController.crearCuenta
);

router.post("/iniciar-sesion", authController.autenticarUsuario);

router.get("/olvide-password", authController.formularioRestablecerPassword);

router.post("/olvide-password", authController.enviarToken);

router.get("/olvide-password/:token", authController.formularioNuevoPassword);

router.post("/olvide-password/:token", authController.almacenarNuevaPassword);

// items de la agencia
router.get("/:agencia",homeController.itemsAgencia);




return router;
};

