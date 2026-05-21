const express = require('express')

const {
  getMessages,
} = require('../controllers/messageController')

const authMiddleware = require(
  '../middlewares/authMiddleware'
)

const router = express.Router()

router.get(
  '/:userId',
  authMiddleware,
  getMessages
)

module.exports = router