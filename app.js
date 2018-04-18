/*jshint esversion: 6 */
// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');

// Conexión a la BD
mongoose.connection
    .openUri('mongodb://localhost:27017/hospitalDB',
        (err, res) => {
            if (err) throw err;
            console.log('Base de datos \x1b[36m%s\x1b[0m', 'online');
        }
    );

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    //console.log('Servidor Express online corriendo en: \x1b[32m%s\x1b[0m', ' puerto 3000');
    console.log('Puerto 3000 Node/Express: \x1b[36m%s\x1b[0m', 'online');
});