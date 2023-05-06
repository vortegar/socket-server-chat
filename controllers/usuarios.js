const { response, request } = require('express');
const Usuario = require('../models/usuario');
const bcryptjs = require('bcryptjs');


const usuariosGet =  async( req = request, res = response ) => {
    // const query = req.query
    const { limite = 5, desde = 0 } = req.query;
    const estado = { estado : true }
    
    // const usuarios = await Usuario.find(estado)
    //     .skip(Number(desde))
    //     .limit(Number(limite));
    
    // const total = await Usuario.countDocuments(estado);
    
    const [ total, usuarios] = await Promise.all([
        Usuario.countDocuments(estado),
        Usuario.find(estado)
            .skip(Number(desde))
            .limit(Number(limite))
    ])

    res.json({
        total,
        usuarios
    })
};

const usuariosPost =  async( req, res = response ) => {

    const { nombre, correo, password, rol  } = req.body;
    const usuario = new Usuario({ nombre, password, rol, correo });

    // Verificar si el correo existe
    const existeEmail = await Usuario.findOne({ correo });
    if ( existeEmail ) {
        return res.status(400).json({
            msg: 'El correo ya se encuentra registrado'
        });
    }

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );

    // Guardar en BD
    await usuario.save();

    res.json({
        usuario
    })
};
const usuariosPut =  async( req, res = response ) => {
    const { id } = req.params;
    const { _id, password, google, correo, ...resto } = req.body;

    if ( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }

    const usuario = await Usuario.findByIdAndUpdate( id , resto );

    res.json(usuario)
};
const usuariosDelete =  async( req, res = response ) => {
    
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate( id, { estado:false }, { new: true } );
    // const usuarioAutenticado = req.usuario;
    // const uid = req.uid;


    res.json({
        usuario,
    })
};


module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosDelete
}