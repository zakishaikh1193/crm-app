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
      console.log('contactsQuery:', contactsQuery);
      contactsResult = await pool.execute(contactsQuery);
      console.log('contactsResult:', contactsResult);
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
    // 3. Map to contact object (same as getContacts)
    let contactCustomFields = row.custom_fields;
    if (contactCustomFields && typeof contactCustomFields === 'string') {
      try { contactCustomFields = JSON.parse(contactCustomFields); } catch { contactCustomFields = {}; }
    }
    let companyCustomFields = row.company_custom_fields;
    if (companyCustomFields && typeof companyCustomFields === 'string') {
      try { companyCustomFields = JSON.parse(companyCustomFields); } catch { companyCustomFields = {}; }
    }
    const contact = {
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
        address: row.company_address,
        city: row.company_city,
        state: row.company_state,
        country: row.company_country,
        phone: row.company_phone,
        custom_fields: companyCustomFields,
        // created_at, updated_at, etc. can be added if needed
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
      emails: emails || [],
      phones: phones || []
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
  try {
    // 1. Mark duplicates by email (set-based, fast)
    await pool.query(`
      UPDATE contacts c
      JOIN (
        SELECT e1.contact_id AS dupe_id, MIN(e2.contact_id) AS master_id
        FROM emails e1
        JOIN emails e2 ON e1.email = e2.email AND e1.contact_id != e2.contact_id
        GROUP BY e1.contact_id
      ) dupes ON c.id = dupes.dupe_id
      SET c.is_duplicate = 1, c.duplicate_of = dupes.master_id
      WHERE (c.is_duplicate = 0 OR c.is_duplicate IS NULL)
    `);
    // 2. Mark duplicates by first+last+company (set-based, fast)
    await pool.query(`
      UPDATE contacts c
      JOIN (
        SELECT c1.id AS dupe_id, MIN(c2.id) AS master_id
        FROM contacts c1
        JOIN contacts c2 ON c1.first_name = c2.first_name AND c1.last_name = c2.last_name AND c1.company_id = c2.company_id AND c1.id != c2.id
        WHERE (c1.is_duplicate = 0 OR c1.is_duplicate IS NULL)
        GROUP BY c1.id
      ) dupes ON c.id = dupes.dupe_id
      SET c.is_duplicate = 1, c.duplicate_of = dupes.master_id
      WHERE (c.is_duplicate = 0 OR c.is_duplicate IS NULL)
    `);
    res.json({ message: `Duplicates marked (fast set-based update)` });
  } catch (error) {
    console.error('Error marking duplicates:', error);
    res.status(500).json({ error: 'Failed to mark duplicates', details: error.message });
  }
};