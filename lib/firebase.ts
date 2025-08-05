import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let db: Firestore;

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY as string);

  initializeApp({
    credential: cert(serviceAccount),
  });

  db = getFirestore();
} else {
  db = getFirestore();
}

export default db;
