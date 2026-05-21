const Inventory = require(
  '../models/Inventory'
)

const OfficialShirt = require(
  '../models/OfficialShirt'
)

const User = require('../models/User')

const mongoose = require('mongoose')

const createInventoryShirt =
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
        await Inventory.findOne({
          owner: req.user._id,

          officialShirt:
            officialShirt._id,
        })

      if (existing) {
        return res.status(400).json({
          message:
            'Ya la tienes en inventario',
        })
      }

      const shirtNumber =
        String(
          req.body.shirtNumber || ''
        )
          .trim()
          .slice(0, 3)

      const playerName =
        String(
          req.body.playerName || ''
        )
          .trim()
          .slice(0, 60)

      const size =
        String(req.body.size || '')
          .trim()
          .toUpperCase()

      const validSizes = [
        '',
        'XS',
        'S',
        'M',
        'L',
        'XL',
      ]

      if (!validSizes.includes(size)) {
        return res.status(400).json({
          message:
            'Talla no valida',
        })
      }

      const shirt =
        await Inventory.create({
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

          shirtNumber,

          playerName,

          size,
        })

      res.status(201).json(shirt)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const getMyInventory =
  async (req, res) => {
    try {
      const shirts =
        await Inventory.find({
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

const getUserInventory =
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

      const owner = await User.findById(
        req.params.userId
      )

      if (!owner) {
        return res.status(404).json({
          message:
            'Usuario no encontrado',
        })
      }

      const isOwner =
        owner._id.toString() ===
        req.user._id.toString()

      if (
        owner.isPrivateInventory &&
        !isOwner
      ) {
        return res.status(403).json({
          message:
            'Inventario privado',
        })
      }

      const shirts =
        await Inventory.find({
          owner: owner._id,
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

const deleteInventoryShirt =
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
        await Inventory.findById(
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
          'Camiseta eliminada',
      })
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

module.exports = {
  createInventoryShirt,
  getMyInventory,
  getUserInventory,
  deleteInventoryShirt,
}
