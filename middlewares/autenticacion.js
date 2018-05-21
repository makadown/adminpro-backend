var jwt = require('jsonwebtoken');
var semilla = require('../config/config').SEED;

/* Verificar Token */
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, semilla, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });
};

/* Verificar Admin */
exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es admin.',
            errors: { message: 'No es administrador, no puede hacer eso.' }
        });
    }
};

/* Verificar Admin o mismo usuario */
exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es admin ni mismo user.',
            errors: { message: 'No es administrador ni mismo user, no puede hacer eso.' }
        });
    }
};