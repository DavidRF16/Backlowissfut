const nodemailer = require('nodemailer')

const getMailConfig = () => {
  const host =
    process.env.SMTP_HOST ||
    process.env.MAIL_HOST ||
    (process.env.EMAIL_USER
      ? 'smtp.gmail.com'
      : '')
  const port =
    process.env.SMTP_PORT ||
    process.env.MAIL_PORT ||
    (process.env.EMAIL_USER
      ? '587'
      : '')
  const user =
    process.env.SMTP_USER ||
    process.env.MAIL_USER ||
    process.env.EMAIL_USER
  const pass =
    process.env.SMTP_PASS ||
    process.env.MAIL_PASS ||
    process.env.EMAIL_PASS

  if (!host || !port || !user || !pass) {
    throw new Error(
      'Configura EMAIL_USER y EMAIL_PASS para enviar correos'
    )
  }

  return {
    host,
    port: Number(port),
    secure:
      String(port) === '465',
    auth: {
      user,
      pass,
    },
  }
}

const createTransporter = () =>
  nodemailer.createTransport(
    getMailConfig()
  )

const sendVerificationEmail =
  async ({ email, username, token }) => {
    const clientUrl =
      process.env.CLIENT_URL ||
      'http://localhost:5173'

    const verificationUrl =
      `${clientUrl}/verify-email?token=${token}`

    const from =
      process.env.MAIL_FROM ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      process.env.MAIL_USER ||
      process.env.EMAIL_USER

    await createTransporter().sendMail({
      from,
      to: email,
      subject:
        'Bienvenido a LowissFut: verifica tu cuenta',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;background:#f7f7fb;padding:24px">
          <div style="max-width:560px;margin:0 auto;background:white;border-radius:14px;padding:28px;border:1px solid #e5e7eb">
            <h1 style="margin:0 0 8px;font-size:30px">Bienvenido a LowissFut</h1>
            <p>Hola ${username},</p>
            <p>Gracias por registrarte en LowissFut, tu espacio para organizar tu coleccion de camisetas, compartir publicaciones en el foro, guardar wishlist y conectar con otros coleccionistas.</p>
            <p>Para proteger tu cuenta, confirma tu correo antes de iniciar sesion.</p>
            <p>
              <a href="${verificationUrl}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
                Verificar cuenta
              </a>
            </p>
            <p style="font-size:13px;color:#6b7280">Si el boton no funciona, copia este enlace:</p>
            <p style="font-size:13px;word-break:break-all;color:#4c1d95">${verificationUrl}</p>
          </div>
        </div>
      `,
    })
  }

module.exports = {
  sendVerificationEmail,
}
