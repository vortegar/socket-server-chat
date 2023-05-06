const { Router } = require("express");
const { check } = require("express-validator");

const { crearProducto,
        obtenerProductos,
        obtenerProducto,
        actualizarProducto,
        borrarProductos 
    } = require("../controllers/productos");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");
const {  existeProductoPorId } = require("../helpers/db-validators");




const router = Router();

router.get( '/', obtenerProductos );

router.get('/:id',[
    check('id').custom( existeProductoPorId ),
    check('id', 'No es un id de MongoDB').isMongoId(),
    validarCampos,
], obtenerProducto );

router.post( '/',[
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'No es un id de Mongo').isMongoId(),
    // check('categoria').custom( existeProductoPorId ),
    validarCampos
], crearProducto );

router.put('/:id',[
    validarJWT,
    check('id').custom( existeProductoPorId ),
    validarCampos,
], actualizarProducto );

router.delete('/:id',[
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de MongoDB').isMongoId(),
    check('id').custom( existeProductoPorId ),
    validarCampos
], borrarProductos );

module.exports = router;