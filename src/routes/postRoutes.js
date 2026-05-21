const express = require('express')
const upload = require(
  '../middlewares/uploadMiddleware'
)
const {
  createPost,
  createComment,
  deleteComment,
  deletePost,
  getPosts,
  likePost,
} = require('../controllers/postController')

const authMiddleware = require(
  '../middlewares/authMiddleware'
)

const router = express.Router()

router.get('/', getPosts)

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  createPost
)
router.put(
  '/like/:id',
  authMiddleware,
  likePost
)

router.post(
  '/:id/comments',
  authMiddleware,
  createComment
)

router.delete(
  '/comments/:commentId',
  authMiddleware,
  deleteComment
)

router.delete(
  '/:id',
  authMiddleware,
  deletePost
)

module.exports = router
