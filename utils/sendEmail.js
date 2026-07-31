const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey =
defaultClient.authentications['api-key'];

apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance =
new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (
  to,
  subject,
  receiver,
  trackingNumber,
  message,
  status
) => {

  console.log("BREVO API EMAIL STARTED");

  try {

    const data = await apiInstance.sendTransacEmail({

      sender: {
        email: process.env.BREVO_USER,
        name: "Delta Courier"
      },

      to: [
        {
          email: to
        }
      ],

      subject: subject,

      htmlContent: `

<div style="background:#f4f6f9;padding:40px 20px;font-family:Arial,sans-serif;">
<div style="max-width:650px;margin:auto;background:white;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">

<div style="background:#0a1f44;padding:30px;text-align:center;">
<h1 style="color:white;margin:0;font-size:28px;">Shipment Update</h1>
</div>

<div style="padding:35px;">

<p style="font-size:17px;color:#333;margin-bottom:25px;">
Hello <strong>${receiver}</strong>,
</p>

<div style="background:#f7faff;border-left:4px solid #1e88ff;padding:20px;border-radius:10px;margin-bottom:25px;">

<p style="margin:0;font-size:16px;color:#222;line-height:1.7;">
${message}
</p>

</div>

<div style="background:#0a1f44;border-radius:12px;padding:22px;color:white;margin-bottom:25px;">

<p style="margin:0 0 10px 0;font-size:14px;opacity:0.8;">
Tracking Number
</p>

<h2 style="margin:0;font-size:28px;letter-spacing:1px;">
${trackingNumber}
</h2>

<p style="margin-top:18px;display:inline-block;background:#1e88ff;padding:8px 16px;border-radius:30px;font-size:14px;">
${status}
</p>

</div>

<div style="text-align:center;margin-top:35px;">

<a href="https://delta-courier-services-production-7c17.up.railway.app/track.html?trackingNumber=${trackingNumber}"

style="background:#ff6b00;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">

Track Shipment

</a>

</div>

</div>

<div style="background:#eef2f7;padding:25px;text-align:center;font-size:13px;color:#666;">

<p style="margin-bottom:8px;">
Delta Courier Global Logistics
</p>

<p style="margin:0;">
Fast • Secure • Worldwide Delivery
</p>

</div>

</div>
</div>

      `

    });

    console.log("✅ Email sent:", info.messageId);
    return data;

  } catch (err) {

    console.log("EMAIL FAILED:", err);

  }

};

module.exports = sendEmail;