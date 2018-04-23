/*jshint esversion: 6 */

// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

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
app.use('/login', loginRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    //console.log('Servidor Express online corriendo en: \x1b[32m%s\x1b[0m', ' puerto 3000');
    console.log('Puerto 3000 Node/Express: \x1b[36m%s\x1b[0m', 'online');
});