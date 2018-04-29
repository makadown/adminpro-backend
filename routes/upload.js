/*jshint esversion: 6 */
var express = require('express');
var fs = require('fs');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
const fileUpload = require('express-fileupload');


// default options
app.use(fileUpload());

app.put('/:tabla/:id', function(req, res) {
    var tabla = req.params.tabla;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tabla) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Forma de upload no permitida. Sólo puede ser por usuarios, medicos u hospitales',
            error: { message: 'Tipo de tabla/coleccion no válido para subir archivo' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó archivo alguno',
            error: { message: 'Debe seleccionar una imagen' }
        });
    }

    // obtener nombre de archivo 
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    /* Sólo estas extensiones aceptamos */
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            error: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;
    /* Mover archivo del temporal al path (el Punto al principio es importante, OJO) */
    var path = `./uploads/${tabla}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }

        subirPorTipo(tabla, id, nombreArchivo, res);
        /*
                res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo movido correctamente',
                    nombreArchivo: nombreArchivo,
                    extension: extension
                });
                */
    });


    // });
});

function subirPorTipo(tabla, id, nombreArchivo, res) {

    switch (tabla.toUpperCase()) {
        case "USUARIOS":
            Usuario.findById(id,
                (err, usuario) => {

                    if (!usuario) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Usuario no existe',
                            errors: { message: 'Usuario no existe' }
                        });
                    }

                    var pathViejo = './uploads/usuarios/' + usuario.img;

                    // Si exite, elimina la imagen anterior
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo, err => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'Error al eliminar archivo',
                                    error: err
                                });
                            }
                        });
                    }

                    usuario.img = nombreArchivo;
                    usuario.save((err, usuarioActualizado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al actualizar usuario',
                                error: err
                            });
                        }
                        usuarioActualizado.password = ':)';
                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de usuario actualizada correctamente',
                            usuarioActualizado: usuarioActualizado
                        });
                    });

                });
            break;
        case "MEDICOS":
            Medico.findById(id,
                (err, medico) => {
                    if (!medico) {
                        return res.status(404).json({
                            ok: false,
                            mensaje: 'medico no existe',
                            errors: { message: 'medico no existe' }
                        });
                    }

                    var pathViejo = './uploads/medicos/' + medico.img;

                    // Si exite, elimina la imagen anterior
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo, err => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'Error al eliminar archivo',
                                    error: err
                                });
                            }
                        });
                    }

                    medico.img = nombreArchivo;
                    medico.save((err, medicoActualizado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al actualizar medico',
                                error: err
                            });
                        }
                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de medico actualizada correctamente',
                            medicoActualizado: medicoActualizado
                        });
                    });

                });
            break;
        case "HOSPITALES":
            Hospital.findById(id,
                (err, hospital) => {
                    if (!hospital) {
                        return res.status(404).json({
                            ok: false,
                            mensaje: 'hospital no existe',
                            errors: { message: 'hospital no existe' }
                        });
                    }

                    var pathViejo = './uploads/hospitales/' + hospital.img;

                    // Si exite, elimina la imagen anterior
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo, err => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'Error al eliminar archivo',
                                    error: err
                                });
                            }
                        });
                    }

                    hospital.img = nombreArchivo;
                    hospital.save((err, hospitalActualizado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al actualizar hospital',
                                error: err
                            });
                        }
                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de hospital actualizada correctamente',
                            hospitalActualizado: hospitalActualizado
                        });
                    });

                });
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Forma de búsqueda no permitida. Sólo puede ser por usuarios, medicos u hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });
    }
}

module.exports = app;