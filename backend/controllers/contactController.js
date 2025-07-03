import pool from '../config/database.js';

// Get all available fields for mapping
export const getContactFields = async (req, res) => {
  try {
    // Standard fields from the contacts table schema
    const standardFields = [
      { value: 'first_name', label: 'First Name' },
      { value: 'last_name', label: 'Last Name' },
      { value: 'full_name', label: 'Full Name' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'mobile', label: 'Mobile' },
      { value: 'job_title', label: 'Job Title' },
      { value: 'department', label: 'Department' },
      { value: 'company_name', label: 'Company Name' },
      { value: 'company_email', label: 'Company Email' },
      { value: 'company_phone', label: 'Company Phone' },
      { value: 'address', label: 'Address' },
      { value: 'city', label: 'City' },
      { value: 'state', label: 'State' },
      { value: 'postal_code', label: 'Postal Code' },
      { value: 'country', label: 'Country' },
      { value: 'lead_source', label: 'Lead Source' },
      { value: 'lead_status', label: 'Lead Status' },
      { value: 'notes', label: 'Notes' },
      { value: 'tags', label: 'Tags' }
    ];

    // Get custom fields from existing contacts
    const [contacts] = await pool.execute(
      'SELECT custom_fields FROM contacts WHERE custom_fields IS NOT NULL AND custom_fields != "" LIMIT 100'
    );

    const customFields = new Set();
    
    contacts.forEach(contact => {
      try {
        const fields = JSON.parse(contact.custom_fields);
        Object.keys(fields).forEach(key => {
          customFields.add(key);
        });
      } catch (e) {
        // Skip invalid JSON
      }
    });

    const customFieldOptions = Array.from(customFields).map(field => ({
      value: `custom_fields.${field}`,
      label: `Custom: ${field}`
    }));

    const allFields = [...standardFields, ...customFieldOptions];

    res.json({ fields: allFields });
  } catch (error) {
    console.error('Get contact fields error:', error);
    res.status(500).json({ error: 'Failed to fetch contact fields' });
  }
};

// Get all contacts
export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_merged = FALSE';
    const params = [];

    if (search) {
      whereClause += ` AND (
        full_name LIKE ? OR 
        email LIKE ? OR 
        company_name LIKE ? OR 
        phone LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      whereClause += ' AND lead_status = ?';
      params.push(status);
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM contacts ${whereClause}`,
      params
    );

    // Ensure limit and offset are always valid integers
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    console.log('params:', params, 'limit:', safeLimit, 'offset:', safeOffset);

    // Get contacts with pagination
    const [contacts] = await pool.execute(
      `SELECT 
        c.*,
        comp.name as company_name_resolved,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON c.owner_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    // Parse custom_fields for each contact
    const processedContacts = contacts.map(contact => {
      if (contact.custom_fields) {
        try {
          contact.custom_fields = JSON.parse(contact.custom_fields);
        } catch (e) {
          contact.custom_fields = {};
        }
      }
      return contact;
    });

    res.json({
      contacts: processedContacts,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: countResult[0].total,
        total_pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

// Get single contact
export const getContact = async (req, res) => {
  try {
    const { id } = req.params;

    const [contacts] = await pool.execute(
      `SELECT 
        c.*,
        comp.name as company_name_resolved,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = contacts[0];
    
    // Parse custom_fields JSON
    if (contact.custom_fields) {
      try {
        contact.custom_fields = JSON.parse(contact.custom_fields);
      } catch (e) {
        contact.custom_fields = {};
      }
    }

    res.json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

// Create contact
export const createContact = async (req, res) => {
  try {
    const {
      company_id,
      first_name,
      last_name,
      full_name,
      email,
      phone,
      mobile,
      job_title,
      department,
      company_name,
      company_email,
      company_phone,
      address,
      city,
      state,
      postal_code,
      country,
      lead_source,
      lead_status = 'new',
      notes,
      tags,
      ...customFields
    } = req.body;

    // Set owner_id from authenticated user
    const owner_id = req.user.id;

    // Auto-generate full_name if not provided
    let finalFullName = full_name;
    if (!finalFullName && (first_name || last_name)) {
      finalFullName = [first_name, last_name].filter(Boolean).join(' ');
    }

    // Prepare custom_fields JSON
    const customFieldsJson = Object.keys(customFields).length > 0 
      ? JSON.stringify(customFields) 
      : null;

    const [result] = await pool.execute(
      `INSERT INTO contacts (
        company_id, owner_id, first_name, last_name, full_name, email, phone, mobile,
        job_title, department, company_name, company_email, company_phone,
        address, city, state, postal_code, country, lead_source, lead_status,
        notes, tags, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id || null,
        owner_id,
        first_name || null,
        last_name || null,
        finalFullName || null,
        email || null,
        phone || null,
        mobile || null,
        job_title || null,
        department || null,
        company_name || null,
        company_email || null,
        company_phone || null,
        address || null,
        city || null,
        state || null,
        postal_code || null,
        country || null,
        lead_source || null,
        lead_status,
        notes || null,
        tags || null,
        customFieldsJson
      ]
    );

    // Fetch created contact
    const [contacts] = await pool.execute(
      `SELECT 
        c.*,
        comp.name as company_name_resolved,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    const contact = contacts[0];
    if (contact.custom_fields) {
      try {
        contact.custom_fields = JSON.parse(contact.custom_fields);
      } catch (e) {
        contact.custom_fields = {};
      }
    }

    res.status(201).json({
      message: 'Contact created successfully',
      contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

// Update contact
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      first_name,
      last_name,
      full_name,
      email,
      phone,
      mobile,
      job_title,
      department,
      company_name,
      company_email,
      company_phone,
      address,
      city,
      state,
      postal_code,
      country,
      lead_source,
      lead_status,
      notes,
      tags,
      ...customFields
    } = req.body;

    // Check if contact exists and user has permission
    const [existingContacts] = await pool.execute(
      'SELECT id, owner_id FROM contacts WHERE id = ?',
      [id]
    );

    if (existingContacts.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check ownership (only allow update if user is owner or admin/manager)
    const contact = existingContacts[0];
    if (contact.owner_id !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own contacts.' });
    }

    // Auto-generate full_name if not provided
    let finalFullName = full_name;
    if (!finalFullName && (first_name || last_name)) {
      finalFullName = [first_name, last_name].filter(Boolean).join(' ');
    }

    // Prepare custom_fields JSON
    const customFieldsJson = Object.keys(customFields).length > 0 
      ? JSON.stringify(customFields) 
      : null;

    await pool.execute(
      `UPDATE contacts SET 
        company_id = ?, first_name = ?, last_name = ?, full_name = ?, email = ?, 
        phone = ?, mobile = ?, job_title = ?, department = ?, company_name = ?, 
        company_email = ?, company_phone = ?, address = ?, city = ?, state = ?, 
        postal_code = ?, country = ?, lead_source = ?, lead_status = ?, 
        notes = ?, tags = ?, custom_fields = ?
      WHERE id = ?`,
      [
        company_id || null,
        first_name || null,
        last_name || null,
        finalFullName || null,
        email || null,
        phone || null,
        mobile || null,
        job_title || null,
        department || null,
        company_name || null,
        company_email || null,
        company_phone || null,
        address || null,
        city || null,
        state || null,
        postal_code || null,
        country || null,
        lead_source || null,
        lead_status || null,
        notes || null,
        tags || null,
        customFieldsJson,
        id
      ]
    );

    // Fetch updated contact
    const [contacts] = await pool.execute(
      `SELECT 
        c.*,
        comp.name as company_name_resolved,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    const updatedContact = contacts[0];
    if (updatedContact.custom_fields) {
      try {
        updatedContact.custom_fields = JSON.parse(updatedContact.custom_fields);
      } catch (e) {
        updatedContact.custom_fields = {};
      }
    }

    res.json({
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contact exists and user has permission
    const [existingContacts] = await pool.execute(
      'SELECT id, owner_id FROM contacts WHERE id = ?',
      [id]
    );

    if (existingContacts.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check ownership
    const contact = existingContacts[0];
    if (contact.owner_id !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own contacts.' });
    }

    await pool.execute('DELETE FROM contacts WHERE id = ?', [id]);

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

// Bulk import contacts
export const importContacts = async (req, res) => {
  try {
    const { files, mappings } = req.body;
    
    if (!files || !Array.isArray(files) || !mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const owner_id = req.user.id;
    let totalImported = 0;
    const errors = [];

    // Process each file
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const fileData = files[fileIndex];
      const mapping = mappings[fileIndex];

      if (!fileData || !Array.isArray(fileData) || !mapping) {
        errors.push(`File ${fileIndex + 1}: Invalid data format`);
        continue;
      }

      // Process each row in the file
      for (let rowIndex = 0; rowIndex < fileData.length; rowIndex++) {
        const row = fileData[rowIndex];

        try {
          // Build contact object from mapping
          const contactData = {};
          const customFields = {};

          Object.entries(mapping).forEach(([fileColumn, crmField]) => {
            if (crmField && crmField !== '-- Ignore --' && row[fileColumn] !== undefined) {
              if (crmField.startsWith('custom_fields.')) {
                const customFieldName = crmField.replace('custom_fields.', '');
                customFields[customFieldName] = row[fileColumn];
              } else {
                contactData[crmField] = row[fileColumn];
              }
            }
          });

          // Set owner_id
          contactData.owner_id = owner_id;

          // Auto-generate full_name if not provided
          if (!contactData.full_name && (contactData.first_name || contactData.last_name)) {
            contactData.full_name = [contactData.first_name, contactData.last_name].filter(Boolean).join(' ');
          }

          // Set default lead_status
          if (!contactData.lead_status) {
            contactData.lead_status = 'new';
          }

          // Prepare custom_fields JSON
          const customFieldsJson = Object.keys(customFields).length > 0 
            ? JSON.stringify(customFields) 
            : null;

          // --- Company linking/creation logic ---
          let companyIdToUse = null;
          if (contactData.company_name || contactData.company_email) {
            // Try to find existing company by name or email
            let companyQuery = 'SELECT id FROM companies WHERE ';
            const companyParams = [];
            if (contactData.company_name && contactData.company_email) {
              companyQuery += 'name = ? OR email = ?';
              companyParams.push(contactData.company_name, contactData.company_email);
            } else if (contactData.company_name) {
              companyQuery += 'name = ?';
              companyParams.push(contactData.company_name);
            } else if (contactData.company_email) {
              companyQuery += 'email = ?';
              companyParams.push(contactData.company_email);
            }
            const [companies] = await pool.execute(companyQuery, companyParams);
            if (companies.length > 0) {
              companyIdToUse = companies[0].id;
            } else {
              // Create new company
              const [result] = await pool.execute(
                `INSERT INTO companies (
                  name, industry, website, phone, email, address, city, state, postal_code, country, custom_fields
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
                [
                  contactData.company_name || 'Unknown',
                  contactData.industry || null,
                  contactData.website || null,
                  contactData.company_phone || null,
                  contactData.company_email || null,
                  contactData.address || null,
                  contactData.city || null,
                  contactData.state || null,
                  contactData.postal_code || null,
                  contactData.country || null,
                  null // custom_fields
                ]
              );
              companyIdToUse = result.insertId;
            }
          }
          contactData.company_id = companyIdToUse;
          // --- End company linking/creation logic ---

          // Insert contact
          await pool.execute(
            `INSERT INTO contacts (
              company_id, owner_id, first_name, last_name, full_name, email, phone, mobile,
              job_title, department, company_name, company_email, company_phone,
              address, city, state, postal_code, country, lead_source, lead_status,
              notes, tags, custom_fields
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              contactData.company_id || null,
              contactData.owner_id,
              contactData.first_name || null,
              contactData.last_name || null,
              contactData.full_name || null,
              contactData.email || null,
              contactData.phone || null,
              contactData.mobile || null,
              contactData.job_title || null,
              contactData.department || null,
              contactData.company_name || null,
              contactData.company_email || null,
              contactData.company_phone || null,
              contactData.address || null,
              contactData.city || null,
              contactData.state || null,
              contactData.postal_code || null,
              contactData.country || null,
              contactData.lead_source || null,
              contactData.lead_status,
              contactData.notes || null,
              contactData.tags || null,
              customFieldsJson
            ]
          );

          totalImported++;
        } catch (error) {
          errors.push(`File ${fileIndex + 1}, Row ${rowIndex + 1}: ${error.message}`);
        }
      }
    }

    res.json({
      message: 'Import completed',
      total_imported: totalImported,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    res.status(500).json({ error: 'Failed to import contacts' });
  }
};