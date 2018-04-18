/*jshint esversion: 6 */
var express = require('express');

var app = express();

var Usuario = require('../models/usuario');

/* OJO: esta ruta se refiere a la raíz de la ruta 
        de donde viene principalmente, es decir, en este
        caso, esta raiz representa la idem de /usuario/
*/
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

module.exports = app;