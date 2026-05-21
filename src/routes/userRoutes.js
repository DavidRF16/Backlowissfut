const express = require('express')

const {
  getProfile,
  getUserProfile,
  updateProfileImage,
  updateInventoryPrivacy,
} = require('../controllers/userController')

const authMiddleware = require(
  '../middlewares/authMiddleware'
)

const upload = require(
  '../middlewares/uploadMiddleware'
)

const router = express.Router()

router.get(
  '/profile',
  authMiddleware,
  getProfile
)

router.put(
  '/profile/image',
  authMiddleware,
  upload.single('image'),
  updateProfileImage
)

router.put(
  '/profile/privacy',
  authMiddleware,
  updateInventoryPrivacy
)

router.get(
  '/profile/:userId',
  authMiddleware,
  getUserProfile
)

module.exports = router
