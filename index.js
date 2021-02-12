// Módulos requeridos para el funcionamiento del servidor
const mongoose = require("mongoose");
const express = require("express");
require("./config/db");
const exphbs = require("express-handlebars");
//rutas por carpetas y ruta principal
const router = require("./routes/index");
const clienteRoutes = require("./routes/cliente/index");
const agenciaRoutes = require("./routes/agencia/index");


const bodyParser = require("body-parser");
const path = require("path");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

// Ruta de las variables de entorno
require("dotenv").config({ path: ".env" });

// Crear un servidor utilizando express
const app = express();

// Habilitar Handlebars como nuestro template engine
app.engine("hbs", exphbs({ defaultLayout: "frontend", extname: ".hbs" }));

app.set("view engine", "hbs");

// Definir ruta para archivos estáticos.
app.use(express.static(path.join(__dirname, "/public")));

var hbs = exphbs.create({});

hbs.handlebars.registerHelper("ifCond", function(valor,parametro,options) {

    if(valor == parametro){
      return options.fn(this);
    }
    return options.inverse(this);
  });

hbs.handlebars.registerHelper("EachRol", function(valor,parametro,options) {

  if(valor.includes(parametro)){
    return options.fn(this);
  }
  return options.inverse(this);
});


// Crear la sesión de usuario y la cookie encargada de almacenarla
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
  
);

// Habilitar passport y la estrategia local
app.use(passport.initialize());
app.use(passport.session());

// Habilitar los mensajes flash
app.use(flash());

// Midleware personalizado para agregar mensajes flash
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});
app.use(express.json());
// Habilitar body-parser para obtener el cuerpo de la petición
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Implementar las rutas a utilizar
app.use("/", router());
app.use("/clientes", clienteRoutes());
app.use("/agencias", agenciaRoutes());


// Permitir que Heroku nos asigne un puerto disponible
const host = "0.0.0.0";
const port = process.env.PORT;

app.listen(port, host, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});

