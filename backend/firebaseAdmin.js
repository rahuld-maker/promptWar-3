import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let serviceAccount = null;

// Resolve Service Account Credentials
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON variable:', err);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    const absolutePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const rawData = fs.readFileSync(absolutePath, 'utf8');
    serviceAccount = JSON.parse(rawData);
  } catch (err) {
    console.error(`Failed to read service account file at: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}`, err);
  }
}

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK: Initialized with service account credentials.');
  } else {
    // Fallback to application default credentials (ADC)
    admin.initializeApp();
    console.log('Firebase Admin SDK: Initialized using application default credentials.');
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization warning:', error.message);
  console.log('Firebase Admin SDK running in uninitialized/mock configuration.');
}

export default admin;
