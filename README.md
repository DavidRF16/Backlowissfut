# Backlowissfut

Backend de LowissFut preparado para Railway.

## Railway

Configura estas variables en el servicio del backend:

- `MONGODB_URI`: cadena de conexion de MongoDB.
- `JWT_SECRET`: secreto largo para firmar tokens.
- `CLIENT_URL`: URL publica del frontend, por ejemplo `https://tu-front.up.railway.app`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: credenciales de Cloudinary.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: credenciales SMTP para enviar correos.
- `MAIL_FROM`: remitente de los correos, opcional si coincide con el usuario SMTP.

Si necesitas permitir varios frontends, usa `CLIENT_URLS` con URLs separadas por comas.

Railway debe ejecutar:

- Install: `npm ci`
- Start: `npm start`
- Healthcheck: `/`
