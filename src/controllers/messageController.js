const Message = require(
  '../models/Message'
)

const mongoose = require('mongoose')

const isFriend = (user, friendId) =>
  user.friends.some(
    (id) =>
      id.toString() ===
      friendId.toString()
  )

const getMessages =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.userId
        )
      ) {
        return res.status(400).json({
          message:
            'Usuario no valido',
        })
      }

      if (
        !isFriend(
          req.user,
          req.params.userId
        )
      ) {
        return res.status(403).json({
          message:
            'Solo puedes chatear con amigos',
        })
      }

      const messages =
        await Message.find({
          $or: [
            {
              sender: req.user._id,
              receiver:
                req.params.userId,
            },

            {
              sender:
                req.params.userId,
              receiver: req.user._id,
            },
          ],
        }).sort({
          createdAt: 1,
        })

      res.json(
        messages.map((message) => ({
          ...message.toObject(),
          sender:
            message.sender.toString(),
          receiver:
            message.receiver.toString(),
        }))
      )
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

module.exports = {
  getMessages,
}
