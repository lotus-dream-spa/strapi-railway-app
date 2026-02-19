// Funzione "Smart" per gestire sia Conferme che Cancellazioni con supporto Multi-lingua (EN/KH)
const sendBookingEmail = async (bookingId, statusType) => {
  try {
    const entry = await strapi.entityService.findOne('api::booking.booking', bookingId, {
      populate: ['customer', 'treatment'],
    });

    if (entry && entry.customer && entry.customer.email) {
      
      // --- 1. RILEVAMENTO LINGUA ---
      const isKhmer = entry.customer.isKhmer === true; // Default false se null/undefined

      // --- 2. DIZIONARIO TRADUZIONI ---
      const translations = {
        en: {
          subjectConf: 'Booking Confirmed - Lotus Dream Spa 🌸',
          subjectCanc: 'Booking Cancelled - Lotus Dream Spa ❌',
          titleConf: 'Booking Confirmed',
          titleCanc: 'Booking Cancelled',
          msgConf: `We are looking forward to see you, ${entry.customer.name ?? 'dear Guest'}.`,
          msgCanc: `Hello ${entry.customer.name ?? 'dear Guest'}, your appointment has been cancelled as requested.`,
          textConf: `Dear ${entry.customer.name ?? 'dear Guest'}, your appointment is confirmed.`,
          textCanc: `Dear ${entry.customer.name ?? 'dear Guest'}, your appointment has been cancelled.`,
          detailsHeader: 'Appointment Details',
          labelTreatment: 'Treatment',
          labelDate: 'Date',
          labelTime: 'Time',
          labelDuration: 'Duration',
          labelPrice: 'Price',
          checkReception: 'Check at reception',
          mins: 'mins',
          footerCanc: '"Feel free to reach us whenever you want again."',
          btnDirections: '📍 Get Directions'
        },
        kh: {
          subjectConf: 'ការកក់ត្រូវបានបញ្ជាក់ - Lotus Dream Spa 🌸',
          subjectCanc: 'ការកក់ត្រូវបានលុបចោល - Lotus Dream Spa ❌',
          titleConf: 'ការកក់ត្រូវបានបញ្ជាក់', // Booking Confirmed
          titleCanc: 'ការកក់ត្រូវបានលុបចោល', // Booking Cancelled
          msgConf: `យើងកំពុងរង់ចាំអ្នក, ${entry.customer.name ?? 'ភ្ញៀវ'}.`, // We are waiting for you...
          msgCanc: `សួស្តី ${entry.customer.name ?? 'ភ្ញៀវ'}, ការណាត់ជួបរបស់អ្នកត្រូវបានលុបចោលតាមសំណើ។`, // Appt cancelled...
          textConf: `សួស្តី ${entry.customer.name ?? 'ភ្ញៀវ'}, ការណាត់ជួបរបស់អ្នកត្រូវបានបញ្ជាក់។`,
          textCanc: `សួស្តី ${entry.customer.name ?? 'ភ្ញៀវ'}, ការណាត់ជួបរបស់អ្នកត្រូវបានលុបចោល។`,
          detailsHeader: 'ព័ត៌មានលម្អិតនៃការណាត់ជួប', // Appointment Details
          labelTreatment: 'ការព្យាបាល', // Treatment
          labelDate: 'កាលបរិច្ឆេទ', // Date
          labelTime: 'ម៉ោង', // Time
          labelDuration: 'រយៈពេល', // Duration
          labelPrice: 'តម្លៃ', // Price
          checkReception: 'សាកសួរនៅកន្លែងទទួលភ្ញៀវ', // Check at reception
          mins: 'នាទី', // mins
          footerCanc: '"សូមទាក់ទងមកយើងខ្ញុំគ្រប់ពេលដែលអ្នកត្រូវការ។"', // Feel free to reach us...
          btnDirections: '📍 មើលទីតាំង' // Get Directions
        }
      };

      // Seleziona la lingua corretta
      const t = isKhmer ? translations.kh : translations.en;

      // --- DATI BASE FORMATTATI ---
      const treatmentName = entry.treatment ? entry.treatment.title : (isKhmer ? 'ម៉ាស្សាទូទៅ' : 'General Massage');
      const bookingPrice = entry.price ? `$${entry.price}` : t.checkReception;
      const bookingDuration = entry.duration ? `${entry.duration} ${t.mins}` : '-';
      const bookingDate = entry.date || 'TBD'; 
      const bookingTime = entry.time ? entry.time.slice(0, 5) : 'TBD';
      
      const logoUrl = 'https://respected-cherry-3bae02ef27.media.strapiapp.com/logo_a65400de7e.png'; 
      const mapLink = "https://www.google.com/maps/search/?api=1&query=Lotus+Dream+Spa+Siem+Reap";

      // --- LOGICA CONDIZIONALE STATO (Confirmed/Cancelled) ---
      const isCancelled = statusType === 'cancelled';

      const emailConfig = {
        subject: isCancelled ? t.subjectCanc : t.subjectConf,
        title: isCancelled ? t.titleCanc : t.titleConf,
        titleColor: isCancelled ? '#B66676' : '#D8975D', // Rosso o Verde
        message: isCancelled ? t.msgCanc : t.msgConf,
        text: isCancelled ? t.textCanc : t.textConf
      };

      // 1. LOGICA PREZZO: Se cancellato stringa vuota, altrimenti riga tabella
      const priceRowHtml = isCancelled ? '' : `
        <tr>
          <td style="padding: 10px 0; color: #888; border-top: 1px solid #f5f5f5;">${t.labelPrice}</td>
          <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #d63384; border-top: 1px solid #f5f5f5;">${bookingPrice}</td>
        </tr>
      `;

      // 2. LOGICA FOOTER: Se cancellato testo cortesia, altrimenti bottone mappa
      const actionFooterHtml = isCancelled 
        ? `<p style="color: #8ab4f8; font-size: 24px; margin: 0; font-style: italic;">${t.footerCanc}</p>`
        : `<a href="${mapLink}" target="_blank" style="background-color: #D8975D; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block;">${t.btnDirections}</a>`;


      console.log(`Sending ${statusType} email to: ${entry.customer.email} (Language: ${isKhmer ? 'Khmer' : 'English'})`);

      // --- INVIO MAIL ---
      await strapi.plugins['email'].services.email.send({
        to: entry.customer.email,
    from: 'lotus.dream.cambodia@gmail.com', 
  replyTo: 'lotus.dream.cambodia@gmail.com',
  bcc: 'lotus.dream.cambodia@gmail.com',
        
        subject: emailConfig.subject,
        text: emailConfig.text,
        
        html: `
          <div style="background-color: #1f3a5c; padding: 40px 0; width: 100%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            
            <div style="background-color: #1f3a5c; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              
              <div style="text-align: center; padding: 30px 0 10px 0;">
                <img src="${logoUrl}" alt="Lotus Dream Spa" style="width: 100px; height: auto;" />
              </div>

              <div style="text-align: center; padding: 0 20px;">
                <h2 style="color: ${emailConfig.titleColor}; margin-bottom: 5px; font-size: 32px; font-family: ${isKhmer ? "'Hanuman', serif" : 'inherit'};">${emailConfig.title}</h2>
                <p style="color: #ffffff; font-size: 16px; margin-top: 0; font-family: ${isKhmer ? "'Hanuman', sans-serif" : 'inherit'};">${emailConfig.message}</p>
              </div>

              <div style="padding: 20px 40px;">
                <div style="background-color: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                  <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : 'inherit'};">${t.detailsHeader}</h3>
                  
                  <table style="width: 100%; border-collapse: collapse; font-size: 15px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : 'inherit'};">
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
                </div>
              </div>

              <div style="text-align: center; padding-bottom: 40px; padding-left: 20px; padding-right: 20px; font-family: ${isKhmer ? "'Hanuman', sans-serif" : 'inherit'};">
                ${actionFooterHtml}
              </div>

            </div> 
            
            <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              <p><strong>Lotus Dream Spa</strong><br>676 Hap Guan St, Krong Siem Reap 17252, Siem Reap, Cambodia</p>
            </div>

          </div>`,
      });

      strapi.log.info(`Spa ${statusType} Email sent to ${entry.customer.email}`);
    }
  } catch (err) {
    strapi.log.error(`Error sending Spa ${statusType} email:`, err);
  }
};

module.exports = {
  async afterCreate(event) {
    const { result, params } = event;
    const status = result.bookingStatus || (params.data && params.data.bookingStatus);

    if (status === 'confirmed') await sendBookingEmail(result.id, 'confirmed');
    // Non mandiamo email 'cancelled' alla creazione, non ha senso logico, ma se serve lascialo
  },

  // Usiamo beforeUpdate per salvare lo stato VECCHIO
  async beforeUpdate(event) {
    const { params } = event;
    
    // Cerchiamo l'entità com'è ADESSO nel database
    const existingEntry = await strapi.entityService.findOne('api::booking.booking', params.where.id);
    
    // Salviamo lo stato attuale dentro l'evento per usarlo dopo
    event.state = existingEntry;
  },

  async afterUpdate(event) {
    const { result, params, state } = event; // 'state' contiene i dati salvati in beforeUpdate
    
    const newStatus = params.data && params.data.bookingStatus;
    const oldStatus = state && state.bookingStatus;

    // ESEGUIAMO SOLO SE LO STATO È CAMBIATO
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'confirmed') await sendBookingEmail(result.id, 'confirmed');
      if (newStatus === 'cancelled') await sendBookingEmail(result.id, 'cancelled');
    }
  },
};