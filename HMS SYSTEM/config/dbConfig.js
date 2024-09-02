require('dotenv').config();

const dbConfig = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    database: process.env.DATABASE_NAME,
    options: {
        encrypt: true, // Use encryption for Azure SQL
        trustServerCertificate: false // Set to true if using a self-signed certificate
    },
};

module.exports = dbConfig;
