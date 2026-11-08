import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  trustName: 'Company A Charitable Trust',
  trustNameHi: 'कंपनी A चैरिटेबल ट्रस्ट',
  trustPan: 'AAATC1234A',
  trust80GNumber: '80G/2024-25/AAATC1234A/12345',
  trustAddress: 'Bhopal, Madhya Pradesh',
  helplineNumber: '1800-XXX-XXXX',
};
