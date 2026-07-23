const transporter = require('./mailer');

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Relay <no-reply@relay.example.com>';

function welcomeEmailTemplate(user) {
  return {
    subject: `Welcome to Relay, ${user.name}!`,
    text:
      `Hi ${user.name},\n\n` +
      `Thanks for creating an account with Relay. You can now browse the ` +
      `catalog, build a cart, and track your orders from your account.\n\n` +
      `Happy shopping!\nThe Relay Team`,
    html:
      `<p>Hi ${user.name},</p>` +
      `<p>Thanks for creating an account with Relay. You can now browse the ` +
      `catalog, build a cart, and track your orders from your account.</p>` +
      `<p>Happy shopping!<br/>The Relay Team</p>`,
  };
}


async function sendWelcomeEmail(user) {
  const { subject, text, html } = welcomeEmailTemplate(user);

  try {
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: user.email,
      subject,
      text,
      html,
    });

    if (info.message) {
      console.log(`📧 [email:dev-mode] Would send "${subject}" to ${user.email}`);
    } else {
      console.log(`📧 Welcome email sent to ${user.email} (messageId: ${info.messageId})`);
    }

    return info;
  } catch (error) {
    console.error(`⚠️  Failed to send welcome email to ${user.email}:`, error.message);
    return null;
  }
}

module.exports = { sendWelcomeEmail };