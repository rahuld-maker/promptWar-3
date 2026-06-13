import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger.js';

dotenv.config();

const parseServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return {
      ...parsed,
      private_key: parsed.private_key?.replace(/\\n/g, '\n'),
    };
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const absolutePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const rawData = fs.readFileSync(absolutePath, 'utf8');
    const parsed = JSON.parse(rawData);
    return {
      ...parsed,
      private_key: parsed.private_key?.replace(/\\n/g, '\n'),
    };
  }

  return null;
};

let initialized = false;

try {
  const serviceAccount = parseServiceAccount();

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('Firebase Admin SDK initialized with service account credentials.');
  } else {
    admin.initializeApp();
    logger.info('Firebase Admin SDK initialized using application default credentials.');
  }

  initialized = true;
} catch (error) {
  if (process.env.NODE_ENV === 'production') {
    logger.warn('Firebase Admin SDK production fallback failed; continuing with Cloud Run default credentials if available.', {
      message: error.message,
    });
  } else {
    logger.warn('Firebase Admin SDK initialization warning.', { message: error.message });
  }
}

if (!initialized && process.env.NODE_ENV !== 'production') {
  logger.warn('Firebase Admin SDK did not initialize fully in non-production mode.');
}

export default admin;
