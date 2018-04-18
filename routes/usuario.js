/*jshint esversion: 6 */
var express = require('express');

var app = express();

var Usuario = require('../models/usuario');

/* OJO: esta ruta se refiere a la raíz de la ruta 
        de donde viene principalmente, es decir, en este
        caso, esta raiz representa la idem de /usuario/
*/
// Obtener todos los usuarios
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role').exec(
        (err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar usuarios.',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });

        });


});

// Crear nuevo usuario.
app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
});

module.exports = app;