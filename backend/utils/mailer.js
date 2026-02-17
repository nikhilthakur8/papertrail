import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: `"PaperTrail" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - PaperTrail",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e4e4e7;">
                    <h1 style="margin: 0; font-size: 28px; color: #18181b;">
                      Paper<span style="color: #8b5cf6;">Trail</span>
                    </h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #18181b;">Verify Your Email</h2>
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #52525b; line-height: 1.6;">
                      Hi ${userName || "there"},
                    </p>
                    <p style="margin: 0 0 30px 0; font-size: 16px; color: #52525b; line-height: 1.6;">
                      Use the following OTP to verify your email address. This code is valid for 10 minutes.
                    </p>
                    <!-- OTP Box -->
                    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                      <p style="margin: 0; font-size: 36px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px;">${otp}</p>
                    </div>
                    <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                      If you didn't request this verification, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f4f4f5; border-radius: 0 0 12px 12px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                      © ${new Date().getFullYear()} PaperTrail - Research Paper Reading Tracker
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), 15000)
      )
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);

    return { success: false, error: error.message };
  }
};
