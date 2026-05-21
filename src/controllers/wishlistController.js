const Wishlist = require(
  '../models/Wishlist'
)

const OfficialShirt = require(
  '../models/OfficialShirt'
)

const mongoose = require('mongoose')

const addWishlistShirt =
  async (req, res) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.body.officialShirtId
        )
      ) {
        return res.status(400).json({
          message:
            'Camiseta no valida',
        })
      }

      const officialShirt =
        await OfficialShirt.findById(
          req.body.officialShirtId
        )

      if (!officialShirt) {
        return res.status(404).json({
          message:
            'Camiseta no encontrada',
        })
      }

      const existing =
        await Wishlist.findOne({
          owner: req.user._id,

          officialShirt:
            officialShirt._id,
        })

      if (existing) {
        return res.status(400).json({
          message:
            'Ya está en wishlist',
        })
      }

      const shirt =
        await Wishlist.create({
          owner: req.user._id,

          officialShirt:
            officialShirt._id,

          shirtName:
            officialShirt.name,

          team:
            officialShirt.team,

          season:
            officialShirt.season,

          league:
            officialShirt.league,

          image:
            officialShirt.image,
        })

      res.status(201).json(shirt)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const getWishlist =
  async (req, res) => {
    try {
      const shirts =
        await Wishlist.find({
          owner: req.user._id,
        }).sort({
          league: 1,
          team: 1,
          shirtName: 1,
          season: 1,
        })

      res.json(shirts)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }
const deleteWishlistShirt =
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
        await Wishlist.findById(
          req.params.id
        )

      if (!shirt) {
        return res.status(404).json({
          message:
            'Camiseta no encontrada',
        })
      }

      if (
        shirt.owner.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            'No autorizado',
        })
      }

      await shirt.deleteOne()

      res.json({
        message:
          'Eliminada de wishlist',
      })
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }
module.exports = {
  addWishlistShirt,
  getWishlist,
  deleteWishlistShirt,
}
