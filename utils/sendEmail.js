const nodemailer = require("nodemailer");

let transporter = null;

if (
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
) {

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

}

const sendEmail = async (
  to,
  subject,
  receiver,
  trackingNumber,
  message,
  status
) => {

  // SAFETY CHECK
  if (!transporter) {
    console.log("⚠️ Email not configured");
    return;
  }

  await transporter.sendMail({

    from: `"Delta Courier" <${process.env.EMAIL_USER}>`,

    to,

    subject,

    html: `

<div style="
background:#f4f6f9;
padding:40px 20px;
font-family:Arial,sans-serif;
">

<div style="
max-width:650px;
margin:auto;
background:white;
border-radius:14px;
overflow:hidden;
box-shadow:0 6px 20px rgba(0,0,0,0.08);
">

<!-- HEADER -->

<div style="
background:#0a1f44;
padding:30px;
text-align:center;
">

<img
style='width:140px;margin-bottom:10px;'
>

<h1 style="
color:white;
margin:0;
font-size:28px;
">
Shipment Update
</h1>

</div>

<!-- BODY -->

<div style="padding:35px;">

<p style="
font-size:17px;
color:#333;
margin-bottom:25px;
">
Hello <strong>${receiver}</strong>,
</p>

<div style="
background:#f7faff;
border-left:4px solid #1e88ff;
padding:20px;
border-radius:10px;
margin-bottom:25px;
">

<p style="
margin:0;
font-size:16px;
color:#222;
line-height:1.7;
">
${message}
</p>

</div>

<!-- TRACKING BOX -->

<div style="
background:#0a1f44;
border-radius:12px;
padding:22px;
color:white;
margin-bottom:25px;
">

<p style="margin:0 0 10px 0;font-size:14px;opacity:0.8;">
Tracking Number
</p>

<h2 style="
margin:0;
font-size:28px;
letter-spacing:1px;
">
${trackingNumber}
</h2>

<p style="
margin-top:18px;
display:inline-block;
background:#1e88ff;
padding:8px 16px;
border-radius:30px;
font-size:14px;
">
${status}
</p>

</div>

<!-- BUTTON -->

<div style="text-align:center;margin-top:35px;">

<a href=" =${trackingNumber}"

style="
background:#ff6b00;
color:white;
padding:14px 28px;
text-decoration:none;
border-radius:8px;
font-weight:bold;
display:inline-block;
">

Track Shipment

</a>

</div>

</div>

<!-- FOOTER -->

<div style="
background:#eef2f7;
padding:25px;
text-align:center;
font-size:13px;
color:#666;
">

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

};

module.exports = sendEmail;