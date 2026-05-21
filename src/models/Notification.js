const mongoose = require('mongoose')

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      text: {
        type: String,
      },

      type: {
        type: String,
        default: 'info',
      },

      friendRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
      },

      read: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  )

module.exports = mongoose.model(
  'Notification',
  notificationSchema
)
