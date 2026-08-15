const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(toEmail, code) {
  await transporter.sendMail({
    from: `"UPS & Inverter Platform" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your login code',
    text: `Your verification code is ${code}. It expires in 5 minutes.`,
  });
}

module.exports = { sendOtpEmail };