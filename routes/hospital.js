/*jshint esversion: 6 */
var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');

// =====================================
// 	 .
// =====================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe ',
                    errors: {
                        message: 'No existe un hospital con ese ID '
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    if (desde === -1) {

        Hospital.find({}).populate('usuario', 'nombre img email')
            .sort('nombre')
            .exec(
                (err, hospitales) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al cargar hospitales.',
                            errors: err
                        });
                    }

                    Hospital.count({}, (err, conteo) => {
                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });
                    });
                });

    } else {

        Hospital.find({})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre img email')
            .exec(
                (err, hospitales) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al cargar hospitales.',
                            errors: err
                        });
                    }

                    Hospital.count({}, (err, conteo) => {
                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });
                    });
                });

    }
});


// Crear nuevo Hospital.
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
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

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
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
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital con el id ' + id + '.',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
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
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;