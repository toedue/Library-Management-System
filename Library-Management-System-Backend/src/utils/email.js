const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // define email options
  const emailOptions = {
    from: `Library Management System <${process.env.EMAIL_USER}>`,
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  // send email
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
