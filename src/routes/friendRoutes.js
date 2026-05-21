const express = require('express')

const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
} = require('../controllers/friendController')

const authMiddleware = require(
  '../middlewares/authMiddleware'
)

const router = express.Router()

router.get(
  '/',
  authMiddleware,
  getFriends
)

router.get(
  '/requests',
  authMiddleware,
  getFriendRequests
)

router.post(
  '/request/:id',
  authMiddleware,
  sendFriendRequest
)

router.put(
  '/accept/:id',
  authMiddleware,
  acceptFriendRequest
)

router.put(
  '/reject/:id',
  authMiddleware,
  rejectFriendRequest
)

module.exports = router
