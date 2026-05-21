const jwt = require('jsonwebtoken')

const User = require('../models/User')

const authMiddleware = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        message: 'No autorizado',
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'No autorizado',
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    const user = await User.findById(
      decoded.id
    ).select(
      '-password -emailVerificationToken -emailVerificationExpires'
    )

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no encontrado',
      })
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        message:
          'Necesitas verificar tu correo primero',
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido',
    })
  }
}

module.exports = authMiddleware
