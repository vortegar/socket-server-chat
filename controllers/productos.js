const { response } = require("express");
const { Producto } = require("../models");


const obtenerProductos = async( req , res = response ) => {
    
    const { limite = 5, desde = 0 } = req.query;
    const estado = { estado : true }
    
    const [ total, productos ] = await Promise.all([
        Producto.countDocuments(estado),
        Producto.find(estado)
            .skip(Number(desde))
            .limit(Number(limite))
            .populate( 'usuario', 'nombre' )
            .populate( 'categoria', 'nombre' )
    ]);

    res.json({
        total,
        productos
     });
}

const obtenerProducto = async( req, res = response ) => {
    
    const { id } = req.params;
    const producto = await Producto.findById( id )
                            .populate('usuario', 'nombre')
                            .populate('categoria', 'nombre')
    res.json( producto );

}

const crearProducto = async( req, res = response ) => {
    
    const { estado, usuario, ...body } = req.body
    const nombre = body.nombre.toUpperCase();

    const productoDB = await Producto.findOne({ nombre });

    if( productoDB ) {
        return res.status(400).json({
            msg: `El producto ${ productoDB.nombre } ya existe`
        });
    }
    // Generar la data a guardar
    const data = {
        ...body,
        nombre,
        usuario: req.usuario._id,
    }

    const producto = await Producto( data );

    // Guardar DB
    await producto.save();

    res.status(201).json( producto );

}

const actualizarProducto = async( req, res = response ) => {
    
    const { id } = req.params;
    const { usuario, estado, ...data } = req.body;
    
    if ( data.nombre ) {
        data.nombre = data.nombre.toUpperCase();
    }
    data.usuario = req.usuario._id;
    
    const producto  = await Producto.findByIdAndUpdate( id, data, { new : true });
     

    res.json(producto);

}

const borrarProductos = async( req, res = response ) => {
    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate( id, { estado:false }, { new: true } );

    res.json({
        producto,
    })
}

module.exports = {
    actualizarProducto,
    borrarProductos,
    crearProducto,
    obtenerProducto,
    obtenerProductos
}