import pool from '../config/database.js';

// Helper: get all mappable fields from new schema
const getAllMappableFields = () => [
  // Contact fields
  { value: 'first_name', label: 'First Name', group: 'Contact' },
  { value: 'last_name', label: 'Last Name', group: 'Contact' },
  { value: 'title', label: 'Title', group: 'Contact' },
  { value: 'seniority', label: 'Seniority', group: 'Contact' },
  { value: 'stage', label: 'Stage', group: 'Contact' },
  { value: 'lists', label: 'Lists', group: 'Contact' },
  { value: 'last_contacted', label: 'Last Contacted', group: 'Contact' },
  { value: 'person_linkedin_url', label: 'Person Linkedin Url', group: 'Contact' },
  { value: 'contact_owner', label: 'Contact Owner (User ID)', group: 'Contact' },
  { value: 'contact_address', label: 'Personal Address', group: 'Contact' },
  { value: 'contact_city', label: 'Personal City', group: 'Contact' },
  { value: 'contact_state', label: 'Personal State', group: 'Contact' },
  { value: 'contact_country', label: 'Personal Country', group: 'Contact' },
  { value: 'contact_postal_code', label: 'Personal Postal Code', group: 'Contact' },
  // Company fields
  { value: 'company_name', label: 'Company Name', group: 'Company' },
  { value: 'company_website', label: 'Company Website', group: 'Company' },
  { value: 'company_linkedin_url', label: 'Company Linkedin Url', group: 'Company' },
  { value: 'company_facebook_url', label: 'Company Facebook Url', group: 'Company' },
  { value: 'company_twitter_url', label: 'Company Twitter Url', group: 'Company' },
  { value: 'company_industry', label: 'Company Industry', group: 'Company' },
  { value: 'company_num_employees', label: '# Employees', group: 'Company' },
  { value: 'company_annual_revenue', label: 'Annual Revenue', group: 'Company' },
  { value: 'company_total_funding', label: 'Total Funding', group: 'Company' },
  { value: 'company_latest_funding', label: 'Latest Funding', group: 'Company' },
  { value: 'company_latest_funding_amount', label: 'Latest Funding Amount', group: 'Company' },
  { value: 'company_last_raised_at', label: 'Last Raised At', group: 'Company' },
  { value: 'company_address', label: 'Company Address', group: 'Company' },
  { value: 'company_city', label: 'Company City', group: 'Company' },
  { value: 'company_state', label: 'Company State', group: 'Company' },
  { value: 'company_country', label: 'Company Country', group: 'Company' },
  { value: 'company_phone', label: 'Company Phone', group: 'Company' },
  { value: 'company_keywords', label: 'Company Keywords', group: 'Company' },
  // Email fields
  { value: 'email', label: 'Primary Email', group: 'Email' },
  { value: 'email_status', label: 'Email Status', group: 'Email' },
  { value: 'email_source', label: 'Primary Email Source', group: 'Email' },
  { value: 'email_confidence', label: 'Email Confidence', group: 'Email' },
  { value: 'email_catch_all_status', label: 'Primary Email Catch-all Status', group: 'Email' },
  { value: 'email_last_verified_at', label: 'Primary Email Last Verified At', group: 'Email' },
  { value: 'secondary_email', label: 'Secondary Email', group: 'Email' },
  { value: 'secondary_email_source', label: 'Secondary Email Source', group: 'Email' },
  { value: 'tertiary_email', label: 'Tertiary Email', group: 'Email' },
  { value: 'tertiary_email_source', label: 'Tertiary Email Source', group: 'Email' },
  { value: 'personal_email', label: 'Personal Email', group: 'Email' },
  // Phone fields
  { value: 'work_phone', label: 'Work Direct Phone', group: 'Phone' },
  { value: 'home_phone', label: 'Home Phone', group: 'Phone' },
  { value: 'mobile_phone', label: 'Mobile Phone', group: 'Phone' },
  { value: 'corporate_phone', label: 'Corporate Phone', group: 'Phone' },
  { value: 'other_phone', label: 'Other Phone', group: 'Phone' },
  // Department
  { value: 'department', label: 'Department', group: 'Department' },
  // Intent
  { value: 'primary_intent_topic', label: 'Primary Intent Topic', group: 'Intent' },
  { value: 'primary_intent_score', label: 'Primary Intent Score', group: 'Intent' },
  { value: 'secondary_intent_topic', label: 'Secondary Intent Topic', group: 'Intent' },
  { value: 'secondary_intent_score', label: 'Secondary Intent Score', group: 'Intent' },
  // Custom fields and others can be added as needed
];

export const getContactFields = async (req, res) => {
  try {
    res.json({ fields: getAllMappableFields() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact fields' });
  }
};

// Get all contacts
export const getContacts = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM contacts');

    const contactsQuery = `
        SELECT
     c.id AS contact_id,
     c.first_name,
     c.last_name,
     c.title,
     c.seniority,
     c.stage,
     c.lists,
     c.last_contacted,
     c.person_linkedin_url,
     c.contact_owner,
     c.address,
     c.city,
     c.state,
     c.country,
     c.postal_code,
     c.custom_fields,
     c.created_at AS contact_created_at,
     c.updated_at AS contact_updated_at,
     comp.id AS company_id,
     comp.name AS company_name,
     comp.website AS company_website,
     comp.linkedin_url AS company_linkedin_url,
     comp.facebook_url AS company_facebook_url,
     comp.twitter_url AS company_twitter_url,
     comp.industry AS company_industry,
     comp.num_employees AS company_num_employees,
     comp.annual_revenue AS company_annual_revenue,
     comp.total_funding AS company_total_funding,
     comp.latest_funding AS company_latest_funding,
     comp.latest_funding_amount AS company_latest_funding_amount,
     comp.address AS company_address,
     comp.city AS company_city,
     comp.state AS company_state,
     comp.country AS company_country,
     comp.phone AS company_phone,
     d.id AS department_id,
     d.name AS department_name,
     u.id AS owner_id,
     u.first_name AS owner_first_name,
     u.last_name AS owner_last_name,
     u.email AS owner_email,
     u.role AS owner_role
   FROM contacts c
   LEFT JOIN companies comp ON c.company_id = comp.id
   LEFT JOIN departments d ON c.department_id = d.id
   LEFT JOIN users u ON c.owner_id = u.id
   ORDER BY c.created_at DESC
   LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    let contactsResult;
    try {
      contactsResult = await pool.execute(contactsQuery);
      if (!contactsResult || !Array.isArray(contactsResult) || contactsResult.length < 1) {
        throw new Error('contactsResult is invalid');
      }
    } catch (err) {
      console.error('Error executing contacts query:', err);
      return res.status(500).json({ error: 'Contacts query execution failed', details: err.message, full: err });
    }
    const [rows] = contactsResult;
    if (!rows || !Array.isArray(rows)) {
      console.error('contacts is invalid:', rows);
      return res.status(500).json({ error: 'Contacts result invalid', raw: rows });
    }
    // 2. Fetch all emails and phones for these contacts
    const contactIds = rows.map(row => row.contact_id);
    let emailsRows = [], phonesRows = [];
    if (contactIds.length > 0) {
      const [emails] = await pool.execute(
        `SELECT * FROM emails WHERE contact_id IN (${contactIds.map(() => '?').join(',')})`,
        contactIds
      );
      emailsRows = emails;
      const [phones] = await pool.execute(
        `SELECT * FROM phones WHERE contact_id IN (${contactIds.map(() => '?').join(',')})`,
        contactIds
      );
      phonesRows = phones;
    }
    // 3. Map emails and phones to contacts
    const emailsByContact = {};
    emailsRows.forEach(email => {
      if (!emailsByContact[email.contact_id]) emailsByContact[email.contact_id] = [];
      emailsByContact[email.contact_id].push(email);
    });
    const phonesByContact = {};
    phonesRows.forEach(phone => {
      if (!phonesByContact[phone.contact_id]) phonesByContact[phone.contact_id] = [];
      phonesByContact[phone.contact_id].push(phone);
    });
    // 4. Build contacts array
    const contacts = rows.map(row => {
      // Parse custom_fields JSON if present
      let contactCustomFields = row.custom_fields;
      if (contactCustomFields && typeof contactCustomFields === 'string') {
        try { contactCustomFields = JSON.parse(contactCustomFields); } catch { contactCustomFields = {}; }
      }
      let companyCustomFields = row.company_custom_fields;
      if (companyCustomFields && typeof companyCustomFields === 'string') {
        try { companyCustomFields = JSON.parse(companyCustomFields); } catch { companyCustomFields = {}; }
      }
      return {
        id: row.contact_id,
        first_name: row.first_name,
        last_name: row.last_name,
        title: row.title,
        seniority: row.seniority,
        stage: row.stage,
        lists: row.lists,
        last_contacted: row.last_contacted,
        person_linkedin_url: row.person_linkedin_url,
        contact_owner: row.contact_owner,
        address: row.address,
        city: row.city,
        state: row.state,
        country: row.country,
        postal_code: row.postal_code,
        custom_fields: contactCustomFields,
        created_at: row.contact_created_at,
        updated_at: row.contact_updated_at,
        company: row.company_id ? {
          id: row.company_id,
          name: row.company_name,
          website: row.company_website,
          linkedin_url: row.company_linkedin_url,
          facebook_url: row.company_facebook_url,
          twitter_url: row.company_twitter_url,
          industry: row.company_industry,
          num_employees: row.company_num_employees,
          annual_revenue: row.company_annual_revenue,
          total_funding: row.company_total_funding,
          latest_funding: row.company_latest_funding,
          latest_funding_amount: row.company_latest_funding_amount,
          last_raised_at: row.company_last_raised_at,
          address: row.company_address,
          city: row.company_city,
          state: row.company_state,
          country: row.company_country,
          phone: row.company_phone,
          seo_description: row.company_seo_description,
          keywords: row.company_keywords,
          subsidiary_of: row.company_subsidiary_of,
          custom_fields: companyCustomFields,
          created_at: row.company_created_at,
          updated_at: row.company_updated_at
        } : null,
        department: row.department_id ? {
          id: row.department_id,
          name: row.department_name
        } : null,
        owner: row.owner_id ? {
          id: row.owner_id,
          first_name: row.owner_first_name,
          last_name: row.owner_last_name,
          email: row.owner_email,
          role: row.owner_role
        } : null,
        emails: emailsByContact[row.contact_id] || [],
        phones: phonesByContact[row.contact_id] || []
      };
    });
    res.json({
      contacts,
      pagination: {
        total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        per_page: limit
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts', full: error });
  }
};

// Get single contact
export const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Fetch contact with company, department, and owner info
    const contactQuery = `
      SELECT
        c.id AS contact_id,
        c.first_name,
        c.last_name,
        c.title,
        c.seniority,
        c.stage,
        c.lists,
        c.last_contacted,
        c.person_linkedin_url,
        c.contact_owner,
        c.address,
        c.city,
        c.state,
        c.country,
        c.postal_code,
        c.custom_fields,
        c.created_at AS contact_created_at,
        c.updated_at AS contact_updated_at,
        comp.id AS company_id,
        comp.name AS company_name,
        comp.website AS company_website,
        comp.linkedin_url AS company_linkedin_url,
        comp.facebook_url AS company_facebook_url,
        comp.twitter_url AS company_twitter_url,
        comp.industry AS company_industry,
        comp.num_employees AS company_num_employees,
        comp.annual_revenue AS company_annual_revenue,
        comp.total_funding AS company_total_funding,
        comp.latest_funding AS company_latest_funding,
        comp.latest_funding_amount AS company_latest_funding_amount,
        comp.address AS company_address,
        comp.city AS company_city,
        comp.state AS company_state,
        comp.country AS company_country,
        comp.phone AS company_phone,
        d.id AS department_id,
        d.name AS department_name,
        u.id AS owner_id,
        u.first_name AS owner_first_name,
        u.last_name AS owner_last_name,
        u.email AS owner_email,
        u.role AS owner_role
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(contactQuery, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    const row = rows[0];
    // 2. Fetch emails and phones for this contact
    const [emails] = await pool.execute('SELECT * FROM emails WHERE contact_id = ?', [id]);
    const [phones] = await pool.execute('SELECT * FROM phones WHERE contact_id = ?', [id]);
    // 3. Map to contact object (same as getContacts), normalize nulls/empties
    let contactCustomFields = row.custom_fields;
    if (contactCustomFields && typeof contactCustomFields === 'string') {
      try { contactCustomFields = JSON.parse(contactCustomFields); } catch { contactCustomFields = {}; }
    }
    if (!contactCustomFields || typeof contactCustomFields !== 'object') contactCustomFields = {};
    let companyCustomFields = row.company_custom_fields;
    if (companyCustomFields && typeof companyCustomFields === 'string') {
      try { companyCustomFields = JSON.parse(companyCustomFields); } catch { companyCustomFields = {}; }
    }
    if (!companyCustomFields || typeof companyCustomFields !== 'object') companyCustomFields = {};
    function safe(val, fallback = '') {
      if (val === null || val === undefined) return fallback;
      if (typeof val === 'string' && (val.trim() === '' || val === '0000-00-00' || val === '0' || val === '{}')) return fallback;
      return val;
    }
    const contact = {
      id: row.contact_id,
      first_name: safe(row.first_name),
      last_name: safe(row.last_name),
      title: safe(row.title),
      seniority: safe(row.seniority),
      stage: safe(row.stage),
      lists: safe(row.lists),
      last_contacted: safe(row.last_contacted),
      person_linkedin_url: safe(row.person_linkedin_url),
      contact_owner: safe(row.contact_owner),
      address: safe(row.address),
      city: safe(row.city),
      state: safe(row.state),
      country: safe(row.country),
      postal_code: safe(row.postal_code),
      custom_fields: contactCustomFields,
      created_at: safe(row.contact_created_at),
      updated_at: safe(row.contact_updated_at),
      company: row.company_id ? {
        id: row.company_id,
        name: safe(row.company_name),
        website: safe(row.company_website),
        linkedin_url: safe(row.company_linkedin_url),
        facebook_url: safe(row.company_facebook_url),
        twitter_url: safe(row.company_twitter_url),
        industry: safe(row.company_industry),
        num_employees: safe(row.company_num_employees),
        annual_revenue: safe(row.company_annual_revenue),
        total_funding: safe(row.company_total_funding),
        latest_funding: safe(row.company_latest_funding),
        latest_funding_amount: safe(row.company_latest_funding_amount),
        address: safe(row.company_address),
        city: safe(row.company_city),
        state: safe(row.company_state),
        country: safe(row.company_country),
        phone: safe(row.company_phone),
        custom_fields: companyCustomFields,
        // created_at, updated_at, etc. can be added if needed
      } : null,
      department: row.department_id ? {
        id: row.department_id,
        name: safe(row.department_name)
      } : null,
      owner: row.owner_id ? {
        id: row.owner_id,
        first_name: safe(row.owner_first_name),
        last_name: safe(row.owner_last_name),
        email: safe(row.owner_email),
        role: safe(row.owner_role)
      } : null,
      emails: Array.isArray(emails) ? emails : [],
      phones: Array.isArray(phones) ? phones : []
    };
    res.json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

// Create contact
export const createContact = async (req, res) => {
  try {
    let {
      first_name,
      last_name,
      title,
      seniority,
      department, // department name
      company_name, // company name
      owner_id,
      stage,
      lists,
      last_contacted,
      person_linkedin_url,
      contact_owner,
      address,
      city,
      state,
      country,
      postal_code,
      emails = [],
      phones = [],
      ...customFields
    } = req.body;

    // Look up or create company
    let company_id = null;
    if (company_name) {
      const [companies] = await pool.execute('SELECT id FROM companies WHERE name = ?', [company_name]);
      if (companies.length > 0) {
        company_id = companies[0].id;
      } else {
        const [result] = await pool.execute(
          'INSERT INTO companies (name) VALUES (?)',
          [company_name]
        );
        company_id = result.insertId;
      }
    }
    // Look up or create department
    let department_id = null;
    if (department) {
      const [departments] = await pool.execute('SELECT id FROM departments WHERE name = ?', [department]);
      if (departments.length > 0) {
        department_id = departments[0].id;
      } else {
        const [result] = await pool.execute(
          'INSERT INTO departments (name) VALUES (?)',
          [department]
        );
        department_id = result.insertId;
      }
    }
    const customFieldsJson = Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : null;
    // Insert contact
    const [result] = await pool.execute(
      `INSERT INTO contacts (
        first_name, last_name, title, seniority, department_id, company_id, owner_id, stage, lists, last_contacted, person_linkedin_url, contact_owner, address, city, state, country, postal_code, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        first_name || null,
        last_name || null,
        title || null,
        seniority || null,
        department_id || null,
        company_id || null,
        owner_id || null,
        stage || null,
        lists || null,
        last_contacted || null,
        person_linkedin_url || null,
        contact_owner || null,
        address || null,
        city || null,
        state || null,
        country || null,
        postal_code || null,
        customFieldsJson
      ]
    );
    const contactId = result.insertId;
    // Insert emails
    for (const emailObj of emails) {
      await pool.execute(
        `INSERT INTO emails (contact_id, email, type, status, source, confidence, catch_all_status, last_verified_at, is_primary, unsubscribe)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          contactId,
          emailObj.email,
          emailObj.type || 'primary',
          emailObj.status || null,
          emailObj.source || null,
          emailObj.confidence || null,
          emailObj.catch_all_status || null,
          emailObj.last_verified_at || null,
          emailObj.is_primary || false,
          emailObj.unsubscribe || false
        ]
      );
    }
    // Insert phones
    for (const phoneObj of phones) {
      await pool.execute(
        `INSERT INTO phones (contact_id, phone, type)
         VALUES (?, ?, ?)` ,
        [
          contactId,
          phoneObj.phone,
          phoneObj.type || 'work'
        ]
      );
    }
    // Fetch created contact
    const [contacts] = await pool.execute(
      'SELECT * FROM contacts WHERE id = ?',
      [contactId]
    );
    res.status(201).json({
      message: 'Contact created successfully',
      contact: contacts[0]
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
        company_phone = ?, address = ?, city = ?, state = ?, 
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
    let totalImported = 0;
    const errors = [];
    const BATCH_SIZE = 500;
    const allRows = [];
    files.forEach((fileData, fileIndex) => {
      if (fileData && Array.isArray(fileData) && mappings[fileIndex]) {
        fileData.forEach(row => {
          allRows.push({ row, mapping: mappings[fileIndex], fileIndex });
        });
      }
    });
    for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
      const batch = allRows.slice(i, i + BATCH_SIZE);
      for (let j = 0; j < batch.length; j++) {
        const { row, mapping, fileIndex } = batch[j];
        try {
          const contactData = {};
          const customFields = {};
          const emails = [];
          const phones = [];
          let company_id = null;
          let department_id = null;
          let companyData = null;
          Object.entries(mapping).forEach(([fileColumn, crmField]) => {
            if (crmField && crmField !== '-- Ignore --' && row[fileColumn] !== undefined) {
              if (crmField.startsWith('custom_fields.')) {
                const customFieldName = crmField.replace('custom_fields.', '');
                customFields[customFieldName] = row[fileColumn];
              } else if (crmField === 'email' || crmField === 'secondary_email' || crmField === 'tertiary_email') {
                emails.push({ email: row[fileColumn], type: crmField === 'email' ? 'primary' : crmField.replace('_email', '') });
              } else if (crmField.endsWith('_phone')) {
                phones.push({ phone: row[fileColumn], type: crmField.replace('_phone', '') });
              } else if (crmField === 'company_name') {
                contactData.company_name = row[fileColumn];
              } else if (crmField === 'department') {
                contactData.department = row[fileColumn];
              } else if (crmField === 'personal_email') {
                emails.push({ email: row[fileColumn], type: 'personal' });
              } else if (crmField === 'contact_address') { contactData.address = row[fileColumn]; }
              else if (crmField === 'contact_city') { contactData.city = row[fileColumn]; }
              else if (crmField === 'contact_state') { contactData.state = row[fileColumn]; }
              else if (crmField === 'contact_country') { contactData.country = row[fileColumn]; }
              else if (crmField === 'contact_postal_code') { contactData.postal_code = row[fileColumn]; }
              else if (crmField.startsWith('company_')) { 
                if (!companyData) companyData = {};
                companyData[crmField.replace('company_', '')] = row[fileColumn];
              } else {
                contactData[crmField] = row[fileColumn];
              }
            }
          });
          // Look up or create company
          if (contactData.company_name) {
            const [companies] = await pool.execute('SELECT id FROM companies WHERE name = ?', [contactData.company_name]);
            if (companies.length > 0) {
              company_id = companies[0].id;
            } else {
              // Prepare company insert fields
              const fields = ['name'];
              const values = [contactData.company_name];
              if (companyData) {
                for (const [key, value] of Object.entries(companyData)) {
                  if (value !== undefined && value !== null) {
                    fields.push(key);
                    values.push(value);
                  }
                }
              }
              const placeholders = fields.map(() => '?').join(', ');
              const [result] = await pool.execute(
                `INSERT INTO companies (${fields.join(', ')}) VALUES (${placeholders})`,
                values
              );
              company_id = result.insertId;
            }
          }
          // Look up or create department
          if (contactData.department) {
            const [departments] = await pool.execute('SELECT id FROM departments WHERE name = ?', [contactData.department]);
            if (departments.length > 0) {
              department_id = departments[0].id;
            } else {
              const [result] = await pool.execute('INSERT INTO departments (name) VALUES (?)', [contactData.department]);
              department_id = result.insertId;
            }
          }
          contactData.custom_fields = Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : null;
          // Insert contact
          const [result] = await pool.execute(
            `INSERT INTO contacts (
              first_name, last_name, title, seniority, department_id, company_id, owner_id, stage, lists, last_contacted, person_linkedin_url, contact_owner, address, city, state, country, postal_code, custom_fields
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
              contactData.first_name || null,
              contactData.last_name || null,
              contactData.title || null,
              contactData.seniority || null,
              department_id || null,
              company_id || null,
              contactData.owner_id || null,
              contactData.stage || null,
              contactData.lists || null,
              contactData.last_contacted || null,
              contactData.person_linkedin_url || null,
              contactData.contact_owner || null,
              contactData.address || null,
              contactData.city || null,
              contactData.state || null,
              contactData.country || null,
              contactData.postal_code || null,
              contactData.custom_fields
            ]
          );
          const contactId = result.insertId;
          // Insert emails
          for (const emailObj of emails) {
            await pool.execute(
              `INSERT INTO emails (contact_id, email, type)
               VALUES (?, ?, ?)` ,
              [
                contactId,
                emailObj.email,
                emailObj.type || 'primary'
              ]
            );
          }
          // Insert phones
          for (const phoneObj of phones) {
            await pool.execute(
              `INSERT INTO phones (contact_id, phone, type)
               VALUES (?, ?, ?)` ,
              [
                contactId,
                phoneObj.phone,
                phoneObj.type || 'work'
              ]
            );
          }
          totalImported++;
        } catch (error) {
          errors.push(`File ${fileIndex + 1}, Row ${j + 1 + i}: ${error.message}`);
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

// Dashboard stats endpoint
export const getDashboardStats = async (req, res) => {
  try {
    // Total contacts
    const [[{ total_contacts }]] = await pool.execute('SELECT COUNT(*) as total_contacts FROM contacts');
    // Total companies
    const [[{ total_companies }]] = await pool.execute('SELECT COUNT(*) as total_companies FROM companies');
    // Recent contacts (created in current month)
    const [[{ recent_contacts }]] = await pool.execute(`
      SELECT COUNT(*) as recent_contacts
      FROM contacts
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);
    // Lead conversion rate (qualified or customer)
    const [[{ qualified_leads }]] = await pool.execute(`
      SELECT COUNT(*) as qualified_leads
      FROM contacts
      WHERE stage = 'qualified' OR stage = 'customer'
    `);
    const leadConversionRate = total_contacts > 0 ? Math.round((qualified_leads / total_contacts) * 100) : 0;
    res.json({
      total_contacts,
      total_companies,
      recent_contacts,
      lead_conversion_rate: leadConversionRate
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', full: error });
  }
};

// Mark duplicates API
export const markDuplicates = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // 0. Clear previous duplicate markings
    await connection.query('UPDATE contacts SET is_duplicate = 0, duplicate_of = NULL WHERE is_duplicate = 1 OR duplicate_of IS NOT NULL');

    // 1. Load all contacts (id, first_name, last_name, company_id)
    const [contacts] = await connection.query('SELECT id, first_name, last_name, company_id FROM contacts');
    // 2. Load all emails (contact_id, email)
    const [emails] = await connection.query('SELECT contact_id, email FROM emails');

    // 3. Build graph: node = contact id, edge if duplicate by email or by (first+last+company)
    // Build adjacency list
    const adj = {};
    contacts.forEach(c => { adj[c.id] = new Set(); });

    // 3a. Duplicate by email (skip empty/null emails)
    const emailMap = {};
    for (const e of emails) {
      if (!e.email || e.email.trim() === '') continue; // skip empty
      if (!emailMap[e.email]) emailMap[e.email] = [];
      emailMap[e.email].push(e.contact_id);
    }
    for (const ids of Object.values(emailMap)) {
      if (ids.length > 1) {
        for (let i = 0; i < ids.length; i++) {
          for (let j = i + 1; j < ids.length; j++) {
            adj[ids[i]].add(ids[j]);
            adj[ids[j]].add(ids[i]);
          }
        }
      }
    }

    // 3b. Duplicate by first+last+company (skip if first or last name is empty/null)
    const nameCompanyMap = {};
    for (const c of contacts) {
      if (!c.first_name || !c.last_name) continue; // skip if missing
      const key = `${(c.first_name||'').toLowerCase()}|${(c.last_name||'').toLowerCase()}|${c.company_id||''}`;
      if (!nameCompanyMap[key]) nameCompanyMap[key] = [];
      nameCompanyMap[key].push(c.id);
    }
    for (const ids of Object.values(nameCompanyMap)) {
      if (ids.length > 1) {
        for (let i = 0; i < ids.length; i++) {
          for (let j = i + 1; j < ids.length; j++) {
            adj[ids[i]].add(ids[j]);
            adj[ids[j]].add(ids[i]);
          }
        }
      }
    }

    // 4. Find connected components (BFS)
    const visited = new Set();
    const groups = [];
    for (const id of Object.keys(adj)) {
      if (!visited.has(Number(id))) {
        const queue = [Number(id)];
        const group = [];
        visited.add(Number(id));
        while (queue.length > 0) {
          const curr = queue.shift();
          group.push(curr);
          for (const neighbor of adj[curr]) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
        if (group.length > 1) groups.push(group);
      }
    }

    // 5. For each group, pick master (lowest id), update others
    let updatedCount = 0;
    for (const group of groups) {
      const masterId = Math.min(...group);
      const dupes = group.filter(id => id !== masterId);
      if (dupes.length > 0) {
        await connection.query(
          `UPDATE contacts SET is_duplicate = 1, duplicate_of = ? WHERE id IN (${dupes.map(() => '?').join(',')})`,
          [masterId, ...dupes]
        );
        updatedCount += dupes.length;
      }
    }

    res.json({ message: `Duplicates marked using graph-based connected components (empty values skipped)`, groups: groups.length, duplicates: updatedCount });
  } catch (error) {
    console.error('Error marking duplicates:', error);
    res.status(500).json({ error: 'Failed to mark duplicates', details: error.message });
  } finally {
    connection.release();
  }
};

// List duplicate groups API
export const getDuplicateGroups = async (req, res) => {
  try {
    // 1. Get all duplicate groups (where is_duplicate = 1 and duplicate_of is not null)
    const [dupeRows] = await pool.query(
      `SELECT * FROM contacts WHERE is_duplicate = 1 AND duplicate_of IS NOT NULL`
    );
    // 2. Group by duplicate_of
    const groups = {};
    for (const row of dupeRows) {
      if (!groups[row.duplicate_of]) groups[row.duplicate_of] = [];
      groups[row.duplicate_of].push(row);
    }
    // 3. Fetch master contacts for each group
    const masterIds = Object.keys(groups);
    let masters = [];
    if (masterIds.length > 0) {
      const [masterRows] = await pool.query(
        `SELECT * FROM contacts WHERE id IN (${masterIds.map(() => '?').join(',')})`,
        masterIds
      );
      masters = masterRows;
    }
    // 4. Collect all contact IDs (masters + duplicates)
    const allContactIds = [
      ...masters.map(m => m.id),
      ...dupeRows.map(d => d.id)
    ];
    // 5. Fetch all emails and phones for these contacts
    let emailsByContact = {}, phonesByContact = {};
    if (allContactIds.length > 0) {
      const [emails] = await pool.query(
        `SELECT * FROM emails WHERE contact_id IN (${allContactIds.map(() => '?').join(',')})`,
        allContactIds
      );
      emails.forEach(email => {
        if (!emailsByContact[email.contact_id]) emailsByContact[email.contact_id] = [];
        emailsByContact[email.contact_id].push(email);
      });
      const [phones] = await pool.query(
        `SELECT * FROM phones WHERE contact_id IN (${allContactIds.map(() => '?').join(',')})`,
        allContactIds
      );
      phones.forEach(phone => {
        if (!phonesByContact[phone.contact_id]) phonesByContact[phone.contact_id] = [];
        phonesByContact[phone.contact_id].push(phone);
      });
    }
    // 6. Fetch company and department info for all involved company_ids and department_ids
    const allCompanyIds = Array.from(new Set([
      ...masters.map(m => m.company_id).filter(Boolean),
      ...dupeRows.map(d => d.company_id).filter(Boolean)
    ]));
    let companyMap = {};
    if (allCompanyIds.length > 0) {
      const [companies] = await pool.query(
        `SELECT * FROM companies WHERE id IN (${allCompanyIds.map(() => '?').join(',')})`,
        allCompanyIds
      );
      companies.forEach(c => { companyMap[c.id] = c; });
    }
    const allDepartmentIds = Array.from(new Set([
      ...masters.map(m => m.department_id).filter(Boolean),
      ...dupeRows.map(d => d.department_id).filter(Boolean)
    ]));
    let departmentMap = {};
    if (allDepartmentIds.length > 0) {
      const [departments] = await pool.query(
        `SELECT * FROM departments WHERE id IN (${allDepartmentIds.map(() => '?').join(',')})`,
        allDepartmentIds
      );
      departments.forEach(d => { departmentMap[d.id] = d; });
    }
    // 7. Attach emails, phones, company, and department to each contact
    function enrichContact(c) {
      let customFields = c.custom_fields;
      if (typeof customFields === 'string') {
        try { customFields = JSON.parse(customFields); } catch { customFields = {}; }
      }
      return {
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        title: c.title,
        seniority: c.seniority,
        department_id: c.department_id,
        department: c.department_id ? departmentMap[c.department_id] || null : null,
        company_id: c.company_id,
        company: c.company_id ? companyMap[c.company_id] || null : null,
        owner_id: c.owner_id,
        stage: c.stage,
        lists: c.lists,
        last_contacted: c.last_contacted,
        person_linkedin_url: c.person_linkedin_url,
        contact_owner: c.contact_owner,
        address: c.address,
        city: c.city,
        state: c.state,
        country: c.country,
        postal_code: c.postal_code,
        custom_fields: customFields,
        emails: emailsByContact[c.id] || [],
        phones: phonesByContact[c.id] || [],
        created_at: c.created_at,
        updated_at: c.updated_at,
        is_duplicate: c.is_duplicate,
        duplicate_of: c.duplicate_of
      };
    }
    // 8. Build response: [{ master, duplicates: [...] }, ...]
    const result = masterIds.map(masterId => {
      const master = enrichContact(masters.find(m => m.id == masterId));
      return {
        master,
        duplicates: (groups[masterId] || []).map(enrichContact)
      };
    });
    res.json({ duplicate_groups: result });
  } catch (error) {
    console.error('Get duplicate groups error:', error);
    res.status(500).json({ error: 'Failed to fetch duplicate groups', details: error.message });
  }
};

// Merge contacts API
export const mergeContacts = async (req, res) => {
  const { contact_ids, fields } = req.body;
  if (!Array.isArray(contact_ids) || contact_ids.length < 2 || !fields) {
    return res.status(400).json({ error: 'Provide at least two contact_ids and fields to merge.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // 1. Pick master (lowest ID)
    const masterId = Math.min(...contact_ids);
    const duplicateIds = contact_ids.filter(id => id !== masterId);
    // 2. Update master with selected fields (only relevant fields)
    const allowedFields = [
      'first_name', 'last_name', 'title', 'seniority', 'department_id', 'company_id', 'owner_id',
      'stage', 'lists', 'last_contacted', 'person_linkedin_url', 'contact_owner',
      'address', 'city', 'state', 'country', 'postal_code', 'custom_fields'
    ];
    const updateFields = [];
    const updateValues = [];
    for (const key of allowedFields) {
      if (key in fields) {
        let value = fields[key];
        // Normalize: undefined, null, '' => null
        if (value === undefined || value === null || value === '') {
          value = null;
        }
        // Only update owner_id if valid (not 0, not empty)
        if (key === 'owner_id' && (!value || value === 0)) {
          continue;
        }
        if (key === 'custom_fields' && typeof value === 'object' && value !== null) {
          updateFields.push('custom_fields = ?');
          updateValues.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    }
    if (updateFields.length > 0) {
      await connection.query(
        `UPDATE contacts SET ${updateFields.join(', ')} WHERE id = ?`,
        [...updateValues, masterId]
      );
    }
    // 3. Move emails/phones to master (avoid duplicates)
    if (Array.isArray(fields.emails)) {
      await connection.query('DELETE FROM emails WHERE contact_id = ?', [masterId]);
      const seenEmails = new Set();
      for (const emailObj of fields.emails) {
        if (!emailObj.email || seenEmails.has(emailObj.email)) continue;
        seenEmails.add(emailObj.email);
        await connection.query(
          'INSERT INTO emails (contact_id, email, type, is_primary) VALUES (?, ?, ?, ?)',
          [masterId, emailObj.email, emailObj.type || 'primary', emailObj.is_primary || false]
        );
      }
    }
    if (Array.isArray(fields.phones)) {
      await connection.query('DELETE FROM phones WHERE contact_id = ?', [masterId]);
      const seenPhones = new Set();
      for (const phoneObj of fields.phones) {
        if (!phoneObj.phone || seenPhones.has(phoneObj.phone)) continue;
        seenPhones.add(phoneObj.phone);
        await connection.query(
          'INSERT INTO phones (contact_id, phone, type) VALUES (?, ?, ?)',
          [masterId, phoneObj.phone, phoneObj.type || 'work']
        );
      }
    }
    // 4. Mark duplicates as merged (soft delete: set is_duplicate=2, duplicate_of=masterId)
    if (duplicateIds.length > 0) {
      await connection.query(
        `UPDATE contacts SET is_duplicate = 2, duplicate_of = ? WHERE id IN (${duplicateIds.map(() => '?').join(',')})`,
        [masterId, ...duplicateIds]
      );
    }
    await connection.commit();
    // 5. Return merged contact
    const [rows] = await connection.query('SELECT * FROM contacts WHERE id = ?', [masterId]);
    const mergedContact = rows[0];
    const [emails] = await connection.query('SELECT * FROM emails WHERE contact_id = ?', [masterId]);
    const [phones] = await connection.query('SELECT * FROM phones WHERE contact_id = ?', [masterId]);
    mergedContact.emails = emails;
    mergedContact.phones = phones;
    res.json({ message: 'Contacts merged', contact: mergedContact });
  } catch (error) {
    await connection.rollback();
    console.error('Merge contacts error:', error);
    res.status(500).json({ error: 'Failed to merge contacts', details: error.message });
  } finally {
    connection.release();
  }
};

// Predict email for a contact based on company pattern
export const predictEmail = async (req, res) => {
  const contactId = req.params.id;
  try {
    // 1. Get the contact and their company
    const [[contact]] = await pool.execute(
      `SELECT c.id, c.first_name, c.last_name, c.company_id, co.name as company_name
       FROM contacts c
       LEFT JOIN companies co ON c.company_id = co.id
       WHERE c.id = ?`,
      [contactId]
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (!contact.company_id) {
      return res.status(400).json({ error: 'Contact has no company' });
    }
    // 2. Get all emails for contacts in the same company
    const [companyContacts] = await pool.execute(
      `SELECT c.id, c.first_name, c.last_name, e.email
       FROM contacts c
       JOIN emails e ON c.id = e.contact_id
       WHERE c.company_id = ? AND e.email IS NOT NULL AND TRIM(e.email) <> ''`,
      [contact.company_id]
    );
    if (!companyContacts.length) {
      return res.status(404).json({ error: 'We Dont have any available email of this company to predict...' });
    }
    // 3. Infer the most common email pattern
    const patternCounts = {};
    const patternSamples = {};
    const getPattern = (first, last, email) => {
      const [user, domain] = email.split('@');
      if (!user || !domain) return null;
      const f = (first || '').toLowerCase();
      const l = (last || '').toLowerCase();
      if (!f || !l) return null;
      if (user === `${f}.${l}`) return 'first.last';
      if (user === `${f}${l}`) return 'firstlast';
      if (user === `${f[0]}${l}`) return 'flast';
      if (user === `${f}${l[0]}`) return 'firstl';
      if (user === `${f[0]}.${l}`) return 'f.last';
      if (user === `${f}_${l}`) return 'first_last';
      if (user === `${l}${f}`) return 'lastfirst';
      if (user === `${l}.${f}`) return 'last.first';
      if (user === `${f}`) return 'first';
      if (user === `${l}`) return 'last';
      return null;
    };
    for (const c of companyContacts) {
      const pattern = getPattern(c.first_name, c.last_name, c.email);
      if (pattern) {
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        if (!patternSamples[pattern]) patternSamples[pattern] = [];
        if (patternSamples[pattern].length < 3) patternSamples[pattern].push(c.email);
      }
    }
    const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
    if (!sortedPatterns.length) {
      return res.status(404).json({ error: 'Could not infer email pattern for this company' });
    }
    const [bestPattern, count] = sortedPatterns[0];
    // 4. Predict the email for the given contact
    const f = (contact.first_name || '').toLowerCase();
    const l = (contact.last_name || '').toLowerCase();
    let userPart = '';
    switch (bestPattern) {
      case 'first.last': userPart = `${f}.${l}`; break;
      case 'firstlast': userPart = `${f}${l}`; break;
      case 'flast': userPart = `${f[0]}${l}`; break;
      case 'firstl': userPart = `${f}${l[0]}`; break;
      case 'f.last': userPart = `${f[0]}.${l}`; break;
      case 'first_last': userPart = `${f}_${l}`; break;
      case 'lastfirst': userPart = `${l}${f}`; break;
      case 'last.first': userPart = `${l}.${f}`; break;
      case 'first': userPart = `${f}`; break;
      case 'last': userPart = `${l}`; break;
      default: userPart = ''; break;
    }
    const domain = companyContacts[0].email.split('@')[1];
    const predicted_email = userPart && domain ? `${userPart}@${domain}` : '';
    const accuracy = count / companyContacts.length;
    res.json({
      predicted_email,
      pattern: bestPattern,
      accuracy,
      pattern_count: count,
      total_company_emails: companyContacts.length
    });
  } catch (err) {
    console.error('Error in predictEmail:', err);
    res.status(500).json({ error: 'Failed to predict email' });
  }
};

// Save predicted email as primary for a contact
export const savePredictedEmail = async (req, res) => {
  const contactId = req.params.id;
  const { email } = req.body;
  if (!email || !contactId) {
    return res.status(400).json({ error: 'Email and contact ID are required' });
  }
  try {
    // Remove existing primary email for this contact
    await pool.execute('DELETE FROM emails WHERE contact_id = ? AND type = ? AND is_primary = 1', [contactId, 'primary']);
    // Insert new primary email
    await pool.execute(
      'INSERT INTO emails (contact_id, email, type, is_primary) VALUES (?, ?, ?, ?)',
      [contactId, email, 'primary', true]
    );
    res.json({ message: 'Primary email saved successfully', email });
  } catch (err) {
    console.error('Error saving predicted email:', err);
    res.status(500).json({ error: 'Failed to save primary email' });
  }
};

// Get all contacts missing an email (no email row or email is NULL/empty)
export const getContactsMissingEmails = async (req, res) => {
  try {
    // Find contacts with no email row or only empty/null emails
    const [contacts] = await pool.execute(`
      SELECT c.id, c.first_name, c.last_name, c.company_id, co.name as company_name
      FROM contacts c
      LEFT JOIN emails e ON c.id = e.contact_id AND (e.email IS NOT NULL AND TRIM(e.email) <> '')
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE e.id IS NULL
         OR e.email IS NULL
         OR TRIM(e.email) = ''
      GROUP BY c.id
    `);
    res.json({ contacts });
  } catch (err) {
    console.error('Error fetching contacts missing emails:', err);
    res.status(500).json({ error: 'Failed to fetch contacts missing emails' });
  }
};