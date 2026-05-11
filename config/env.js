const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const requiredVariables = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'DB_FILE',
    'AUTH_USER_FILE',
    'JSON_BODY_LIMIT'
];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
    console.error('\nMissing required environment variables:');
    missingVariables.forEach((name) => console.error(`- ${name}`));
    console.error('\nCreate a .env file from .env.example before starting the server.\n');
    process.exit(1);
}

const env = {
    nodeEnv: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    dbFile: path.resolve(__dirname, '..', process.env.DB_FILE),
    authUserFile: path.resolve(__dirname, '..', process.env.AUTH_USER_FILE),
    jsonBodyLimit: process.env.JSON_BODY_LIMIT
};

if (!Number.isInteger(env.port) || env.port <= 0) {
    console.error('\nInvalid PORT. Please set PORT to a positive integer in .env.\n');
    process.exit(1);
}

module.exports = env;
