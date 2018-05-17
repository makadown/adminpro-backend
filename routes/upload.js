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

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // 12312312312-123.png
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });


    });

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

                    // Si existe, elimina la imagen anterior
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo);
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
                            usuario: usuarioActualizado
                        });
                    });

                });
            break;
        case "MEDICOS":
            Medico.findById(id, (err, medico) => {

                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'medico no existe',
                        errors: { message: 'medico no existe' }
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
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
                        medico: medicoActualizado
                    });
                });
            });
            break;
        case "HOSPITALES":
            Hospital.findById(id,
                (err, hospital) => {
                    if (!hospital) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'hospital no existe',
                            errors: { message: 'hospital no existe' }
                        });
                    }

                    var pathViejo = './uploads/hospitales/' + hospital.img;

                    // Si existe, elimina la imagen anterior
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo);
                    }

                    hospital.img = nombreArchivo;

                    hospital.save((err, hospitalActualizado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al actualizar hospital',
                                error: err
                            });
                        } else {
                            return res.status(200).json({
                                ok: true,
                                mensaje: 'Imagen de hospital actualizada correctamente',
                                hospital: hospitalActualizado
                            });
                        }
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