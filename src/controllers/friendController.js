const User = require('../models/User')

const FriendRequest = require(
  '../models/FriendRequest'
)

const Notification = require(
  '../models/Notification'
)

const mongoose = require('mongoose')

const sendFriendRequest =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            'Usuario no valido',
        })
      }

      if (
        req.params.id ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          message:
            'No puedes agregarte a ti mismo',
        })
      }

      const receiver =
        await User.findById(
          req.params.id
        )

      if (!receiver) {
        return res.status(404).json({
          message:
            'Usuario no encontrado',
        })
      }

      const existingRequest =
        await FriendRequest.findOne({
          $or: [
            {
              sender: req.user._id,
              receiver: receiver._id,
              status: 'pending',
            },
            {
              sender: receiver._id,
              receiver: req.user._id,
              status: 'pending',
            },
          ],
        })

      if (existingRequest) {
        return res.status(400).json({
          message:
            'Solicitud ya enviada',
        })
      }

      if (
        req.user.friends.some(
          (friendId) =>
            friendId.toString() ===
            receiver._id.toString()
        )
      ) {
        return res.status(400).json({
          message:
            'Ya sois amigos',
        })
      }

      const request =
        await FriendRequest.create({
          sender: req.user._id,
          receiver: receiver._id,
        })

      await Notification.create({
        user: receiver._id,
        text: `${req.user.username} te ha enviado una solicitud de amistad`,
        type: 'friend_request',
        friendRequest: request._id,
      })

      res.status(201).json(request)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const acceptFriendRequest =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            'Solicitud no valida',
        })
      }

      const request =
        await FriendRequest.findById(
          req.params.id
        )

      if (!request) {
        return res.status(404).json({
          message:
            'Solicitud no encontrada',
        })
      }

      if (
        request.receiver.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message: 'No autorizado',
        })
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          message:
            'Solicitud ya resuelta',
        })
      }

      request.status = 'accepted'

      await request.save()

      await Notification.updateMany(
        {
          friendRequest: request._id,
        },
        {
          read: true,
          type: 'info',
        }
      )

      await User.findByIdAndUpdate(
        request.sender,
        {
          $addToSet: {
            friends:
              request.receiver,
          },
        }
      )

      await User.findByIdAndUpdate(
        request.receiver,
        {
          $addToSet: {
            friends:
              request.sender,
          },
        }
      )

      await Notification.create({
        user: request.sender,
        text: `${req.user.username} ha aceptado tu solicitud de amistad`,
        type: 'friend_accepted',
      })

      res.json({
        message:
          'Amistad aceptada',
      })
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const rejectFriendRequest =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            'Solicitud no valida',
        })
      }

      const request =
        await FriendRequest.findById(
          req.params.id
        )

      if (!request) {
        return res.status(404).json({
          message:
            'Solicitud no encontrada',
        })
      }

      if (
        request.receiver.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message: 'No autorizado',
        })
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          message:
            'Solicitud ya resuelta',
        })
      }

      request.status = 'rejected'

      await request.save()

      await Notification.updateMany(
        {
          friendRequest: request._id,
        },
        {
          read: true,
          type: 'info',
        }
      )

      res.json({
        message:
          'Solicitud rechazada',
      })
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const getFriendRequests =
  async (req, res) => {
    try {
      const requests =
        await FriendRequest.find({
          receiver: req.user._id,
          status: 'pending',
        })
          .populate(
            'sender',
            'username profileImage'
          )
          .sort({
            createdAt: -1,
          })

      res.json(requests)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const getFriends =
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user._id
      ).populate(
        'friends',
        'username profileImage isPrivateInventory'
      )

      res.json(user.friends)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
}
