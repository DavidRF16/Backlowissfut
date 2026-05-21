const OfficialShirt = require(
  '../models/OfficialShirt'
)

const Inventory = require(
  '../models/Inventory'
)

const Wishlist = require(
  '../models/Wishlist'
)

const uploadToCloudinary = require(
  '../utils/uploadToCloudinary'
)

const mongoose = require('mongoose')

const escapeRegex = (value) =>
  value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )

const exactText = (value) =>
  new RegExp(
    `^${escapeRegex(value)}$`,
    'i'
  )

const createOfficialShirt =
  async (req, res) => {
    try {
      const name =
        String(req.body.name || '').trim()
      const team =
        String(req.body.team || '').trim()
      const league =
        String(
          req.body.league || ''
        ).trim()
      const season =
        String(
          req.body.season || ''
        ).trim()
      if (
        !name ||
        !team ||
        !league ||
        !season ||
        !req.file
      ) {
        return res.status(400).json({
          message:
            'Faltan datos de la camiseta',
        })
      }

      const existing =
        await OfficialShirt.findOne({
          name: exactText(name),
          team: exactText(team),
          league: exactText(league),
          season: exactText(season),
        })

      if (existing) {
        return res.status(400).json({
          message:
            'Esta camiseta ya existe en el catalogo',
        })
      }

      let imageUrl = ''

      if (req.file) {
        const uploaded =
          await uploadToCloudinary(
            req.file,
            'official-shirts'
          )

        imageUrl =
          uploaded.secure_url
      }

      const shirt =
        await OfficialShirt.create({
          name,

          team,

          league,

          season,

          image: imageUrl,
        })

      res.status(201).json(shirt)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const getOfficialShirts =
  async (req, res) => {
    try {
      const shirts =
        await OfficialShirt.find().sort(
          {
            league: 1,
            team: 1,
            name: 1,
            season: 1,
          }
        )

      res.json(shirts)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const deleteOfficialShirt =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          message:
            'Camiseta no valida',
        })
      }

      const shirt =
        await OfficialShirt.findById(
          req.params.id
        )

      if (!shirt) {
        return res.status(404).json({
          message:
            'Camiseta no encontrada',
        })
      }

      await Inventory.deleteMany({
        officialShirt: shirt._id,
      })

      await Wishlist.deleteMany({
        officialShirt: shirt._id,
      })

      await shirt.deleteOne()

      res.json({
        message: 'Camiseta eliminada',
      })
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

module.exports = {
  createOfficialShirt,
  deleteOfficialShirt,
  getOfficialShirts,
}
