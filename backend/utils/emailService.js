// utils/emailService.js
import Sib from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Brevo client
const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create transactional email API instance
const tranEmailApi = new Sib.TransactionalEmailsApi();

// Send email function
export const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const sender = {
      email: process.env.FROM_EMAIL,
      name: "Writeer Team",
    };

    const receivers = [{ email: toEmail }];

    console.log(receivers,process.env.FROM_EMAIL)
    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      htmlContent,
    });

    console.log("✅ Email sent successfully:", response);
  } catch (error) {
    console.error("❌ Email sending failed:", error.response?.text || error);
  }
};
