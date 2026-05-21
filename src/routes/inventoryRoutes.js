const express = require('express')

const {
  createInventoryShirt,
  getMyInventory,
  getUserInventory,
  deleteInventoryShirt
} = require('../controllers/inventoryController')

const authMiddleware = require(
  '../middlewares/authMiddleware'
)

const router = express.Router()

router.post(
  '/',
  authMiddleware,
  createInventoryShirt
)

router.get(
  '/',
  authMiddleware,
  getMyInventory
)

router.get(
  '/user/:userId',
  authMiddleware,
  getUserInventory
)

router.delete(
  '/:id',
  authMiddleware,
  deleteInventoryShirt
)
module.exports = router
