// Importar los módulos requeridos
const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuarios");
const { validationResult } = require("express-validator");
const { reset } = require("nodemon");

const year = new Date().getFullYear();

// Procesar el formulario de creación de cuenta
exports.crearCuenta = async (req, res, next) => {
  // Verificar que no existan errores de validación
  const errores = validationResult(req);
  const messages = [];
  // Obtener las variables desde el cuerpo de la petición
  const { nombre, email, password, tipo } = req.body;

  // Si hay errores
  if (!errores.isEmpty()) {
    // Utilizar la función map para navegar dentro de un arreglo
    errores
      .array()
      .map((error) =>
        messages.push({ message: error.msg, alertType: "danger" })
      );

    // Agregar los errores a nuestro mensajes flash
    req.flash("messages", messages);

    res.redirect("/");
  } else {
    // Intentar almacenar los datos del usuario
    try {
      // Crear el usuario
      // https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Promise
      // https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous/Async_await
      await Usuario.create({
        email,
        password,
        nombre,
        roles:[tipo]
      });

      // Mostrar un mensaje
      messages.push({
        message: "!Usuario creado satisfactoriamente!",
        alertType: "success",
      });
      req.flash("messages", messages);

      res.redirect("/");
    } catch (error) {
      messages.push({
        message: error,
        alertType: "danger",
      });
      req.flash("messages", messages);
      res.redirect("/");
    }
  }
};
