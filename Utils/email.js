const nodemailer = require("nodemailer");



const sendEmail = async (option) => {

    console.log(process.env.EMAIL_USER)
    // create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 25,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // define email options
    const emailOptions = {
        from: "cineflix support<support@cineflix.com>",
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendMail(emailOptions)

    
}

module.exports = sendEmail