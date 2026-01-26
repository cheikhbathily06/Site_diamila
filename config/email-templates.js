/**
 * TEMPLATES D'EMAILS LUXUEUX - DESIGN AMÉLIORÉ
 * Couleurs contrastées, textes lisibles, design professionnel
 */

const getLuxuryEmailTemplate = (content, isAdmin = false) => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isAdmin ? 'Nouvelle Commande' : 'Confirmation'} - Denisia Bijoux</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f4;">
  
  <table role="presentation" style="width: 100%; max-width: 650px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
    
    <!-- Header Jaune Doré -->
    <tr>
      <td style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 30px; text-align: center;">
        <h1 style="font-family: Georgia, serif; font-size: 48px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
          Denisia Bijoux
        </h1>
        <p style="font-size: 16px; color: #333; letter-spacing: 3px; text-transform: uppercase; margin: 0; font-weight: 600;">
          ✨ Bijoux d'Exception ✨
        </p>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 40px 35px; background: white;">
        ${content}
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #1a1a1a; padding: 35px 30px; text-align: center; color: white;">
        
        <!-- Social Links -->
        <table role="presentation" style="margin: 0 auto 25px;">
          <tr>
            <td style="padding: 0 10px;">
              <a href="https://www.instagram.com/denisia_bijoux/" style="display: inline-block; width: 45px; height: 45px; background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); border-radius: 50%; text-align: center; line-height: 45px; text-decoration: none; font-size: 22px; color: white; font-weight: bold;">
                📷
              </a>
            </td>
            <td style="padding: 0 10px;">
              <a href="https://www.tiktok.com/@denisia_bijoux?lang=fr" style="display: inline-block; width: 45px; height: 45px; background: #000000; border-radius: 50%; text-align: center; line-height: 45px; text-decoration: none; font-size: 22px; color: #00f2ea; font-weight: bold;">
                🎵
              </a>
            </td>
            <td style="padding: 0 10px;">
              <a href="https://wa.me/221767378528" style="display: inline-block; width: 45px; height: 45px; background: #25D366; border-radius: 50%; text-align: center; line-height: 45px; text-decoration: none; font-size: 22px; color: white; font-weight: bold;">
                💬
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Divider -->
        <div style="height: 3px; background: linear-gradient(90deg, transparent, #FFD700, transparent); margin: 25px 0;"></div>
        
        <!-- Contact Info -->
        <p style="font-size: 15px; color: #e0e0e0; line-height: 1.8; margin: 15px 0;">
          <strong style="color: white; font-size: 17px;">Denisia Bijoux</strong><br>
          Bijoux en acier inoxydable de qualité<br>
          📧 ${process.env.EMAIL_FROM}<br>
          📱 WhatsApp: +221 76 737 85 28
        </p>
        
        <!-- Copyright -->
        <p style="font-size: 12px; color: #999; margin: 20px 0 0;">
          © ${new Date().getFullYear()} Denisia Bijoux. Tous droits réservés.
        </p>
        
      </td>
    </tr>
    
  </table>
  
</body>
</html>
  `;
};

/**
 * Email client - Design luxueux lisible
 */
const getClientEmailContent = (order) => {
  const itemsHTML = order.items.map(item => {
    let personalizationHTML = '';
    if (item.isPersonalized && item.personalizationText) {
      personalizationHTML = `
        <div style="background: #fff9e6; padding: 12px 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #FFD700;">
          <strong style="color: #cc8800;">✨ Personnalisé:</strong>
          <span style="color: #333; font-style: italic;">"${item.personalizationText}"</span>
        </div>
      `;
    }
    
    return `
      <div style="background: #fafafa; padding: 20px; margin: 15px 0; border-radius: 10px; border: 2px solid #FFD700;">
        <div style="font-weight: 700; color: #1a1a1a; font-size: 18px; margin-bottom: 8px;">
          ${item.productName || 'Article'}
        </div>
        <div style="font-size: 16px; color: #333; margin-top: 8px; line-height: 1.6;">
          Quantité: <strong>${item.quantity}</strong> × <strong>${(item.productPrice || 0).toLocaleString('fr-FR')} FCFA</strong>
          <br>
          Total: <strong style="color: #cc8800; font-size: 18px;">${(item.subtotal || 0).toLocaleString('fr-FR')} FCFA</strong>
        </div>
        ${personalizationHTML}
      </div>
    `;
  }).join('');

  const paymentText = order.paymentMethod === 'online' ? '💳 Paiement en ligne (Wave)' : '💵 Paiement à la livraison';

  return `
    <h2 style="font-family: Georgia, serif; font-size: 32px; color: #1a1a1a; margin: 0 0 25px; font-weight: 700;">
      Bonjour ${order.customer.firstName} ! 👋
    </h2>
    
    <p style="font-size: 17px; color: #333; line-height: 1.8; margin: 0 0 30px;">
      <strong>Merci pour votre confiance ! ✨</strong><br><br>
      Nous avons bien reçu votre commande et nous sommes ravis de créer ces bijoux d'exception pour vous.
      Votre commande est en cours de préparation avec tout le soin qu'elle mérite.
    </p>
    
    <!-- Order Box -->
    <div style="background: linear-gradient(135deg, #fff9e6 0%, #fffaf0 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border: 3px solid #FFD700;">
      
      <div style="font-family: Georgia, serif; font-size: 28px; color: #cc8800; font-weight: 700; margin-bottom: 20px; text-align: center; letter-spacing: 1px;">
        📦 Commande N° ${order.orderNumber}
      </div>
      
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 2px solid #FFD700;">
          <td style="padding: 15px 0; font-weight: 600; color: #666; font-size: 15px;">Date</td>
          <td style="padding: 15px 0; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 15px;">
            ${new Date(order.createdAt).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}
          </td>
        </tr>
        <tr style="border-bottom: 2px solid #FFD700;">
          <td style="padding: 15px 0; font-weight: 600; color: #666; font-size: 15px;">Statut</td>
          <td style="padding: 15px 0; text-align: right; font-weight: 700; color: #28a745; font-size: 16px;">
            ✅ Confirmée
          </td>
        </tr>
        <tr>
          <td style="padding: 15px 0; font-weight: 600; color: #666; font-size: 15px;">Paiement</td>
          <td style="padding: 15px 0; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 15px;">
            ${paymentText}
          </td>
        </tr>
      </table>
      
    </div>
    
    <!-- Items -->
    <h3 style="font-family: Georgia, serif; font-size: 24px; color: #1a1a1a; margin: 30px 0 15px; font-weight: 700;">
      🛍️ Vos articles
    </h3>
    
    <div style="margin: 20px 0;">
      ${itemsHTML}
    </div>
    
    <!-- Total -->
    <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #1a1a1a; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">
      <div style="font-size: 16px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; font-weight: 600;">
        💰 Montant Total
      </div>
      <div style="font-family: Georgia, serif; font-size: 42px; font-weight: 700; letter-spacing: 1px;">
        ${order.total.toLocaleString('fr-FR')} FCFA
      </div>
    </div>
    
    <!-- Delivery -->
    <h3 style="font-family: Georgia, serif; font-size: 24px; color: #1a1a1a; margin: 30px 0 15px; font-weight: 700;">
      📍 Adresse de livraison
    </h3>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; font-size: 16px; color: #333; line-height: 1.8; border-left: 4px solid #FFD700;">
      <strong style="color: #1a1a1a; font-size: 17px;">${order.customer.firstName} ${order.customer.lastName}</strong><br>
      ${order.customer.address}<br>
      ${order.deliveryZone ? order.deliveryZone.name : order.deliveryZoneName || 'Zone non spécifiée'}<br>
      📱 ${order.customer.phone}
    </div>
    
    <div style="height: 3px; background: linear-gradient(90deg, transparent, #FFD700, transparent); margin: 35px 0;"></div>
    
    <p style="font-size: 17px; color: #333; line-height: 1.8; text-align: center; margin: 0;">
      <strong style="color: #1a1a1a;">Besoin d'aide ?</strong><br>
      Notre équipe est à votre écoute via WhatsApp ou Instagram pour toute question.
    </p>
    
    <p style="font-size: 15px; color: #666; text-align: center; margin: 25px 0 0;">
      Nous vous tiendrons informé(e) de l'évolution de votre commande.<br>
      <strong>À très bientôt ! 💎</strong>
    </p>
  `;
};

/**
 * Email admin - Design professionnel
 */
const getAdminEmailContent = (order) => {
  const itemsHTML = order.items.map(item => {
    let personalizationHTML = '';
    if (item.isPersonalized && item.personalizationText) {
      personalizationHTML = `
        <div style="background: #fff9e6; padding: 12px 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #FFD700;">
          <strong style="color: #cc8800;">✨ Personnalisé:</strong>
          <span style="color: #333; font-style: italic;">"${item.personalizationText}"</span>
        </div>
      `;
    }
    
    return `
      <div style="background: #fafafa; padding: 20px; margin: 15px 0; border-radius: 10px; border: 2px solid #FFD700;">
        <div style="font-weight: 700; color: #1a1a1a; font-size: 18px; margin-bottom: 8px;">
          ${item.productName || 'Article'}
        </div>
        <div style="font-size: 16px; color: #333; margin-top: 8px;">
          Quantité: <strong>${item.quantity}</strong> × <strong>${(item.productPrice || 0).toLocaleString('fr-FR')} FCFA</strong>
          <br>
          Total: <strong style="color: #cc8800; font-size: 18px;">${(item.subtotal || 0).toLocaleString('fr-FR')} FCFA</strong>
        </div>
        ${personalizationHTML}
      </div>
    `;
  }).join('');

  const paymentText = order.paymentMethod === 'online' ? '💳 Paiement en ligne (Wave)' : '💵 Paiement à la livraison';
  const paymentStatus = order.paymentStatus === 'paid' ? '✅ Payé' : '⏳ En attente';

  return `
    <h2 style="font-family: Georgia, serif; font-size: 32px; color: #1a1a1a; margin: 0 0 25px; font-weight: 700;">
      🎉 Nouvelle Commande !
    </h2>
    
    <p style="font-size: 17px; color: #333; line-height: 1.8; margin: 0 0 30px;">
      Une nouvelle commande vient d'être passée sur votre boutique <strong>Denisia Bijoux</strong>.
    </p>
    
    <!-- Order Box -->
    <div style="background: linear-gradient(135deg, #fff9e6 0%, #fffaf0 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border: 3px solid #FFD700;">
      
      <div style="font-family: Georgia, serif; font-size: 28px; color: #cc8800; font-weight: 700; margin-bottom: 20px; text-align: center;">
        📦 Commande N° ${order.orderNumber}
      </div>
      
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 2px solid #FFD700;">
          <td style="padding: 15px 0; font-weight: 600; color: #666; font-size: 15px;">Date</td>
          <td style="padding: 15px 0; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 15px;">
            ${new Date(order.createdAt).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
          </td>
        </tr>
        <tr style="border-bottom: 2px solid #FFD700;">
          <td style="padding: 15px 0; font-weight: 600; color: #666; font-size: 15px;">Paiement</td>
          <td style="padding: 15px 0; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 15px;">
            ${paymentText}
          </td>
        </tr>
        <tr>
          <td style="padding: 15px 0; font-weight: 600; color: #666; font-size: 15px;">Statut paiement</td>
          <td style="padding: 15px 0; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 15px;">
            ${paymentStatus}
          </td>
        </tr>
      </table>
      
    </div>
    
    <!-- Customer Info -->
    <h3 style="font-family: Georgia, serif; font-size: 24px; color: #1a1a1a; margin: 30px 0 15px; font-weight: 700;">
      👤 Informations client
    </h3>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; font-size: 16px; color: #333; line-height: 1.8; border-left: 4px solid #FFD700;">
      <strong style="color: #1a1a1a; font-size: 17px;">${order.customer.firstName} ${order.customer.lastName}</strong><br>
      📧 ${order.customer.email}<br>
      📱 ${order.customer.phone}<br>
      📍 ${order.customer.address}<br>
      🚚 ${order.deliveryZone ? order.deliveryZone.name : order.deliveryZoneName || 'Zone non spécifiée'}
    </div>
    
    <!-- Items -->
    <h3 style="font-family: Georgia, serif; font-size: 24px; color: #1a1a1a; margin: 30px 0 15px; font-weight: 700;">
      🛍️ Articles commandés
    </h3>
    
    <div style="margin: 20px 0;">
      ${itemsHTML}
    </div>
    
    <!-- Total -->
    <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #1a1a1a; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">
      <div style="font-size: 16px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; font-weight: 600;">
        💰 Montant Total
      </div>
      <div style="font-family: Georgia, serif; font-size: 42px; font-weight: 700;">
        ${order.total.toLocaleString('fr-FR')} FCFA
      </div>
    </div>
    
    <div style="height: 3px; background: linear-gradient(90deg, transparent, #FFD700, transparent); margin: 35px 0;"></div>
    
    <p style="font-size: 16px; color: #333; text-align: center; margin: 0;">
      Accédez à votre <strong>tableau de bord admin</strong> pour gérer cette commande.
    </p>
  `;
};

module.exports = {
  getLuxuryEmailTemplate,
  getClientEmailContent,
  getAdminEmailContent
};
