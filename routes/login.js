/*jshint esversion: 6 */
var express = require('express');
var bcrypt = require('bcryptjs');

/* https://github.com/auth0/node-jsonwebtoken */
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email },
        (err, usuarioDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuarios.',
                    errors: err
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - email' //quitarlo en produccion (email)
                });
            }

            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - password' //quitarlo en produccion (password)
                });
            }

            // para no mandar la contraseña real en el token
            usuarioDB.password = '=)';
            // crear token
            var token = jwt.sign({ usuario: usuarioDB },
                '@este-es@-un-seed-dificil', { expiresIn: 14400 } /*4 horas*/
            );

            res.status(200).json({
                ok: true,
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id
            });
        });
});


module.exports = app;