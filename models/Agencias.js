// Importar los módulos requeridos
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");
const slug = require("slug");

const agenciaSchema = new mongoose.Schema({
    nombre: String,
    descripcion: String,
    direccion: String,
    latitud: String,
    longitud: String,
    cargo_tramite: Number,
    costo_tramite: Number,
    imagen_url: String,
    fechaRegistro: Date,
    fechaActualizado: Date,
    url: {
        type: String,
        lowercase: true,
      },
    userId:{ 
       type: mongoose.Schema.ObjectId,
       ref: "Usuario",
       required: true,
    },
    items: [{
        nombre: String,
        descripcion: String,
        precio: Number,
        agencia_id: { 
            type: mongoose.Schema.ObjectId,
            ref: "Agencias",
            required: true,
         },
        estado: String,
        url: {
            type: String,
            lowercase: true,
          }, 
        imgurl: String,
    }],
    tramites: [{
                fecha: Date,
                usuarioId: String,
                metodoPago: String,
                deliveryType: Number,
                EncargadoId: { 
                    type: mongoose.Schema.ObjectId,
                    ref: "Usuario",
                    required: true,
                 },
                estado: Number,
                Total: Number,
                detalles: [{
                    tramiteId: { 
                        type: mongoose.Schema.ObjectId,
                        ref: "Tramite",
                        required: true,
                     },
                    itemId: { 
                        type: mongoose.Schema.ObjectId,
                        ref: "Item",
                        required: true,
                     },
                    cantidad: Number,    
                }],
    }],
});

// Hooks para generar la URL de la Agencia
   agenciaSchema.pre("save", function (next) {
    // Crear la URL
    const url = slug(this.nombre);
    this.url = `${url}-${shortid.generate()}`;
    const fecha = Date.now();
    this.fechaRegistro = fecha;
    next();
  });
  
  // Hooks para generar la URL de la Agencia
   agenciaSchema.pre("updateOne", function (next) {
    // Crear la URL
    if(this._update.nombre != undefined){
      const url = slug(this._update.nombre);
      this._update.url = `${url}-${shortid.generate()}`;
      const fecha = Date.now();
      this._update.fechaActualizado = fecha;
    }
    if(this._update.$push != undefined){
      const url = slug(this._update.$push.items.nombre);
      this._update.$push.items.url = `${url}-${shortid.generate()}`;
      this._update.$push.items.estado = 1;
    }
    
    if(this._update.$set != undefined){
      let data = this._update.$set;
      const url = slug(data["items.$"].nombre);
      data["items.$"].url = `${url}-${shortid.generate()}`;
      data["items.$"].estado = 1;
    }
    
    
    next();
  });

  // Generar un índice para mejorar la búsqueda por el nombre del producto
    agenciaSchema.index({ nombre: "text" });

module.exports = mongoose.model("Agencias", agenciaSchema);