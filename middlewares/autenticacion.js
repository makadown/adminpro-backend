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