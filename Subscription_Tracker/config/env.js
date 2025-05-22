import {config} from 'dotenv';

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {PORT, NODE_ENV,
    DB_URI, SERVER_URL,
    JWT_SECRET, JWT_Expires_IN,
    ARCJET_KEY, ARCJET_ENV,
    QSTASH_URI, QSTASH_TOKEN,
    EMAIL_PASSWORD} = process.env;
