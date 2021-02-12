// Importar los módulos requeridos
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const carritoShemaShema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.ObjectId,
        ref: "Usuario",
        required: true,},
    detalleCarrito:[{
        itemId: { 
            type: mongoose.Schema.ObjectId,
            ref: "Item",
            required: true,},
        cantidad: Number,
        fechaIngreso: Date,
        lastUpdate: Date,
    }]
});

module.exports = mongoose.model("Cliente", carritoShemaShema);