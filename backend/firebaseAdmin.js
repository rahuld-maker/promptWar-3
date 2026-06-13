import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

try {
  const serviceAccount = parseServiceAccount();

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK: Initialized with service account credentials.');
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Firebase Admin credentials are required in production.');
  } else {
    admin.initializeApp();
    console.log('Firebase Admin SDK: Initialized using application default credentials.');
  }
} catch (error) {
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }

  console.warn('Firebase Admin SDK initialization warning:', error.message);
}

export default admin;
