require('dotenv').config()
const postRoutes = require('./routes/postRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const friendRoutes = require('./routes/friendRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const messageRoutes = require('./routes/messageRoutes')
const officialShirtRoutes = require('./routes/officialShirtRoutes')

const express = require('express')
const cors = require('cors')
const multer = require('multer')

const connectDB = require('./config/db')

const app = express()
connectDB()

const configuredClientUrls = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  ''
)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

const clientUrls = [
  ...configuredClientUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

app.use(
  cors({
    origin: clientUrls,
    credentials: true,
  })
)

app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/official-shirts', officialShirtRoutes)

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'LowissFut API running',
  })
})

app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
  })
})

app.use((error, req, res, next) => {
  if (
    error instanceof
      multer.MulterError ||
    error.message ===
      'Solo se permiten imagenes'
  ) {
    return res.status(400).json({
      message: error.message,
    })
  }

  res.status(500).json({
    message: 'Error interno del servidor',
  })
})

const http = require('http')

const { Server } = require('socket.io')

const socketHandler = require(
  './sockets/socket'
)

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: clientUrls,
  },
})

socketHandler(io)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} ${
      process.env.PORT
        ? '(Railway PORT)'
        : '(local fallback)'
    }`
  )
})
