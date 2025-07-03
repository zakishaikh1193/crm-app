import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbPath = path.join(__dirname, '../data/crm.db');

let db = null;

// Initialize database connection
export async function initializeDatabase() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dbPath);
    const fs = await import('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Open database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create tables
    await createTables();

    console.log('✅ Database connected and initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

async function createTables() {
  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create companies table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT,
      website TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      custom_fields TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create contacts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      owner_id INTEGER NOT NULL,
      first_name TEXT,
      last_name TEXT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      mobile TEXT,
      job_title TEXT,
      department TEXT,
      company_name TEXT,
      company_email TEXT,
      company_phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      lead_source TEXT,
      lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'unqualified', 'customer')),
      data_quality_status TEXT DEFAULT 'needs_review' CHECK (data_quality_status IN ('good', 'needs_review', 'poor')),
      notes TEXT,
      tags TEXT,
      custom_fields TEXT,
      is_merged BOOLEAN DEFAULT FALSE,
      merged_into_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (merged_into_id) REFERENCES contacts(id) ON DELETE SET NULL
    )
  `);

  // Create contact_interactions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contact_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      interaction_type TEXT NOT NULL CHECK (interaction_type IN ('call', 'email', 'meeting', 'note', 'task')),
      subject TEXT,
      description TEXT,
      interaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      follow_up_date DATETIME,
      status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
    CREATE INDEX IF NOT EXISTS idx_contacts_full_name ON contacts(full_name);
    CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_lead_status ON contacts(lead_status);
    CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
    CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
    CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON contact_interactions(contact_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_date ON contact_interactions(interaction_date);
  `);
}

// Test database connection
export async function testConnection() {
  try {
    if (!db) {
      await initializeDatabase();
    }
    await db.get('SELECT 1');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

// Get database instance
export function getDatabase() {
  return db;
}

// Initialize database on startup
initializeDatabase();

export default db;