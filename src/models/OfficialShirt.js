const mongoose = require('mongoose')

const officialShirtSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      team: {
        type: String,
        required: true,
      },

      league: {
        type: String,
        required: true,
      },

      season: {
        type: String,
        required: true,
      },

      image: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  )

module.exports = mongoose.model(
  'OfficialShirt',
  officialShirtSchema
)
