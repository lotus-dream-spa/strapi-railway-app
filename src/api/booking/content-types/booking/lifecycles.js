const crypto = require("crypto");

// Funzione per cifrare il Document ID
const encryptId = (text) => {
  const secretKey = process.env.CIPHER_KEY; // La tua chiave condivisa
  if (!secretKey) throw new Error("CIPHER_KEY not set");

  // Usiamo un IV fisso basato sulla chiave per avere URL consistenti o uno random per sicurezza
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

const sendBookingEmail = async (documentId, statusType, triggerSource) => {
  try {
    const entry = await strapi.documents("api::booking.booking").findOne({
      documentId,
      populate: ["customer", "treatment"],
    });

    if (entry && entry.customer && entry.customer.email) {
      // --- 1. RILEVAMENTO LINGUA ---
      const isKhmer = entry.customer.isKhmer === true;

      const bookingDocId = entry.documentId;
      const encryptedToken = encryptId(bookingDocId.toString());
      const cancellationLink = `https://lotusdreamspa.com/booking-cancellation/${encryptedToken}`;

      // --- 2. DIZIONARIO TRADUZIONI ---
      const translations = {
        en: {
          subjectConf: "Booking Confirmed - Lotus Dream Spa 🌸",
          subjectCanc: "Booking Cancelled - Lotus Dream Spa ❌",
          subjectCreated: "Contact Request Received - Lotus Dream Spa 📩",
          titleConf: "Booking Confirmed",
          titleCanc: "Booking Cancelled",
          titleCreated: "Contact Request Received",
          msgConf: `We are looking forward to see you, ${entry.customer.name ?? "dear Guest"}.`,
          msgCanc: `Hello ${entry.customer.name ?? "dear Guest"}, your appointment has been cancelled as requested.`,
          msgCreated: `Hello ${entry.customer.name ?? "dear Guest"}, we have received your contact request.`,
          textConf: `Dear ${entry.customer.name ?? "dear Guest"}, your appointment is confirmed.`,
          textCanc: `Dear ${entry.customer.name ?? "dear Guest"}, your appointment has been cancelled.`,
          textCreated: `Dear ${entry.customer.name ?? "dear Guest"}, we have received your request and will contact you shortly.`,
          detailsHeader: "Appointment Details",
          requestHeader: "Request Details",
          labelTreatment: "Treatment",
          labelTherapist: "Therapist",
          labelDate: "Date",
          labelTime: "Time",
          labelDuration: "Duration",
          labelPrice: "Price",
          labelName: "Name",
          labelPhone: "Phone",
          labelEmail: "Email",
          labelNotes: "Notes",
          labelCreatedAt: "Request Time",
          checkReception: "Check at reception",
          mins: "mins",
          footerCanc: '"Feel free to reach us whenever you want again."',
          btnDirections: "📍 Get Directions",
          btnCancel: "Cancel Appointment",
          cancelNote: "Need to change plans? You can cancel your booking here:",
          contactPromise: (hours) => `You will be contacted within ${hours} hours from your request.`,
        },
        kh: {
          subjectConf: "ការកក់ត្រូវបានបញ្ជាក់ - Lotus Dream Spa 🌸",
          subjectCanc: "ការកក់ត្រូវបានលុបចោល - Lotus Dream Spa ❌",
          subjectCreated: "ទទួលបានសំណើទាក់ទង - Lotus Dream Spa 📩",
          titleConf: "ការកក់ត្រូវបានបញ្ជាក់",
          titleCanc: "ការកក់ត្រូវបានលុបចោល",
          titleCreated: "ទទួលបានសំណើទាក់ទង",
          msgConf: `យើងកំពុងរង់ចាំអ្នក, ${entry.customer.name ?? "ភ្ញៀវ"}.`,
          msgCanc: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, ការណាត់ជួបរបស់អ្នកត្រូវបានលុបចោលតាមសំណើ।`,
          msgCreated: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, យើងបានទទួលសំណើទាក់ទងរបស់អ្នកហើយ।`,
          textConf: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, ការណាត់ជួបរបស់អ្នកត្រូវបានបញ្ជាក់।`,
          textCanc: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, ការណាត់ជួបរបស់អ្នកត្រូវបានលុបចោល।`,
          textCreated: `សួស្តី ${entry.customer.name ?? "ភ្ញៀវ"}, យើងបានទទួលសំណើរបស់អ្នក ហើយនឹងទាក់ទងទៅអ្នកវិញក្នុងពេលឆាប់ៗនេះ។`,
          detailsHeader: "ព័ត៌មានលម្អិតនៃការណាត់ជួប",
          requestHeader: "ព័ត៌មានលម្អិតនៃសំណើ",
          labelTreatment: "ការព្យាបាល",
          labelTherapist: "គ្រូជំនាញ",
          labelDate: "កាលបរិច្ឆេទ",
          labelTime: "ម៉ោង",
          labelDuration: "រយៈពេល",
          labelPrice: "តម្លៃ",
          labelName: "ឈ្មោះ",
          labelPhone: "លេខទូរស័ព្ទ",
          labelEmail: "អ៊ីមែល",
          labelNotes: "កំណត់ចំណាំ",
          labelCreatedAt: "ម៉ោងស្នើសុំ",
          checkReception: "សាកសួរនៅកន្លែងទទួលភ្ញៀវ",
          mins: "នាទី",
          footerCanc: '"សូមទាក់ទងមកយើងខ្ញុំគ្រប់ពេលដែលអ្នកត្រូវការ।"',
          btnDirections: "📍 មើលទីតាំង",
          btnCancel: "បោះបង់ការណាត់ជួប",
          cancelNote:
            "ត្រូវការផ្លាស់ប្តូរគម្រោងមែនទេ? អ្នកអាចបោះបង់ការកក់បាននៅទីនេះ៖",
          contactPromise: (hours) => `អ្នកនឹងត្រូវបានទាក់ទងក្នុងរយៈពេល ${hours} ម៉ោងបន្ទាប់ពីការស្នើសុំរបស់អ្នក។`,
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
      const createdAtTime = entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

      const logoUrl =
        "https://respected-cherry-3bae02ef27.media.strapiapp.com/logo_a65400de7e.png";
      const mapLink =
        "https://www.google.com/maps/search/?api=1&query=Lotus+Dream+Spa+Siem+Reap";

      const isCancelled = statusType === "cancelled";
      const isCreated = statusType === "created";

      const emailConfig = {
        subject: isCreated ? t.subjectCreated : (isCancelled ? t.subjectCanc : t.subjectConf),
        title: isCreated ? t.titleCreated : (isCancelled ? t.titleCanc : t.titleConf),
        titleColor: isCancelled ? "#B66676" : "#D8975D",
        message: isCreated ? t.msgCreated : (isCancelled ? t.msgCanc : t.msgConf),
        text: isCreated ? t.textCreated : (isCancelled ? t.textCanc : t.textConf),
      };

      const priceRowHtml = (isCancelled || isCreated)
        ? ""
        : `
        <tr>
          <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelPrice}</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #d63384; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word;">${bookingPrice}</td>
        </tr>
      `;

      // Se status è 'created', mostriamo i dati del richiedente
      let detailsHtml = "";
      if (isCreated) {
        detailsHtml = `
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">${t.requestHeader}</h3>
          <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 13px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
            <tr>
              <td style="padding: 8px 0; color: #888; vertical-align: top; width: 35%;">${t.labelName}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; vertical-align: top; width: 65%; word-break: break-word;">${entry.customer.name || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelEmail}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word;">${entry.customer.email || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelPhone}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word;">${entry.customer.phone || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelCreatedAt}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word;">${createdAtTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelNotes}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word; white-space: pre-wrap;">${entry.notes || "-"}</td>
            </tr>
          </table>
        `;
      } else {
        detailsHtml = `
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">${t.detailsHeader}</h3>
          <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 13px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
            <tr>
              <td style="padding: 8px 0; color: #888; vertical-align: top; width: 35%;">${t.labelTreatment}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; vertical-align: top; width: 65%; word-break: break-word;">${treatmentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelDate}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word;">${bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelTime}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word;">${bookingTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; border-top: 1px solid #f5f5f5; vertical-align: top; width: 35%;">${t.labelDuration}</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #333; border-top: 1px solid #f5f5f5; vertical-align: top; width: 65%; word-break: break-word;">${bookingDuration}</td>
            </tr>
            ${priceRowHtml}
          </table>
        `;
      }

      const actionFooterHtml = isCancelled
        ? `<p style="color: #D8975D; font-size: 18px; margin: 0; font-style: italic;">${t.footerCanc}</p>`
        : (isCreated
          ? `<p style="color: #ffffff; font-size: 14px; margin: 0; font-style: italic; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">${t.contactPromise(process.env.CONTACT_RESPONSE_TIME || 4)}</p>`
          : `<a href="${mapLink}" target="_blank" style="background-color: #D8975D; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block;">${t.btnDirections}</a>`
        );

      const cancelLinkHtml = (isCancelled || isCreated)
        ? ""
        : `
    <div style="margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 20px; text-align: center;">
      <p style="color: #ffffff; font-size: 12px; padding: 0px 20px; margin-bottom: 10px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
        ${t.cancelNote}
      </p>
      <a href="${cancellationLink}" style="color: #B66676; text-decoration: underline; font-size: 12px;">
        ${t.btnCancel}
      </a>
    </div>
  `;
      strapi.log.info(
        `[${triggerSource}][${documentId}] Attempting to send ${statusType} email to: ${entry.customer.email} (Language: ${isKhmer ? "Khmer" : "English"})`,
      );

      // --- INVIO MAIL ---
      await strapi.plugin("email").service("email").send({
        to: entry.customer.email,
        from: "lotus.dream.cambodia@gmail.com",
        replyTo: "lotus.dream.cambodia@gmail.com",
        bcc: "lotus.dream.cambodia@gmail.com",
        subject: emailConfig.subject,
        text: emailConfig.text,
        html: `
          <div style="background-color: #1a2a3a; padding: 40px 0; width: 100%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div style="background-color: #1a2a3a; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
              
              <div style="text-align: center; padding: 30px 0 10px 0;">
                <img src="${logoUrl}" alt="Lotus Dream Spa" style="width: 120px; height: auto;" />
              </div>

              <div style="text-align: center; padding: 0 20px;">
                <h2 style="color: ${emailConfig.titleColor}; margin-bottom: 10px; font-size: 32px; font-family: ${isKhmer ? "'Hanuman', serif" : "inherit"};">${emailConfig.title}</h2>
                <p style="color: #ffffff; font-size: 17px; margin-top: 0; line-height: 1.5; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">${emailConfig.message}</p>
              </div>

              <div style="padding: 24px 15px;"> 
                <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 24px 8px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                  ${detailsHtml}
                </div>
              </div>

              <div style="text-align: center; padding-bottom: 40px; padding-left: 20px; padding-right: 20px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : "inherit"};">
                ${actionFooterHtml}
              </div>

            </div> 
            
            <div style="text-align: center; color: #aab8c2; font-size: 13px; margin-top: 30px;">
              <p><strong>Lotus Dream Spa</strong></p>
              <p style="margin-bottom: 4px; margin-block-end: 4px;">676 Hap Guan St, Krong Siem Reap</p> 
              <p style="margin-top: 0px; margin-block-start: 0px;">17252, Siem Reap, Cambodia</p>
            </div>

            ${cancelLinkHtml}
          </div>`,
      });

      strapi.log.info(
        `[${triggerSource}][${documentId}] Spa ${statusType} Email successfully sent to ${entry.customer.email}`,
      );
    } else {
      strapi.log.warn(`[${triggerSource}][${documentId}] Cannot send email: customer email not found for booking.`);
    }
  } catch (err) {
    strapi.log.error(`[${triggerSource}][${documentId}] Critical error while sending Spa ${statusType} email:`, err);
  }
};

module.exports = {
  async afterCreate(event) {
    const { result, params } = event;
    const status = params.data?.bookingStatus || result.bookingStatus;

    // In Strapi 5, publishing a draft triggers afterCreate for the published version.
    if (result.publishedAt) {
      // Se è il momento della pubblicazione:
      if (status === "confirmed") {
        strapi.log.info(`--- [afterCreate][${result.documentId}] Triggering confirmation email (PUBLISHED) ---`);
        await sendBookingEmail(result.documentId, "confirmed", "afterCreate");
      } else if (status === "cancelled") {
        strapi.log.info(`--- [afterCreate][${result.documentId}] Triggering cancellation email (PUBLISHED) ---`);
        await sendBookingEmail(result.documentId, "cancelled", "afterCreate");
      } else if (status === "created") {
        // Evitiamo il duplicato per 'created': se è appena stato pubblicato, non inviamo di nuovo
        // perché lo abbiamo già inviato al momento della creazione della bozza (afterCreate DRAFT)
        strapi.log.info(`--- [afterCreate][${result.documentId}] Contact request email skipped during publish to avoid duplicate ---`);
      }
    } else {
      // Se è una bozza (appena creata):
      if (status === "created") {
        strapi.log.info(`--- [afterCreate][${result.documentId}] Triggering contact request email (DRAFT creation) ---`);
        await sendBookingEmail(result.documentId, "created", "afterCreate");
      } else {
        strapi.log.info(`--- [afterCreate][${result.documentId}] Email skipped for status ${status} (DRAFT) ---`);
      }
    }
  },

  async beforeUpdate(event) {
    const { params } = event;
    try {
      const documentId = params.where.documentId || params.data?.documentId || params.where.id;
      if (!documentId) return;

      // Cerchiamo la versione PUBBLICATA attuale per vedere se lo stato sta cambiando rispetto a quello che il cliente sa
      const existingEntry = await strapi.documents("api::booking.booking").findOne({
        documentId: documentId,
        status: 'published',
      });
      
      // Se non esiste una versione pubblicata, prendiamo la bozza come backup per il confronto
      if (!existingEntry) {
        const draftEntry = await strapi.documents("api::booking.booking").findOne({
          documentId: documentId,
          status: 'draft',
        });
        event.state = draftEntry;
      } else {
        event.state = existingEntry;
      }
    } catch (err) {
      strapi.log.error("Error in beforeUpdate while fetching existing entry:", err);
    }
  },

  async afterUpdate(event) {
    const { result, params, state } = event;

    const newStatus = params.data?.bookingStatus;
    const oldStatus = state?.bookingStatus;

    if (newStatus === undefined) return;

    if (newStatus === oldStatus) {
      // Usiamo debug o info a seconda di quanto vogliamo essere logorroici
      strapi.log.debug(`[afterUpdate][${result.documentId}] Status unchanged (${newStatus}), skipping email.`);
      return;
    }

    strapi.log.info(`--- [afterUpdate][${result.documentId}] Status changed from ${oldStatus} to ${newStatus}. Triggering Email... ---`);
    
    // Per Confirmed e Cancelled, inviamo solo se il record è pubblicato (o sta venendo pubblicato ora)
    if (newStatus === "confirmed" || newStatus === "cancelled") {
      if (result.publishedAt) {
        await sendBookingEmail(result.documentId, newStatus, "afterUpdate");
      } else {
        strapi.log.info(`--- [afterUpdate][${result.documentId}] ${newStatus} email skipped (Record is DRAFT) ---`);
      }
    } else if (newStatus === "created") {
      await sendBookingEmail(result.documentId, "created", "afterUpdate");
    }
  },
};



