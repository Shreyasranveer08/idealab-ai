const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendDailyBrief(targetEmail, brief, topOpportunity, newStartupsCount) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email credentials not configured. Skipping email send.");
      return false;
    }

    try {
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f1115; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #ffffff1a;">
          <h1 style="color: #6366f1; margin-bottom: 5px; font-size: 28px;">Founder Daily Brief</h1>
          <p style="color: #a1a1aa; font-size: 14px; margin-top: 0; margin-bottom: 30px;">${new Date(brief.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div style="background-color: #ffffff0a; padding: 20px; border-radius: 12px; border: 1px solid #ffffff1a; margin-bottom: 25px;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0;">${brief.summary}</p>
          </div>
          
          <div style="display: flex; gap: 15px; margin-bottom: 30px;">
            <div style="flex: 1; background-color: #ffffff0a; padding: 15px; border-radius: 12px; text-align: center;">
              <div style="font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Startups Scanned</div>
              <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${newStartupsCount}</div>
            </div>
            <div style="flex: 1; background-color: #ffffff0a; padding: 15px; border-radius: 12px; text-align: center;">
              <div style="font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Underserved Niche</div>
              <div style="font-size: 16px; font-weight: bold; color: #10b981;">${brief.underservedNiche || 'N/A'}</div>
            </div>
          </div>

          ${topOpportunity ? `
            <h2 style="font-size: 20px; border-bottom: 1px solid #ffffff1a; padding-bottom: 10px; margin-bottom: 20px;">Top Opportunity Found</h2>
            <div style="background-color: #10b9811a; border: 1px solid #10b9814d; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; margin-bottom: 5px; color: #10b981; font-size: 22px;">${topOpportunity.name}</h3>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 0; margin-bottom: 15px;">${topOpportunity.category}</p>
              <p style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">${topOpportunity.description}</p>
              
              <div style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: bold; padding: 8px 16px; border-radius: 8px; font-size: 14px;">
                Opportunity Score: ${topOpportunity.analysis?.overallScore || 'N/A'}/100
              </div>
            </div>
          ` : ''}

          <h2 style="font-size: 20px; border-bottom: 1px solid #ffffff1a; padding-bottom: 10px; margin-bottom: 20px;">Market Insights</h2>
          <div style="background-color: #ffffff0a; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #cbd5e1;">Emerging Trends</h4>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-top: 0; margin-bottom: 20px;">${brief.emergingTrends || 'No major trends detected today.'}</p>
            
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #cbd5e1;">Build This Today</h4>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-top: 0; margin-bottom: 0; white-space: pre-wrap;">${brief.recommendedIdeas || 'No specific recommendations today.'}</p>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="http://localhost:5173" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 10px; font-size: 16px;">View Full Dashboard</a>
          </div>
          
          <p style="text-align: center; color: #52525b; font-size: 12px; margin-top: 40px;">
            Sent by BuildWatch AI<br/>Your automated startup intelligence copilot.
          </p>
        </div>
      `;

      const info = await this.transporter.sendMail({
        from: '"BuildWatch AI" <' + process.env.SMTP_USER + '>',
        to: targetEmail,
        subject: `🚀 Founder Brief: ${topOpportunity ? topOpportunity.name + ' & more' : 'Your Daily Startup Insights'}`,
        html: htmlContent,
      });

      console.log("Email sent successfully: %s", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async sendDailyBriefToAllUsers(brief, topOpportunity, newStartupsCount) {
    // In a production app, we would query the Supabase Auth users table using the Service Role Key.
    // For this MVP, we will send it to a comma-separated list of target emails in the .env file.
    const targetEmails = process.env.SUBSCRIBER_EMAILS;
    
    if (!targetEmails) {
      console.log("No SUBSCRIBER_EMAILS defined in .env. Skipping batch email.");
      return;
    }

    const emails = targetEmails.split(',').map(e => e.trim());
    console.log(`Preparing to send Daily Brief to ${emails.length} subscribers...`);

    for (const email of emails) {
      await this.sendDailyBrief(email, brief, topOpportunity, newStartupsCount);
    }
  }
}

module.exports = new EmailService();
