const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVideoReadyEmail(email, orderId) {
    try {
      const downloadUrl = `${process.env.BASE_URL}/api/video/download/${orderId}`;

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@santavideos.com',
        to: email,
        subject: '🎅 Your Personalized Santa Video is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d42c2c; text-align: center;">🎅 Ho Ho Ho!</h1>
            <h2 style="color: #2c5d31;">Your Santa Video is Ready!</h2>
            
            <p>Great news! Your personalized Santa video has been created and is ready for download.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" 
                 style="background-color: #d42c2c; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Download Your Video
              </a>
            </div>
            
            <p><strong>Order ID:</strong> ${orderId}</p>
            
            <p>Your video will be available for download for the next 30 days. Make sure to save it to your device!</p>
            
            <p style="color: #666; font-size: 14px;">
              If you have any issues downloading your video, please contact our support team with your order ID.
            </p>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #2c5d31; font-weight: bold;">Merry Christmas! 🎄</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Video ready email sent to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send notification email');
    }
  }

  async sendOrderConfirmation(email, orderData) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@santavideos.com',
        to: email,
        subject: '🎅 Santa Video Order Confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d42c2c; text-align: center;">🎅 Order Confirmed!</h1>
            
            <p>Thank you for your order! Santa and his elves are now working on creating a magical personalized video.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Child's Name:</strong> ${orderData.childName}</p>
              <p><strong>Template:</strong> ${orderData.templateName}</p>
              <p><strong>Photos:</strong> ${orderData.photoCount} uploaded</p>
            </div>
            
            <p>Your video will be ready within 24 hours. We'll send you another email with the download link once it's complete.</p>
            
            <p style="color: #2c5d31; font-weight: bold;">Ho ho ho! 🎄</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  }
}

module.exports = new EmailService();

