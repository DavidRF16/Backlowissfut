const adminMiddleware = (
  req,
  res,
  next
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      message:
        'No autorizado',
    })
  }

  next()
}

module.exports = adminMiddleware
