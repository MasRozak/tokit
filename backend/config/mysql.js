const mysql = require('mysql2/promise');

console.log('🔍 Environment variables:');
console.log('Development vars:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME
});
console.log('Railway vars:', {
  MYSQLHOST: process.env.MYSQLHOST,
  MYSQLPORT: process.env.MYSQLPORT,
  MYSQLUSER: process.env.MYSQLUSER,
  MYSQLDATABASE: process.env.MYSQLDATABASE
});

// Determine if we're in production (Railway)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT || process.env.MYSQLHOST;

const config = {
  host: isProduction ? 
    (process.env.MYSQLHOST || process.env.DB_HOST) : 
    (process.env.DB_HOST || 'localhost'),
  port: parseInt(isProduction ? 
    (process.env.MYSQLPORT || process.env.DB_PORT || '3306') : 
    (process.env.DB_PORT || '3307')),
  user: isProduction ? 
    (process.env.MYSQLUSER || process.env.DB_USER) : 
    (process.env.DB_USER || 'root'),
  password: isProduction ? 
    (process.env.MYSQLPASSWORD || process.env.DB_PASSWORD) : 
    (process.env.DB_PASSWORD || ''),
  database: isProduction ? 
    (process.env.MYSQLDATABASE || process.env.DB_NAME) : 
    (process.env.DB_NAME || 'sbdjaya'),

  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,  ssl: isProduction ? { rejectUnauthorized: false } : false
};

console.log('🌍 Environment detected:', isProduction ? 'production' : 'development');
console.log('🔧 MySQL config:', config);

let pool;
if (process.env.MYSQL_URL) {
  pool = mysql.createPool(process.env.MYSQL_URL);
} else {
  pool = mysql.createPool(config);
}

const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    const host = config.host || 'from URL';
    console.log(`✅ MySQL connected to ${host}`);
    connection.release();
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error.message);
    console.log("Current MySQL config:", {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      hasPassword: !!config.password
    });
  }
}

module.exports = {  pool, connectMySQL };
