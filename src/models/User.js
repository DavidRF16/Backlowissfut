const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

const userSchema =
  new mongoose.Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },

      password: {
        type: String,
        required: true,
        minlength: 6,
      },

      profileImage: {
        type: String,
        default: '',
      },

      favoriteTeam: {
        type: String,
        default: '',
      },

      favoriteLeague: {
        type: String,
        default: '',
      },

      isPrivateInventory: {
        type: Boolean,
        default: false,
      },

      isEmailVerified: {
        type: Boolean,
        default: true,
      },

      emailVerificationToken: {
        type: String,
        default: '',
      },

      emailVerificationExpires: {
        type: Date,
      },

      friends: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],

      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  )

userSchema.pre(
  'save',
  async function () {
    if (
      !this.isModified(
        'password'
      )
    ) {
      return
    }

    const salt =
      await bcrypt.genSalt(10)

    this.password =
      await bcrypt.hash(
      this.password,
      salt
    )
  }
)

module.exports = mongoose.model(
  'User',
  userSchema
)
