const express = require('express')

const {
  addWishlistShirt,
  getWishlist,
  deleteWishlistShirt,
} = require('../controllers/wishlistController')

const authMiddleware = require(
  '../middlewares/authMiddleware'
)

const router = express.Router()

router.post(
  '/',
  authMiddleware,
  addWishlistShirt
)

router.get(
  '/',
  authMiddleware,
  getWishlist
)
router.delete(
  '/:id',
  authMiddleware,
  deleteWishlistShirt
)
module.exports = router