import nodemailer from 'nodemailer';

// Email configuration
// For Gmail: Enable "Less secure app access" or use App Password
// For production: Use SendGrid, Mailgun, or Amazon SES
// For development: Uses Ethereal Email automatically (no config needed)

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Store Ethereal test account for the session
let etherealAccount: { user: string; pass: string } | null = null;

// Default configuration - uses environment variables
const getEmailConfig = (): EmailConfig | null => {
  // If SMTP credentials are provided, use them
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }
  return null;
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

// Initialize Ethereal test account
const initEtherealAccount = async (): Promise<{ user: string; pass: string } | null> => {
  if (etherealAccount) {
    return etherealAccount;
  }

  try {
    console.log('📧 Creating Ethereal test email account...');
    const testAccount = await nodemailer.createTestAccount();
    etherealAccount = {
      user: testAccount.user,
      pass: testAccount.pass,
    };
    console.log('✅ Ethereal test account created successfully');
    console.log(`   Email: ${testAccount.user}`);
    console.log('   (Emails will be viewable at the URL logged after sending)');
    return etherealAccount;
  } catch (error: any) {
    console.error('❌ Failed to create Ethereal test account:', error.message);
    return null;
  }
};

const getTransporter = async (): Promise<nodemailer.Transporter | null> => {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();

  // If real SMTP config exists, use it
  if (config) {
    console.log('📧 Using configured SMTP server:', config.host);
    transporter = nodemailer.createTransport(config);
    return transporter;
  }

  // Otherwise, use Ethereal for testing
  const ethereal = await initEtherealAccount();
  if (!ethereal) {
    console.warn('⚠️ Email service not available - could not create Ethereal account');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: ethereal.user,
      pass: ethereal.pass,
    },
  });

  return transporter;
};

// Get the sender email address
const getSenderEmail = (): string => {
  if (process.env.SMTP_USER) {
    return process.env.SMTP_USER;
  }
  return etherealAccount?.user || 'noreply@pabblyform.test';
};

// Email templates
interface FormSubmissionEmailData {
  formTitle: string;
  formId: string;
  submissionId: string;
  submissionData: Record<string, any>;
  submittedAt: string;
}

interface WeeklyReportEmailData {
  userName: string;
  totalForms: number;
  totalSubmissions: number;
  newSubmissionsThisWeek: number;
  topForm: { title: string; submissions: number } | null;
  periodStart: string;
  periodEnd: string;
}

// Generate HTML for form submission notification
const generateSubmissionEmailHtml = (data: FormSubmissionEmailData): string => {
  const fieldsHtml = Object.entries(data.submissionData)
    .map(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 30%;">${key}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${displayValue}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Form Submission</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">You have received a new response</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Form Info -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Form Name</p>
            <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${data.formTitle}</p>
          </div>

          <!-- Submission Details -->
          <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px 0;">Submission Details</h2>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            ${fieldsHtml}
          </table>

          <!-- Metadata -->
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Submission ID:</strong> ${data.submissionId}<br>
              <strong>Submitted at:</strong> ${data.submittedAt}
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:5173/dashboard/submissions"
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View All Submissions
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">Sent by Pabbly Form Builder</p>
          <p style="margin: 8px 0 0 0;">You received this email because you enabled form submission notifications.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate HTML for weekly report
const generateWeeklyReportHtml = (data: WeeklyReportEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Weekly Analytics Report</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${data.periodStart} - ${data.periodEnd}</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">Hi ${data.userName},</p>
          <p style="color: #6b7280; margin: 0 0 24px 0;">Here's your weekly summary of form performance:</p>

          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #eff6ff; border-radius: 8px; padding: 20px; text-align: center;">
              <p style="color: #3b82f6; font-size: 32px; font-weight: 700; margin: 0;">${data.totalForms}</p>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Total Forms</p>
            </div>
            <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; text-align: center;">
              <p style="color: #10b981; font-size: 32px; font-weight: 700; margin: 0;">${data.totalSubmissions}</p>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Total Submissions</p>
            </div>
          </div>

          <!-- New This Week -->
          <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>+${data.newSubmissionsThisWeek}</strong> new submissions this week
            </p>
          </div>

          ${data.topForm ? `
          <!-- Top Performing Form -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Top Performing Form</p>
            <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">${data.topForm.title}</p>
            <p style="color: #10b981; margin: 8px 0 0 0;">${data.topForm.submissions} submissions</p>
          </div>
          ` : ''}

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:5173/dashboard/analytics"
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Full Analytics
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">Sent by Pabbly Form Builder</p>
          <p style="margin: 8px 0 0 0;">You received this email because you enabled weekly reports.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send form submission notification email
export const sendSubmissionNotification = async (
  toEmail: string,
  data: FormSubmissionEmailData
): Promise<{ success: boolean; message: string; previewUrl?: string }> => {
  try {
    const transport = await getTransporter();

    if (!transport) {
      console.log('⚠️ Email notification skipped - email service not available');
      return { success: false, message: 'Email service not available' };
    }

    const html = generateSubmissionEmailHtml(data);
    const senderEmail = getSenderEmail();

    const info = await transport.sendMail({
      from: `"Pabbly Form Builder" <${senderEmail}>`,
      to: toEmail,
      subject: `New submission: ${data.formTitle}`,
      html,
    });

    // Check if using Ethereal (message ID will have ethereal.email domain)
    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log('');
      console.log('📧 ════════════════════════════════════════════════════════════');
      console.log('   EMAIL SENT (Test Mode - Ethereal Email)');
      console.log('────────────────────────────────────────────────────────────────');
      console.log(`   To: ${toEmail}`);
      console.log(`   Subject: New submission: ${data.formTitle}`);
      console.log('');
      console.log('   👉 VIEW EMAIL HERE:');
      console.log(`   ${previewUrl}`);
      console.log('════════════════════════════════════════════════════════════════');
      console.log('');
      return { success: true, message: 'Email sent successfully (test mode)', previewUrl: previewUrl.toString() };
    } else {
      console.log(`✅ Submission notification sent to ${toEmail}`);
      return { success: true, message: 'Email sent successfully' };
    }
  } catch (error: any) {
    console.error('❌ Failed to send submission notification:', error.message);
    return { success: false, message: error.message };
  }
};

// Send weekly report email
export const sendWeeklyReport = async (
  toEmail: string,
  data: WeeklyReportEmailData
): Promise<{ success: boolean; message: string; previewUrl?: string }> => {
  try {
    const transport = await getTransporter();

    if (!transport) {
      console.log('⚠️ Weekly report skipped - email service not available');
      return { success: false, message: 'Email service not available' };
    }

    const html = generateWeeklyReportHtml(data);
    const senderEmail = getSenderEmail();

    const info = await transport.sendMail({
      from: `"Pabbly Form Builder" <${senderEmail}>`,
      to: toEmail,
      subject: `Your Weekly Form Analytics Report`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log('');
      console.log('📧 ════════════════════════════════════════════════════════════');
      console.log('   WEEKLY REPORT SENT (Test Mode - Ethereal Email)');
      console.log('────────────────────────────────────────────────────────────────');
      console.log(`   To: ${toEmail}`);
      console.log('');
      console.log('   👉 VIEW EMAIL HERE:');
      console.log(`   ${previewUrl}`);
      console.log('════════════════════════════════════════════════════════════════');
      console.log('');
      return { success: true, message: 'Email sent successfully (test mode)', previewUrl: previewUrl.toString() };
    } else {
      console.log(`✅ Weekly report sent to ${toEmail}`);
      return { success: true, message: 'Email sent successfully' };
    }
  } catch (error: any) {
    console.error('❌ Failed to send weekly report:', error.message);
    return { success: false, message: error.message };
  }
};

// Send generic email
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; message: string; previewUrl?: string }> => {
  try {
    const transport = await getTransporter();

    if (!transport) {
      return { success: false, message: 'Email service not available' };
    }

    const senderEmail = getSenderEmail();

    const info = await transport.sendMail({
      from: `"Pabbly Form Builder" <${senderEmail}>`,
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log(`📧 Email sent (test mode) - Preview: ${previewUrl}`);
      return { success: true, message: 'Email sent successfully (test mode)', previewUrl: previewUrl.toString() };
    }

    return { success: true, message: 'Email sent successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const transport = await getTransporter();

    if (!transport) {
      return { success: false, message: 'Email service not available' };
    }

    await transport.verify();

    const isEthereal = !process.env.SMTP_USER;
    if (isEthereal) {
      return { success: true, message: 'Using Ethereal test email service (no configuration needed)' };
    }

    return { success: true, message: 'Email configuration is valid' };
  } catch (error: any) {
    return { success: false, message: `Email configuration error: ${error.message}` };
  }
};

export default {
  sendSubmissionNotification,
  sendWeeklyReport,
  sendEmail,
  testEmailConfiguration,
};
