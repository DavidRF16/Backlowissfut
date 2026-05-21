const express = require('express')

const {
  createOfficialShirt,
  deleteOfficialShirt,
  getOfficialShirts,
} = require('../controllers/officialShirtController')

const authMiddleware = require(
  '../middlewares/authMiddleware'
)

const adminMiddleware = require(
  '../middlewares/adminMiddleware'
)

const upload = require(
  '../middlewares/uploadMiddleware'
)

const router = express.Router()

router.get(
  '/',
  getOfficialShirts
)

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  createOfficialShirt
)

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deleteOfficialShirt
)

module.exports = router
