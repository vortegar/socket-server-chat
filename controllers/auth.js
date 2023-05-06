const { response, json } = require("express");
const bcryptjs = require('bcryptjs');

const Usuario = require("../models/usuario");

const { generarJWT } = require("../helpers/generar-jwt");
const { googleVerify } = require("../helpers/google-verify");

const login = async( req, res = response ) => {

    try {
    
        const { password, correo } = req.body;
        // Verificar si el usuario existe
        const usuario = await Usuario.findOne({ correo });
        if ( !usuario ) {
            return res.status(400).json({
                msg : 'Usuario / Pasword incorrecto - correo'
            });
        }

        // Verificar si el usuario está activo
        if ( !usuario.estado ) {
            return res.status(400).json({
                msg : 'Usuario / Pasword incorrecto - usuario : false'
            });        
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg : 'Usuario / Pasword incorrecto - contraseña'
            });        
        }

        // Generar JWT
        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token
        })
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mgs: 'Hable con el administrador'
        });
    }
}

const googleSignIn = async( req, res = response ) =>{

    const { id_token } = req.body;

    try {

        const { nombre, img, correo } = await googleVerify( id_token );

        let usuario = await Usuario.findOne({ correo });

        if( !usuario ){
            //Tengo que crear usuario
            const data = {
                nombre,
                correo,
                password: '123',
                img,
                google: true,
                rol : 'USER_ROL'
            };
            usuario = new Usuario( data );
            await usuario.save();
        }

        // El usuario de google esta bloqueado en DB
        if ( !usuario.estado ){
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            })
        }

        
        // Generar JWT
        const token = await generarJWT( usuario.id );


        res.json({
            usuario,
            token
            // msg: 'Todo Bien!',
            // id_token
        })

    } catch (error) {
        res.status(400).json({
            error,
            ok: false,
            msg: 'El Token no se puede verificar'
        })
    }
}

const renovarToken = async( req, res = response ) => {

    const { usuario } = req;
    const token = await generarJWT( usuario.id );

    res.json({
        usuario,
        token
    })
}

module.exports = {
    login,
    googleSignIn,
    renovarToken
}