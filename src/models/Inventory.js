const mongoose = require('mongoose')

const inventorySchema =
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

      shirtName: {
        type: String,
        required: true,
      },

      team: {
        type: String,
        required: true,
      },

      season: {
        type: String,
        required: true,
      },

      league: {
        type: String,
        required: true,
      },

      image: {
        type: String,
        required: true,
      },

      shirtNumber: {
        type: String,
        default: '',
        trim: true,
      },

      playerName: {
        type: String,
        default: '',
        trim: true,
      },

      size: {
        type: String,
        enum: [
          '',
          'XS',
          'S',
          'M',
          'L',
          'XL',
        ],
        default: '',
      },

      favorite: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  )

inventorySchema.index(
  {
    owner: 1,
    officialShirt: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model(
  'Inventory',
  inventorySchema
)
