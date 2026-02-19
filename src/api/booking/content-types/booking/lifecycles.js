const crypto = require("crypto");

// Funzione per cifrare il Document ID
const encryptId = (text) => {
  const secretKey = process.env.CIPHER_KEY; // La tua chiave condivisa
  if (!secretKey) throw new Error("CIPHER_KEY not set");

  // Usiamo un IV fisso basato sulla chiave per avere URL consistenti o uno random per sicurezza
  // Per i link di cancellazione, un IV fisso semplifica la gestione senza database
  const iv = crypto
    .createHash("sha256")
    .update(secretKey)
    .digest()
    .slice(0, 16);
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    crypto.scryptSync(secretKey, "salt", 32),
    iv,
  );

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString("hex");
};

const sendBookingEmail = async (bookingId, statusType) => {
  try {
    const entry = await strapi.entityService.findOne(
      "api::booking.booking",
      bookingId,
      {
        populate: ["customer", "treatment", "masseuse", "masseuse.img"],
      },
    );

    if (entry && entry.customer && entry.customer.email) {
      // --- 1. RILEVAMENTO LINGUA ---
      const isKhmer = entry.customer.isKhmer === true;

      const bookingDocId = entry.documentId; // Assicurati di usare documentId (il nuovo standard Strapi 5) o entry.id
      const encryptedToken = encryptId(bookingDocId.toString());
      const cancellationLink = `https://lotusdreamspa.com/booking-cancellation/${encryptedToken}`;

      // --- 2. DIZIONARIO TRADUZIONI ---
      const translations = {
        en: {
          subjectConf: "Booking Confirmed - Lotus Dream Spa 🌸",
          subjectCanc: "Booking Cancelled - Lotus Dream Spa ❌",
          titleConf: "Booking Confirmed",
          titleCanc: "Booking Cancelled",
          msgConf: `We are looking forward to see you, ${entry.customer.name ?? "dear Guest"}.`,
          msgCanc: `Hello ${entry.customer.name ?? "dear Guest"}, your appointment has been cancelled as requested.`,
          textConf: `Dear ${entry.customer.name ?? "dear Guest"}, your appointment is confirmed.`,
          textCanc: `Dear ${entry.customer.name ?? "dear Guest"}, your appointment has been cancelled.`,
          detailsHeader: "Appointment Details",
          labelTreatment: "Treatment",
          labelTherapist: "Therapist",
          labelDate: "Date",
          labelTime: "Time",
          labelDuration: "Duration",
          labelPrice: "Price",
          checkReception: "Check at reception",
          mins: "mins",
          footerCanc: '"Feel free to reach us whenever you want again."',
          btnDirections: "📍 Get Directions",
          waitingMsg:
            "will be waiting for you to provide a totally immersive and relaxing experience.",
          btnCancel: "Cancel Appointment",
          cancelNote: "Need to change plans? You can cancel your booking here:",
        },
        kh: {
          subjectConf: "ការកក់ត្រូវបានបញ្ជាក់ - Lotus Dream Spa 🌸",
          subjectCanc: "ការកក់ត្រូវបានលុបចោល - Lotus Dream Spa ❌",
          titleConf: "ការកក់ត្រូវបានបញ្ជាក់",
          titleCanc: "ការកក់ត្រូវបានលុបចោល",
          msgConf: `យើងកំពុងរង់ចាំអ្នក, ${entry.customer.name ?? "ភ្ញៀវ"}.`,
          msgCanc: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, ការណាត់ជួបរបស់អ្នកត្រូវបានលុបចោលតាមសំណើ។`,
          textConf: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, ការណាត់ជួបរបស់អ្នកត្រូវបានបញ្ជាក់។`,
          textCanc: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, ការណាត់ជួបរបស់អ្នកត្រូវបានលុបចោល।`,
          detailsHeader: "ព័ត៌មានលម្អិតនៃការណាត់ជួប",
          labelTreatment: "ការព្យាបាល",
          labelTherapist: "គ្រូជំនាញ",
          labelDate: "កាលបរិច្ឆេទ",
          labelTime: "ម៉ោង",
          labelDuration: "រយៈពេល",
          labelPrice: "តម្លៃ",
          checkReception: "សាកសួរនៅកន្លែងទទួលភ្ញៀវ",
          mins: "នាទី",
          footerCanc: '"សូមទាក់ទងមកយើងខ្ញុំគ្រប់ពេលដែលអ្នកត្រូវការ។"',
          btnDirections: "📍 មើលទីតាំង",
          waitingMsg:
            "នឹងរង់ចាំអ្នក ដើម្បីផ្តល់ជូននូវបទពិសោធន៍ដ៏អស្ចារ្យ និងការសម្រាកកាយយ៉ាងពេញលេញ។",
          btnCancel: "បោះបង់ការណាត់ជួប",
          cancelNote:
            "ត្រូវការផ្លាស់ប្តូរគម្រោងមែនទេ? អ្នកអាចបោះបង់ការកក់បាននៅទីនេះ៖",
        },
      };

      const t = isKhmer ? translations.kh : translations.en;

      // --- DATI BASE FORMATTATI ---
      const treatmentName = entry.treatment
        ? entry.treatment.title
        : isKhmer
          ? "ម៉ាស្សាទូទៅ"
          : "General Massage";
      const bookingPrice = entry.price ? `$${entry.price}` : t.checkReception;
      const bookingDuration = entry.duration
        ? `${entry.duration} ${t.mins}`
        : "-";
      const bookingDate = entry.date || "TBD";
      const bookingTime = entry.time ? entry.time.slice(0, 5) : "TBD";

      const logoUrl =
        "https://respected-cherry-3bae02ef27.media.strapiapp.com/logo_a65400de7e.png";
      const mapLink =
        "https://www.google.com/maps/search/?api=1&query=Lotus+Dream+Spa+Siem+Reap";

      const isCancelled = statusType === "cancelled";

      // --- LOGICA MASSEUSE (Sotto la card, solo confermati) ---
      let masseuseHtml = "";
      if (!isCancelled && entry.masseuse) {
        const mName = entry.masseuse.name || "Our Therapist";
        const mImg =
          entry.masseuse.img?.url ||
          "https://respected-cherry-3bae02ef27.media.strapiapp.com/default_avatar.png";

        masseuseHtml = `
          <div style="margin-top: 25px; text-align: center; padding: 15px; border-top: 1px dashed #eee;">
            <img src="${mImg}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #D8975D; margin-bottom: 8px;" />
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${mName}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #666; font-style: italic; line-height: 1.4; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
              ${t.waitingMsg}
            </p>
          </div>
        `;
      }

      const emailConfig = {
        subject: isCancelled ? t.subjectCanc : t.subjectConf,
        title: isCancelled ? t.titleCanc : t.titleConf,
        titleColor: isCancelled ? "#B66676" : "#D8975D",
        message: isCancelled ? t.msgCanc : t.msgConf,
        text: isCancelled ? t.textCanc : t.textConf,
      };

      const priceRowHtml = isCancelled
        ? ""
        : `
        <tr>
          <td style="padding: 10px 0; color: #888; border-top: 1px solid #f5f5f5;">${t.labelPrice}</td>
          <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #d63384; border-top: 1px solid #f5f5f5;">${bookingPrice}</td>
        </tr>
      `;

      const actionFooterHtml = isCancelled
        ? `<p style="color: #D8975D; font-size: 18px; margin: 0; font-style: italic;">${t.footerCanc}</p>`
        : `<a href="${mapLink}" target="_blank" style="background-color: #D8975D; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block;">${t.btnDirections}</a>`;

      const cancelLinkHtml = isCancelled
        ? ""
        : `
    <div style="margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 20px; text-align: center;">
      <p style="color: #ffffff; font-size: 12px; margin-bottom: 10px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
        ${t.cancelNote}
      </p>
      <a href="${cancellationLink}" style="color: #B66676; text-decoration: underline; font-size: 12px;">
        ${t.btnCancel}
      </a>
    </div>
  `;
      console.log(
        `Sending ${statusType} email to: ${entry.customer.email} (Language: ${isKhmer ? "Khmer" : "English"})`,
      );

      // --- INVIO MAIL ---
      await strapi.plugins["email"].services.email.send({
        to: entry.customer.email,
        from: "lotus.dream.cambodia@gmail.com",
        replyTo: "lotus.dream.cambodia@gmail.com",
        bcc: "lotus.dream.cambodia@gmail.com",
        subject: emailConfig.subject,
        text: emailConfig.text,
        html: `
          <div style="background-color: #1f3a5c; padding: 40px 0; width: 100%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div style="background-color: #1f3a5c; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              
              <div style="text-align: center; padding: 30px 0 10px 0;">
                <img src="${logoUrl}" alt="Lotus Dream Spa" style="width: 100px; height: auto;" />
              </div>

              <div style="text-align: center; padding: 0 20px;">
                <h2 style="color: ${emailConfig.titleColor}; margin-bottom: 5px; font-size: 32px; font-family: ${isKhmer ? "'Hanuman', serif" : "inherit"};">${emailConfig.title}</h2>
                <p style="color: #ffffff; font-size: 16px; margin-top: 0; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">${emailConfig.message}</p>
              </div>

              <div style="padding: 24px 8px;"> 
                <div style="background-color: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                  
                  <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">${t.detailsHeader}</h3>
                  
                  <table style="width: 100%; border-collapse: collapse; font-size: 15px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
                    <tr>
                      <td style="padding: 10px 0; color: #888;">${t.labelTreatment}</td>
                      <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #333;">${treatmentName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #888; border-top: 1px solid #f5f5f5;">${t.labelDate}</td>
                      <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5;">${bookingDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #888; border-top: 1px solid #f5f5f5;">${t.labelTime}</td>
                      <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5;">${bookingTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #888; border-top: 1px solid #f5f5f5;">${t.labelDuration}</td>
                      <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5;">${bookingDuration}</td>
                    </tr>
                    ${priceRowHtml}
                  </table>

                  ${masseuseHtml} 
                  </div>
              </div>

              <div style="text-align: center; padding-bottom: 40px; padding-left: 20px; padding-right: 20px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
                ${actionFooterHtml}
              </div>

            </div> 
            
            <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              <p><strong>Lotus Dream Spa</strong><br>676 Hap Guan St, Krong Siem Reap 17252, Siem Reap, Cambodia</p>
            </div>

            ${cancelLinkHtml}
          </div>`,
      });

      strapi.log.info(
        `Spa ${statusType} Email sent to ${entry.customer.email}`,
      );
      console.log("email sent");
    }
  } catch (err) {
    strapi.log.error(`Error sending Spa ${statusType} email:`, err);
    console.log("email error", err);
  }
};

module.exports = {
  async afterCreate(event) {
    const { result, params } = event;
    const status =
      result.bookingStatus || (params.data && params.data.bookingStatus);
    if (status === "confirmed") await sendBookingEmail(result.id, "confirmed");
  },

  async beforeUpdate(event) {
    const { params } = event;
    const existingEntry = await strapi.entityService.findOne(
      "api::booking.booking",
      params.where.id,
    );
    event.state = existingEntry;
  },

  async afterUpdate(event) {
    const { result, params, state } = event;
    const newStatus = params.data && params.data.bookingStatus;
    const oldStatus = state && state.bookingStatus;

    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === "confirmed")
        await sendBookingEmail(result.id, "confirmed");
      if (newStatus === "cancelled")
        await sendBookingEmail(result.id, "cancelled");
    }
  },
};
