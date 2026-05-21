const Message = require(
  '../models/Message'
)

const jwt = require('jsonwebtoken')

const User = require('../models/User')

const mongoose = require('mongoose')

const onlineUsers = new Map()

const addSocket = (userId, socketId) => {
  const sockets =
    onlineUsers.get(userId) || new Set()

  sockets.add(socketId)
  onlineUsers.set(userId, sockets)
}

const removeSocket = (userId, socketId) => {
  const sockets =
    onlineUsers.get(userId)

  if (!sockets) return

  sockets.delete(socketId)

  if (sockets.size === 0) {
    onlineUsers.delete(userId)
  }
}

const emitToUser = (
  io,
  userId,
  event,
  payload
) => {
  const sockets =
    onlineUsers.get(userId)

  if (!sockets) return

  sockets.forEach((socketId) => {
    io.to(socketId).emit(
      event,
      payload
    )
  })
}

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token

      if (!token) {
        return next(
          new Error('No autorizado')
        )
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      )

      const user = await User.findById(
        decoded.id
      ).select(
        '_id username isEmailVerified'
      )

      if (!user) {
        return next(
          new Error(
            'Usuario no encontrado'
          )
        )
      }

      if (user.isEmailVerified === false) {
        return next(
          new Error(
            'Necesitas verificar tu correo primero'
          )
        )
      }

      socket.userId =
        user._id.toString()
      socket.user = user

      next()
    } catch (error) {
      next(
        new Error('Token invalido')
      )
    }
  })

  io.on('connection', (socket) => {
    addSocket(
      socket.userId,
      socket.id
    )

    socket.on(
      'sendMessage',
      async (data) => {
        try {
          const receiver =
            data?.receiver
          const text =
            String(
              data?.text || ''
            ).trim()

          if (
            !receiver ||
            !text ||
            !mongoose.isValidObjectId(
              receiver
            )
          ) {
            socket.emit(
              'messageError',
              {
                message:
                  'Mensaje vacio',
              }
            )

            return
          }

          const sender =
            await User.findById(
              socket.userId
            ).select('friends')

          const canChat =
            sender?.friends.some(
              (friendId) =>
                friendId.toString() ===
                receiver.toString()
            )

          if (!canChat) {
            socket.emit(
              'messageError',
              {
                message:
                  'Solo puedes chatear con amigos',
              }
            )

            return
          }

          const message =
            await Message.create({
              sender:
                socket.userId,
              receiver,
              text,
            })

          const payload = {
            ...message.toObject(),
            sender:
              message.sender.toString(),
            receiver:
              message.receiver.toString(),
          }

          emitToUser(
            io,
            receiver.toString(),
            'newMessage',
            payload
          )

          socket.emit(
            'messageSent',
            payload
          )
        } catch (error) {
          socket.emit(
            'messageError',
            {
              message:
                'No se pudo enviar el mensaje',
            }
          )
        }
      }
    )

    socket.on(
      'deleteMessage',
      async (data) => {
        try {
          const messageId =
            data?.messageId

          if (
            !messageId ||
            !mongoose.isValidObjectId(
              messageId
            )
          ) {
            socket.emit(
              'messageError',
              {
                message:
                  'Mensaje no valido',
              }
            )

            return
          }

          const message =
            await Message.findById(
              messageId
            )

          if (!message) {
            socket.emit(
              'messageDeleted',
              {
                messageId,
              }
            )

            return
          }

          if (
            message.sender.toString() !==
            socket.userId
          ) {
            socket.emit(
              'messageError',
              {
                message:
                  'Solo puedes borrar tus mensajes',
              }
            )

            return
          }

          const receiver =
            message.receiver.toString()

          await message.deleteOne()

          const payload = {
            messageId:
              messageId.toString(),
          }

          emitToUser(
            io,
            receiver,
            'messageDeleted',
            payload
          )

          socket.emit(
            'messageDeleted',
            payload
          )
        } catch (error) {
          socket.emit(
            'messageError',
            {
              message:
                'No se pudo borrar el mensaje',
            }
          )
        }
      }
    )

    socket.on('disconnect', () => {
      removeSocket(
        socket.userId,
        socket.id
      )
    })
  })
}

module.exports = socketHandler
