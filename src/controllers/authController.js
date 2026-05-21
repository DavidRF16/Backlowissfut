const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const {
  sendVerificationEmail,
} = require('../utils/email')

const createVerificationToken = () => {
  const token =
    crypto.randomBytes(32).toString('hex')

  return {
    token,
    hash: crypto
      .createHash('sha256')
      .update(token)
      .digest('hex'),
  }
}

const sanitizeUser = (user) => {
  const userResponse = user.toObject()
  delete userResponse.password
  delete userResponse.emailVerificationToken
  delete userResponse.emailVerificationExpires

  return userResponse
}

const register = async (req, res) => {
  try {
    const {
      password,
    } = req.body
    const username =
      String(
        req.body.username || ''
      ).trim()
    const email =
      String(req.body.email || '')
        .trim()
        .toLowerCase()

    if (
      username.length < 3 ||
      !email ||
      !password ||
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          'Datos de registro invalidos',
      })
    }

    const existingEmail =
      await User.findOne({
        email,
      })

    if (existingEmail) {
      return res.status(400).json({
        message:
          'Ese correo ya esta en uso',
      })
    }

    const existingUsername =
      await User.findOne({
        username,
      })

    if (existingUsername) {
      return res.status(400).json({
        message:
          'Ese usuario ya esta en uso',
      })
    }

    const verification =
      createVerificationToken()

    const user = await User.create({
      username,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken:
        verification.hash,
      emailVerificationExpires:
        Date.now() + 1000 * 60 * 60 * 24,
    })

    try {
      await sendVerificationEmail({
        email: user.email,
        username: user.username,
        token: verification.token,
      })
    } catch (error) {
      await user.deleteOne()

      return res.status(500).json({
        message: error.message,
      })
    }

    res.status(201).json({
      message:
        'Cuenta creada. Revisa tu correo para verificarla.',
    })
  } catch (error) {
    if (error.code === 11000) {
      const field =
        Object.keys(
          error.keyPattern || {}
        )[0]

      return res.status(400).json({
        message:
          field === 'email'
            ? 'Ese correo ya esta en uso'
            : 'Ese usuario ya esta en uso',
      })
    }

    res.status(500).json({
      message:
        'Error al registrar usuario',
    })
  }
}

const checkAvailability = async (req, res) => {
  try {
    const username =
      String(
        req.query.username || ''
      ).trim()
    const email =
      String(req.query.email || '')
        .trim()
        .toLowerCase()

    const response = {}

    if (username) {
      const existingUsername =
        await User.findOne({
          username,
        }).select('_id')

      response.usernameAvailable =
        !existingUsername
    }

    if (email) {
      const existingEmail =
        await User.findOne({
          email,
        }).select('_id')

      response.emailAvailable =
        !existingEmail
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({
      message:
        'Error al comprobar disponibilidad',
    })
  }
}

const login = async (req, res) => {
  try {
    const email =
      String(req.body.email || '')
        .trim()
        .toLowerCase()
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email y contrasena requeridos',
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: 'Usuario no encontrado',
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return res.status(400).json({
        message: 'Contraseña incorrecta',
      })
    }

    if (
      user.isEmailVerified === false ||
      user.emailVerificationToken
    ) {
      return res.status(403).json({
        message:
          'Necesitas verificar tu correo primero',
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    res.status(200).json({
      token,
      user: sanitizeUser(user),
    })
  } catch (error) {
    res.status(500).json({
      message:
        'Error al iniciar sesion',
    })
  }
}

const verifyEmail = async (req, res) => {
  try {
    const token =
      String(req.body.token || '').trim()

    if (!token) {
      return res.status(400).json({
        message:
          'Token de verificacion requerido',
      })
    }

    const hash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      emailVerificationToken: hash,
      emailVerificationExpires: {
        $gt: Date.now(),
      },
    })

    if (!user) {
      return res.status(400).json({
        message:
          'Token de verificacion invalido o caducado',
      })
    }

    user.isEmailVerified = true
    user.emailVerificationToken = ''
    user.emailVerificationExpires = undefined

    await user.save()

    res.json({
      message:
        'Cuenta verificada correctamente',
    })
  } catch (error) {
    res.status(500).json({
      message:
        'Error al verificar cuenta',
    })
  }
}

module.exports = {
  checkAvailability,
  register,
  login,
  verifyEmail,
}
