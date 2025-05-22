import {config} from 'dotenv';

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {PORT, NODE_ENV, DB_URI, SERVER_URL,
    JWT_SECRET, JWT_Expires_IN,
    ARCJET_ENV, ARCJET_KEY} = process.env;
