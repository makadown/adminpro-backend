/*jshint esversion: 6 */
var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Hospital = require('../models/hospital');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

app.get('/', (req, res, next) => {

    Hospital.find({}, 'nombre img usuario').exec(
        (err, hospitales) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar hospitales.',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospitales: hospitales
            });

        });


});


// Crear nuevo Hospital.
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Hospital.',
                errors: err
            });
        }

        /* usuariotoken es el usuario que realizó la operación de alta de hospital */
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuariotoken: req.usuario
        });
    });
});

// Actualizar un hospital 
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Hospital.',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra hospital con el id ' + id + '.',
                errors: { message: 'No existe hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital con el id ' + id + '.',
                    errors: err
                });
            }

            hospitalGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                usuariotoken: req.usuario
            });

        });

    });
});

// Eliminar hospital por id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuariotoken: req.usuario
        });
    });
});

module.exports = app;