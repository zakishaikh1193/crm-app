import { getDatabase } from '../config/database.js';

// Get all companies (for dropdowns)
export const getCompanies = async (req, res) => {
  try {
    const db = getDatabase();
    const companies = await db.all(
      'SELECT id, name, industry, website, email, phone FROM companies ORDER BY name'
    );

    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Get single company
export const getCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const company = await db.get(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Parse custom_fields JSON
    if (company.custom_fields) {
      try {
        company.custom_fields = JSON.parse(company.custom_fields);
      } catch (e) {
        company.custom_fields = {};
      }
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

// Create company
export const createCompany = async (req, res) => {
  try {
    const {
      name,
      industry,
      website,
      phone,
      email,
      address,
      city,
      state,
      postal_code,
      country,
      ...customFields
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Prepare custom_fields JSON
    const customFieldsJson = Object.keys(customFields).length > 0 
      ? JSON.stringify(customFields) 
      : null;

    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO companies (
        name, industry, website, phone, email, address, 
        city, state, postal_code, country, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        industry || null,
        website || null,
        phone || null,
        email || null,
        address || null,
        city || null,
        state || null,
        postal_code || null,
        country || null,
        customFieldsJson
      ]
    );

    // Fetch created company
    const company = await db.get(
      'SELECT * FROM companies WHERE id = ?',
      [result.lastID]
    );

    if (company.custom_fields) {
      try {
        company.custom_fields = JSON.parse(company.custom_fields);
      } catch (e) {
        company.custom_fields = {};
      }
    }

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      industry,
      website,
      phone,
      email,
      address,
      city,
      state,
      postal_code,
      country,
      ...customFields
    } = req.body;

    const db = getDatabase();

    // Check if company exists
    const existingCompany = await db.get(
      'SELECT id FROM companies WHERE id = ?',
      [id]
    );

    if (!existingCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Prepare custom_fields JSON
    const customFieldsJson = Object.keys(customFields).length > 0 
      ? JSON.stringify(customFields) 
      : null;

    await db.run(
      `UPDATE companies SET 
        name = ?, industry = ?, website = ?, phone = ?, email = ?, 
        address = ?, city = ?, state = ?, postal_code = ?, country = ?, 
        custom_fields = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        industry || null,
        website || null,
        phone || null,
        email || null,
        address || null,
        city || null,
        state || null,
        postal_code || null,
        country || null,
        customFieldsJson,
        id
      ]
    );

    // Fetch updated company
    const company = await db.get(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    if (company.custom_fields) {
      try {
        company.custom_fields = JSON.parse(company.custom_fields);
      } catch (e) {
        company.custom_fields = {};
      }
    }

    res.json({
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if company exists
    const existingCompany = await db.get(
      'SELECT id FROM companies WHERE id = ?',
      [id]
    );

    if (!existingCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if company has associated contacts
    const contactCount = await db.get(
      'SELECT COUNT(*) as count FROM contacts WHERE company_id = ?',
      [id]
    );

    if (contactCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete company with associated contacts. Please remove or reassign contacts first.' 
      });
    }

    await db.run('DELETE FROM companies WHERE id = ?', [id]);

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};