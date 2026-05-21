const User = require('../models/User')

const Inventory = require(
  '../models/Inventory'
)

const Wishlist = require(
  '../models/Wishlist'
)

const mongoose = require('mongoose')

const uploadToCloudinary = require(
  '../utils/uploadToCloudinary'
)

const getProfileStats = async (userId) => {
  const user = await User.findById(
    userId
  ).select('friends')

  const inventory =
    await Inventory.find({
      owner: userId,
    })

  const wishlist =
    await Wishlist.find({
      owner: userId,
    })

  const totalShirts =
    inventory.length

  const totalWishlist =
    wishlist.length

  const teams = {}

  const leagues = {}

  inventory.forEach((shirt) => {
    teams[shirt.team] =
      (teams[shirt.team] || 0) + 1

    leagues[shirt.league] =
      (leagues[shirt.league] || 0) + 1
  })

  const favoriteTeam =
    Object.keys(teams).length
      ? Object.keys(teams).reduce(
          (a, b) =>
            teams[a] > teams[b]
              ? a
              : b
        )
      : 'Sin datos'

  const favoriteLeague =
    Object.keys(leagues).length
      ? Object.keys(leagues).reduce(
          (a, b) =>
            leagues[a] > leagues[b]
              ? a
              : b
        )
      : 'Sin datos'

  return {
    totalShirts,
    totalWishlist,
    friendsCount:
      user?.friends?.length || 0,
    favoriteTeam,
    favoriteLeague,
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select('-password')

    const stats =
      await getProfileStats(req.user._id)

    res.json({
      user,
      stats,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

const getUserProfile =
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

      const user = await User.findById(
        req.params.userId
      ).select(
        '-password -email -emailVerificationToken -emailVerificationExpires'
      )

      if (!user) {
        return res.status(404).json({
          message:
            'Usuario no encontrado',
        })
      }

      const isOwner =
        user._id.toString() ===
        req.user._id.toString()

      const canSeeInventory =
        isOwner ||
        !user.isPrivateInventory

      const stats =
        await getProfileStats(user._id)

      if (!canSeeInventory) {
        stats.totalShirts = 'Privado'
        stats.totalWishlist = 'Privado'
        stats.favoriteTeam = 'Privado'
        stats.favoriteLeague = 'Privado'
      }

      res.json({
        user,
        stats,
      })
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const updateProfileImage =
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            'No hay imagen',
        })
      }

      const uploaded =
        await uploadToCloudinary(
          req.file,
          'profiles'
        )

      const user =
        await User.findByIdAndUpdate(
          req.user._id,
          {
            profileImage:
              uploaded.secure_url,
          },
          {
            new: true,
          }
        ).select('-password')

      res.json(user)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

const updateInventoryPrivacy =
  async (req, res) => {
    try {
      const user =
        await User.findByIdAndUpdate(
          req.user._id,
          {
            isPrivateInventory:
              Boolean(
                req.body
                  .isPrivateInventory
              ),
          },
          {
            new: true,
          }
        ).select('-password')

      res.json(user)
    } catch (error) {
      res.status(500).json({
        message: error.message,
      })
    }
  }

module.exports = {
  getProfile,
  getUserProfile,
  updateProfileImage,
  updateInventoryPrivacy,
}
