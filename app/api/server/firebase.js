const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db;

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

  initializeApp({
    credential: cert(serviceAccount),
  });
  
  db = getFirestore();
} else {
  db = getFirestore();
}

module.exports = db;
