const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure:true, 
    auth:{
        user:process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

const enviarEmail =(to, subject, body)=>{ 
transporter.sendMail({
    from:process.env.MAIL_FROM,
    to,
    subject,
    html:body
})
}

module.exports = enviarEmail