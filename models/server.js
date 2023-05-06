const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { createServer } = require('http');

const { dbContection } = require('../database/config');
const { socketsController } = require('../sockets/controllers');

class Server {

    constructor(){
    this.app    = express();
    this.port   = process.env.PORT;
    this.server = createServer( this.app );
    this.io     = require('socket.io')(this.server)
    


    this.paths = {
        auth       : '/api/auth',
        buscar     : '/api/buscar',
        categorias : '/api/categorias',
        productos  : '/api/productos',
        usuarios   : '/api/usuarios',
        uploads    : '/api/uploads'
    }
    // Conectar a base de datos
    this.conectarDB();
    
    // Middlewares
    this.middlewares();

    // Rutas de mi aplicación
    this.routes();

    // Sockets
    this.sockets();
    }

    async conectarDB()  {
        await dbContection();
    }

    middlewares() {
        //Cors
        this.app.use( cors() );

        //Lectura y paseo del body  
        this.app.use( express.json() );

        //Middleware
        this.app.use( express.static('public'));

        //Fileupload - Carga de archivos
        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));
    }

    routes() {
        this.app.use( this.paths.auth, require('../routes/auth'));
        this.app.use( this.paths.buscar, require('../routes/buscar'));
        this.app.use( this.paths.categorias, require('../routes/categorias'));
        this.app.use( this.paths.productos, require('../routes/productos'));
        this.app.use( this.paths.usuarios, require('../routes/usuarios'));
        this.app.use( this.paths.uploads, require('../routes/uploads'));
    }

    sockets(){
        this.io.on("connection", ( socket ) => socketsController( socket, this.io ) );
    }

    listen() {
        this.server.listen( this.port, () => {
            console.log(`Servidor corriendo en el puerto ${ this.port }`)
        });
     }
}

module.exports = Server