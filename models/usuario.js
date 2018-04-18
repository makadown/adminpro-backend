var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es requerida'] },
    img: { type: String },
    role: { type: String, required: true, default: 'USER_ROLE' }
});

module.exports = mongoose.model('usuario', usuarioSchema);