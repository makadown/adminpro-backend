/*jshint esversion: 6 */
// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a la BD.
mongoose.connection
    .openUri('mongodb://localhost:27017/hospitalDB',
        (err, res) => {
            if (err) throw err;
            console.log('Base de datos \x1b[36m%s\x1b[0m', 'online');
        }
    );

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    //console.log('Servidor Express online corriendo en: \x1b[32m%s\x1b[0m', ' puerto 3000');
    console.log('Puerto 3000 Node/Express: \x1b[36m%s\x1b[0m', 'online');
});