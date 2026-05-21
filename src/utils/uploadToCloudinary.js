const cloudinary = require(
  '../config/cloudinary'
)

const streamifier = require(
  'streamifier'
)

const uploadToCloudinary = (
  file,
  folder
) => {
  return new Promise(
    (resolve, reject) => {
      const stream =
        cloudinary.uploader.upload_stream(
          {
            folder,
          },

          (error, result) => {
            if (result)
              resolve(result)

            else reject(error)
          }
        )

      streamifier
        .createReadStream(file.buffer)
        .pipe(stream)
    }
  )
}

module.exports =
  uploadToCloudinary