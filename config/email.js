const nodemailer = require('nodemailer');
const {
  getLuxuryEmailTemplate,
  getClientEmailContent,
  getAdminEmailContent
} = require('./email-templates');

// Transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * UN SEUL email au client
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    const content = getClientEmailContent(order);
    const html = getLuxuryEmailTemplate(content, false);

    const mailOptions = {
      from: `"Denisia Bijoux 💎" <${process.env.EMAIL_FROM}>`,
      to: order.customer.email,
      subject: `✨ Confirmation de votre commande ${order.orderNumber} - Denisia Bijoux`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email client envoyé:', order.customer.email);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur email client:', error);
    throw error;
  }
};

/**
 * UN SEUL email à l'admin
 */
const sendOrderNotificationToAdmin = async (order) => {
  try {
    const content = getAdminEmailContent(order);
    const html = getLuxuryEmailTemplate(content, true);

    const mailOptions = {
      from: `"Denisia Bijoux - Notifications 🔔" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 Nouvelle commande ${order.orderNumber} - Denisia Bijoux`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email admin envoyé:', process.env.ADMIN_EMAIL);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur email admin:', error);
    throw error;
  }
};

// Vérification de la configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuration email vérifiée');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration email:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderNotificationToAdmin,
  verifyEmailConfig,
  transporter
};
