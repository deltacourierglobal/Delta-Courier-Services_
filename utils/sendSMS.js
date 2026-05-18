const twilio = require("twilio");

let client = null;

if (
  process.env.TWILIO_SID &&
  process.env.TWILIO_AUTH
) {

  client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH
  );

}

const sendSMS = async (to, message) => {

  if (!client) {
    console.log("⚠️ Twilio not configured");
    return;
  }

  try {

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to
    });

    console.log("✅ SMS sent");

  } catch (err) {

    console.log("SMS ERROR:", err.message);

  }

};

module.exports = sendSMS;