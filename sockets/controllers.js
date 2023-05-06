const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const socketsController = async( socket = new Socket(), io  ) => {

    const token = socket.handshake.headers['x-token'];
    const usuario =  await comprobarJWT( token );
    if( !usuario ){
        return socket.disconnect();
    }
    
    // Agregar el usuario conectado
    chatMensajes.conectarUsuario( usuario );
    io.emit('usuarios-activos', chatMensajes.usuariosArr );
    socket.emit('recibir-mensajes', chatMensajes.ultimos10 );

    // Conectarlo a una sala especial
    socket.join( usuario.id ) // global, socket.id , usuario.id
    
    // Limpiar cuando alquien se desconecta
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario( usuario.id );
        io.emit('usuarios-activos', chatMensajes.usuariosArr );
    })

    socket.on('enviar-mensaje', ({ uid, mensaje }) => {
        
        if( uid ){
            //Mensaje Privado
            socket.io( uid ).emit( 'mensajes-privados', { de: usuario.nombre, mensaje } )
        }else{
            chatMensajes.enviarMensaje( usuario.id, usuario.nombre, mensaje );
            io.emit('recibir-mensajes', chatMensajes.ultimos10 );
        }
    })
}



module.exports = {
    socketsController,
}