const mongoose = require('mongoose')

const wishlistSchema =
  new mongoose.Schema(
    {
      owner: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      officialShirt: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'OfficialShirt',
        required: true,
      },

      shirtName: String,

      team: String,

      season: String,

      league: String,

      image: String,
    },
    {
      timestamps: true,
    }
  )

wishlistSchema.index(
  {
    owner: 1,
    officialShirt: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model(
  'Wishlist',
  wishlistSchema
)
