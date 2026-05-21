const express = require('express')

const {
  checkAvailability,
  register,
  login,
  verifyEmail,
} = require('../controllers/authController')

const router = express.Router()

router.get(
  '/availability',
  checkAvailability
)

router.post('/register', register)

router.post('/login', login)

router.post(
  '/verify-email',
  verifyEmail
)

module.exports = router
