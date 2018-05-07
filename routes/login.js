/*jshint esversion: 6 */
var express = require('express');
var bcrypt = require('bcryptjs');

/* https://github.com/auth0/node-jsonwebtoken */
var jwt = require('jsonwebtoken');
var semilla = require('../config/config').SEED;

// google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var app = express();
var Usuario = require('../models/usuario');


/* Autenticación de google */
async function verify(token) {

    //el await es una promesa
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    const token = req.body.token;

    //console.log('Token recibido ', token);

    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email },
        (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuarios.',
                    errors: err
                });
            }

            if (usuarioDB) {
                if (usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticación normal.'
                    });
                } else {
                    // crear token
                    var token = jwt.sign({ usuario: usuarioDB },
                        semilla, { expiresIn: 14400 } /*4 horas*/
                    );

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                }
            } else {
                // El usuario no existe y hay que crearlo   
                var usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.password = '=)';
                usuario.google = googleUser.google;

                usuario.save((err, usuarioDB) => {
                    // crear token
                    var token = jwt.sign({ usuario: usuarioDB },
                        semilla, { expiresIn: 14400 } /*4 horas*/
                    );

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                });
            }
        });

    /*
    res.status(200).json({
        ok: true,
        mensaje: 'Ok!',
        googleUser: googleUser
    });
    */
});

/* Autenticación normal */
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
                semilla, { expiresIn: 14400 } /*4 horas*/
            );

            res.status(200).json({
                ok: true,
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id
            });

            /* Se puede probar el token en https://jwt.io/  y en la firma poner
               en la clave el valor de la semilla */
        });
});


module.exports = app;