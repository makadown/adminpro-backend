/*jshint esversion: 6 */
var express = require('express');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla.toUpperCase()) {
        case "USUARIOS":
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case "MEDICOS":
            promesa = buscarMedicos(busqueda, regex);
            break;
        case "HOSPITALES":
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Forma de búsqueda no permitida. Sólo puede ser por usuarios, medicos u hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
    /*
        if (tabla.toUpperCase() === "HOSPITAL") {

            buscarHospitales(busqueda, regex).then((err, hospitales) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
            });

        } else if (tabla.toUpperCase() === "MEDICO") {
            buscarMedicos(busqueda, regex).then((err, medicos) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });
            });
        } else if (tabla.toUpperCase() === "USUARIO") {

        } else {
            res.status(405).json({
                ok: false,
                mensaje: "Forma de búsqueda no permitida"
            });
        }*/

});

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec(
                (err, hospitales) => {

                    if (err) {
                        reject('Error al cargar hospitales.');
                    } else {
                        resolve(hospitales);
                    }

                });

    });

}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec(
                (err, medicos) => {

                    if (err) {
                        reject('Error al cargar medicos.');
                    } else {
                        resolve(medicos);
                    }

                });

    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email').or([
            { 'nombre': regex },
            { 'email': regex }
        ]).exec((err, usuarios) => {
            if (err) {
                reject('Error al cargar usuarios');
            } else {
                resolve(usuarios);
            }
        });
    });
}

module.exports = app;