/*jshint esversion: 6 */
var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Medico = require('../models/medico');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

app.get('/', (req, res, next) => {

    Medico.find({}, 'nombre img usuario hospital').exec(
        (err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar medicos.',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medicos: medicos
            });

        });


});


// Crear nuevo Medico.
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital_id
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico.',
                errors: err
            });
        }

        /* usuariotoken es el usuario que realizó la operación de alta de medico */
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });
    });
});

// Actualizar un Medico 
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico.',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra medico con el id ' + id + '.',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital_id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico con el id ' + id + '.',
                    errors: err
                });
            }

            medicoGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuariotoken: req.usuario
            });

        });

    });
});

// Eliminar medico por id
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuariotoken: req.usuario
        });
    });
});

module.exports = app;