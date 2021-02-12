// Importar los módulos requeridos
const passport = require("passport");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Usuario = mongoose.model("Usuarios");
const enviarCorreo = require("../handlebars/email");
const { send } = require("process");

// Se encarga de autenticar el usuario y de redireccionarlo
exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
  failureFlash: true,
  badRequestMessage: ["Debes ingresar tus credenciales"],
});

// Cerrar la sesión del usuario
exports.cerrarSesion = (req, res, next) => {
  const messages = [];

  // Cierra la sesión
  req.logout();

  messages.push({
    message: "Has cerrado correctamente tu sesión. ¡Vuelve pronto!",
    alertType: "success",
  });

  req.flash("messages", messages);

  return res.redirect("/");
};

// Mostrar el formulario de restablecer la contraseña
exports.formularioRestablecerPassword = (req, res, next) => {
  let tipo = "";
  if (req.user != null) {
    tipo = req.user.roles;
  }
  res.render("autenticacion/restablecerPassword", {
    layout: "frontend",
    tipo,
    typePage: "register-page",
    signButtonValue: "/iniciar-sesion",
    signButtonText: "Iniciar sesión",
    year: new Date().getFullYear(),
  });
};

// Enviamos un token de autenticación al usuario para cambiar su
// contraseña. El token se envía al correo del usuario.
exports.enviarToken = async (req, res, next) => {
  // Obtener la direccción de correo electrónico
  const { email } = req.body;
  const messages = [];
  // Buscar el usuario
  try {
    const usuario = await Usuario.findOne({ email });

    // El usuario no existe
    if (!usuario) {
      messages.push({
        message:
          "¡No existe una cuenta registrado con este correo electrónico!",
        alertType: "danger",
      });

      req.flash("messages", messages);

      res.redirect("/olvide-password");
    }

    // El usuario existe, generar un token y una fecha de vencimiento
    usuario.token = crypto.randomBytes(20).toString("hex");
    usuario.expira = Date.now() + 3600000;
    // Guardar los cambios
    await usuario.save();
    // Generar la URL de restablecer contraseña
    const resetUrl = `http://${req.headers.host}/olvide-password/${usuario.token}`;
    try {
      // Enviar la notificación al correo electrónico del usuario
      const sendMail = await enviarCorreo.enviarCorreo({
        to: usuario.email,
        subject: "Restablece tu contraseña ",
        template: "resetPassword",
        nombre: usuario.nombre,
        resetUrl,
      });
    } catch (error) {
      console.log(error);
    }

    // Redireccionar al inicio de sesión
    messages.push({
      message: "¡Verifica tu bandeja de entrada y sigue las instrucciones!",
      alertType: "success",
    });

    req.flash("messages", messages);

    res.redirect("/olvide-password");
  } catch (error) {
    messages.push({
      message:
        "Ocurrió un error al momento de comunicarse con el servidor. Favor intentar nuevamente.",
      alertType: "danger",
    });

    req.flash("messages", messages);

    res.redirect("/olvide-password");
  }
};

// Mostrar el formulario de cambio de contraseña
exports.formularioNuevoPassword = async (req, res, next) => {

  const messages = [];
  // Buscar el usuario por medio del token que se envía como parámetro
  try {
    // Mongoose se encarge de verificar la validez del token
    // $gt -> mayor que
    const usuario = await Usuario.findOne({
      token: req.params.token,
      expira: { $gt: Date.now() },
    });

    // No se pudo encontrar el usuario o el token ha vencido
    if (!usuario) {
      messages.push({
        message:
          "Solicitud expirada. Vuelve a solicitar el cambio de contraseña.",
        alertType: "danger",
      });

      req.flash("messages", messages);

      res.redirect("olvide-password");
    }
    let tipo = "";
    if (req.user != null) {
      tipo = req.user.roles;
    }
    // Mostrar el formulario de nuevo password
    res.render("autenticacion/nuevoPassword", {
      layout: "frontend",
      tipo,
      year: new Date().getFullYear(),
    });
  } catch (error) {
    messages.push({
      message:
        "Ocurrió un error al momento de comunicarse con el servidor. Favor intentar nuevamente.",
      alertType: "danger",
    });

    req.flash("messages", messages);

    res.redirect("olvide-password");
  }
};

// Almacena la nueva contraseña del usuario
exports.almacenarNuevaPassword = async (req, res, next) => {
  const messages = [];

  try {
    // Buscar el usuario por medio del token y validar que aún no haya vencido
    const usuario = await Usuario.findOne({
      token: req.params.token,
      expira: { $gt: Date.now() },
    });

    // No se encontró el token o token vencido
    if (!usuario) {
      messages.push({
        message:
          "Solicitud expirada. Vuelve a solicitar el cambio de contraseña.",
        alertType: "danger",
      });

      req.flash("messages", messages);

      res.redirect("/olvide-password");
    }

    // Cambiar la contraseña
    usuario.password = req.body.password;

    // Eliminar los valores que ya no son útiles
    usuario.token = undefined;
    usuario.expira = undefined;

    await usuario.save();

    // Redireccionar
    messages.push({
      message: "¡Contraseña modificada correctamente!",
      alertType: "success",
    });
    req.flash("messages", messages);
    res.redirect("/");
  } catch (error) {
    messages.push({
      message:
        "Ocurrió un error al momento de comunicarse con el servidor. Favor intentar nuevamente.",
      alertType: "danger",
    });

    req.flash("messages", messages);

    res.redirect("/olvide-password");
  }
};

// Verifica que el usuario se encuentre autenticado
exports.verificarInicioSesion = (req, res, next) => {
  // Si el usuario se encuentra autenticado que siga con el siguiente middleware
  if (req.isAuthenticated()) return next();

  // Si no se auntenticó, redireccionar al inicio de sesión
  res.redirect("/");
};