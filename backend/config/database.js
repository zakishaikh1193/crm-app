import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_new',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
   await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.query(`USE \`${dbConfig.database}\``);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role ENUM('admin', 'manager', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create companies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        website VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(191),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        custom_fields JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_industry (industry)
      )
    `);

    // Create contacts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT,
        owner_id INT NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        full_name VARCHAR(200),
        email VARCHAR(191),
        phone VARCHAR(50),
        mobile VARCHAR(50),
        job_title VARCHAR(100),
        department VARCHAR(100),
        company_name VARCHAR(255),
        company_email VARCHAR(191),
        company_phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        lead_source VARCHAR(100),
        lead_status ENUM('new', 'contacted', 'qualified', 'unqualified', 'customer') DEFAULT 'new',
        data_quality_status ENUM('good', 'needs_review', 'poor') DEFAULT 'needs_review',
        notes TEXT,
        tags VARCHAR(500),
        custom_fields JSON,
        is_merged BOOLEAN DEFAULT FALSE,
        merged_into_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (merged_into_id) REFERENCES contacts(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_full_name (full_name),
        INDEX idx_company_id (company_id),
        INDEX idx_owner_id (owner_id),
        INDEX idx_lead_status (lead_status)
      )
    `);

    // Create contact_interactions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_interactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact_id INT NOT NULL,
        user_id INT NOT NULL,
        interaction_type ENUM('call', 'email', 'meeting', 'note', 'task') NOT NULL,
        subject VARCHAR(255),
        description TEXT,
        interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        follow_up_date TIMESTAMP NULL,
        status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_contact_id (contact_id),
        INDEX idx_interaction_date (interaction_date)
      )
    `);

    console.log('✅ Database tables initialized successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

// Initialize database on startup
testConnection().then(() => {
  initializeDatabase();
});

export default pool;