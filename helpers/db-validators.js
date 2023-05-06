const { Categoria, Usuario, Producto } = require("../models");
const Role = require("../models/role");


const esRolValido = async( rol = '' ) => {
    const existeRol = await Role.findOne({ rol });
    if ( !existeRol ){
            throw new Error (`El rol ${ rol } no está registrado en la Base de datos`)
    }
}

const emailExiste = async ( correo = '' ) => {
    const existeEmail = await Usuario.findOne({ correo });
    if ( existeEmail ) {
        throw new Error (`El correo:  ${ correo } ya está registrado en la Base de datos`)
    }
}

const existeUsuarioPorId = async( id ) => {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        const existeUsuario = await Usuario.findById( id ).exec();
        if ( !existeUsuario ) {
            throw new Error(`El id ${ id } no existe`);
        }
    } else {
        throw new Error(`${ id } no es un ID válido`);
    }
};

const existeCategoriaPorId = async( id ) => {
    
    const existeCategoria = await Categoria.findById(id);
    if ( !existeCategoria ){
        throw new Error(`El id no existe ${id}`)
    }
}
;
const existeProductoPorId = async( id ) => {
    
    const existeProducto = await Producto.findById(id);
    if ( !existeProducto ){
        throw new Error(`El id no existe ${id}`)
    }
};

// Validar colecciones permitidas
const coleccionesPermitidas  = ( coleccion  = '', colecciones = [] ) => {

    const incluida = colecciones.includes( coleccion );
    if ( !incluida ) {
        throw new Error(`La colección ${ coleccion } no es permitida ${ colecciones }`)
    }
    return true;
}

module.exports = {
    coleccionesPermitidas,
    emailExiste,
    esRolValido,
    existeCategoriaPorId,
    existeProductoPorId,
    existeUsuarioPorId,
}