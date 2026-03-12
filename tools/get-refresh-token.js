const { google } = require('googleapis');
const readline = require('readline');

/**
 * Script per generare un nuovo Refresh Token per Gmail OAuth2.
 * Istruzioni:
 * 1. Assicurati di avere GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET dal Google Cloud Console.
 * 2. Esegui questo script: node tools/get-refresh-token.js
 * 3. Segui il link, autorizza l'app e incolla il codice ricevuto.
 */

const CLIENT_ID = 'INSERISCI_QUI_IL_TUO_CLIENT_ID'; 
const CLIENT_SECRET = 'INSERISCI_QUI_IL_TUO_CLIENT_SECRET';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'; // O il tuo redirect URI configurato

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://mail.google.com/'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Necessario per forzare la generazione del refresh token
});

console.log('1. Apri questo URL nel browser:\n');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n2. Incolla qui il codice autorizzazione (dopo il redirect): ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n--- TOKEN OTTENUTI ---');
    console.log(JSON.stringify(tokens, null, 2));
    console.log('\n--- COPIARE IL "refresh_token" NEL FILE .env ---');
  } catch (err) {
    console.error('Errore durante il recupero del token:', err.response.data);
  }
});
