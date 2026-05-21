# Backlowissfut

Backend de LowissFut preparado para Railway.

## Railway

Configura estas variables en el servicio del backend:

- `MONGODB_URI`: cadena de conexion de MongoDB.
- `JWT_SECRET`: secreto largo para firmar tokens.
- `CLIENT_URL`: URL publica del frontend, por ejemplo `https://tu-front.up.railway.app`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: credenciales de Cloudinary.
- `EMAIL_USER`, `EMAIL_PASS`: cuenta y clave de aplicacion para enviar correos de verificacion.
- `MAIL_FROM`: remitente de los correos, opcional si coincide con `EMAIL_USER`.

Si necesitas permitir varios frontends, usa `CLIENT_URLS` con URLs separadas por comas.

La verificacion por email esta activada por defecto. Si usas Gmail, crea una clave de aplicacion y ponla en `EMAIL_PASS`; no hace falta configurar variables `SMTP_*`.

Railway debe ejecutar:

- Install: `npm ci`
- Start: `npm start`
- Healthcheck: `/`
