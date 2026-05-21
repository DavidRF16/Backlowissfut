const Post = require('../models/Post')
const Comment = require('../models/Comment')
const uploadToCloudinary = require(
  '../utils/uploadToCloudinary'
)

const mongoose = require('mongoose')

const populatePost = (query) =>
  query
    .populate(
      'user',
      'username profileImage'
    )
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'username profileImage',
      },
      options: {
        sort: {
          createdAt: 1,
        },
      },
    })

const createPost = async (req, res) => {
  try {
    const text =
      String(req.body.text || '').trim()

    if (!text && !req.file) {
      return res.status(400).json({
        message:
          'Escribe un texto o sube una imagen',
      })
    }

    let imageUrl = ''

    if (req.file) {
      const uploaded =
        await uploadToCloudinary(
          req.file,
          'posts'
        )

      imageUrl =
        uploaded.secure_url
    }

    const post = await Post.create({
      user: req.user._id,

      text,

      image: imageUrl,
    })

    const populatedPost =
      await populatePost(
        Post.findById(post._id)
      )

    res.status(201).json(populatedPost)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}
const getPosts = async (req, res) => {
  try {
    const posts = await populatePost(
      Post.find()
    ).sort({
        createdAt: -1,
      })

    res.json(posts)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}
const likePost = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          'Publicacion no valida',
      })
    }

    const post = await Post.findById(
      req.params.id
    )

    if (!post) {
      return res.status(404).json({
        message:
          'Publicacion no encontrada',
      })
    }

    const alreadyLiked =
      post.likes.some(
        (id) =>
          id.toString() ===
          req.user._id.toString()
      )

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) =>
          id.toString() !==
          req.user._id.toString()
      )
    } else {
      post.likes.push(req.user._id)
    }

    await post.save()

    const updatedPost =
      await populatePost(
        Post.findById(
          post._id
        )
      )

    res.json(updatedPost)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

const createComment = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          'Publicacion no valida',
      })
    }

    const text =
      String(req.body.text || '').trim()

    if (!text) {
      return res.status(400).json({
        message:
          'Escribe un comentario',
      })
    }

    if (text.length > 400) {
      return res.status(400).json({
        message:
          'Comentario demasiado largo',
      })
    }

    const post = await Post.findById(
      req.params.id
    )

    if (!post) {
      return res.status(404).json({
        message:
          'Publicacion no encontrada',
      })
    }

    const comment =
      await Comment.create({
        user: req.user._id,
        post: post._id,
        text,
      })

    post.comments.push(comment._id)
    await post.save()

    const updatedPost =
      await populatePost(
        Post.findById(post._id)
      )

    res.status(201).json(updatedPost)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

const deleteComment = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.commentId
      )
    ) {
      return res.status(400).json({
        message:
          'Comentario no valido',
      })
    }

    const comment =
      await Comment.findById(
        req.params.commentId
      )

    if (!comment) {
      return res.status(404).json({
        message:
          'Comentario no encontrado',
      })
    }

    const isOwner =
      comment.user.toString() ===
      req.user._id.toString()

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        message: 'No autorizado',
      })
    }

    await Post.findByIdAndUpdate(
      comment.post,
      {
        $pull: {
          comments: comment._id,
        },
      }
    )

    await comment.deleteOne()

    res.json({
      message: 'Comentario eliminado',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

const deletePost = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          'Publicacion no valida',
      })
    }

    const post = await Post.findById(
      req.params.id
    )

    if (!post) {
      return res.status(404).json({
        message:
          'Publicacion no encontrada',
      })
    }

    const isOwner =
      post.user.toString() ===
      req.user._id.toString()

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        message: 'No autorizado',
      })
    }

    await Comment.deleteMany({
      post: post._id,
    })

    await post.deleteOne()

    res.json({
      message: 'Publicacion eliminada',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  createPost,
  createComment,
  deleteComment,
  getPosts,
  likePost,
  deletePost,
}
