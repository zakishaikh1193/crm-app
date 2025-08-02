import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';

// Helper: get all mappable fields from new schema
const getAllMappableFields = () => [
  // Contact fields (These are fine)
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

  // Company fields (NEW - CORRECTED TO MATCH YOUR DATABASE)
  // The `value` now matches the actual column names in your `companies` table.
  { value: 'name', label: 'Company Name', group: 'Company' },
  { value: 'website', label: 'Company Website', group: 'Company' },
  { value: 'linkedin_url', label: 'Company Linkedin Url', group: 'Company' },
  { value: 'facebook_url', label: 'Company Facebook Url', group: 'Company' },
  { value: 'twitter_url', label: 'Company Twitter Url', group: 'Company' },
  { value: 'industry', label: 'Company Industry', group: 'Company' },
  { value: 'num_employees', label: '# Employees', group: 'Company' },
  { value: 'annual_revenue', label: 'Annual Revenue', group: 'Company' },
  { value: 'total_funding', label: 'Total Funding', group: 'Company' },
  { value: 'latest_funding', label: 'Latest Funding', group: 'Company' },
  { value: 'latest_funding_amount', label: 'Latest Funding Amount', group: 'Company' },
  { value: 'last_raised_at', label: 'Last Raised At', group: 'Company' },
  { value: 'address', label: 'Company Address', group: 'Company' },
  { value: 'city', label: 'Company City', group: 'Company' },
  { value: 'state', label: 'Company State', group: 'Company' },
  { value: 'country', label: 'Company Country', group: 'Company' },
  { value: 'phone', label: 'Company Phone', group: 'Company' },
  { value: 'keywords', label: 'Company Keywords', group: 'Company' },

  // Email fields (These are fine)
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

  // Phone fields (These are fine)
  { value: 'work_phone', label: 'Work Direct Phone', group: 'Phone' },
  { value: 'home_phone', label: 'Home Phone', group: 'Phone' },
  { value: 'mobile_phone', label: 'Mobile Phone', group: 'Phone' },
  { value: 'corporate_phone', label: 'Corporate Phone', group: 'Phone' },
  { value: 'other_phone', label: 'Other Phone', group: 'Phone' },
  
  // Department, Intent etc (These are fine)
  { value: 'department', label: 'Department', group: 'Department' },
  { value: 'primary_intent_topic', label: 'Primary Intent Topic', group: 'Intent' },
  { value: 'primary_intent_score', label: 'Primary Intent Score', group: 'Intent' },
  { value: 'secondary_intent_topic', label: 'Secondary Intent Topic', group: 'Intent' },
  { value: 'secondary_intent_score', label: 'Secondary Intent Score', group: 'Intent' },
];

export const getContactFields = async (req, res) => {
  try {
    res.json({ fields: getAllMappableFields() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact fields' });
  }
};

// Enhance getContacts to support advanced filtering
export const getContacts = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const {
      company,
      industry,
      department,
      city,
      state,
      country,
      title,
      seniority,
      stage,
      status,
      owner,
      has_email,
      has_phone,
      exclude_status,
      // Add more filters as needed
    } = req.query;

    // Build WHERE clause and params
    let whereClause = ' WHERE 1=1';
    const params = [];
    // Helper to add multi-select filters (now splits by pipe |)
    const addMultiSelect = (field, values, tableAlias = 'c') => {
      if (!values) return;
      // Use pipe as delimiter for multi-select
      const arr = values.split('|').map(v => v.trim()).filter(Boolean);
      if (arr.length > 0) {
        whereClause += ` AND (` + arr.map(() => `${tableAlias}.${field} = ?`).join(' OR ') + `)`;
        params.push(...arr);
      }
    };
    addMultiSelect('company_id', company, 'c');
    addMultiSelect('industry', industry, 'co');
    addMultiSelect('department_id', department, 'c');
    addMultiSelect('city', city, 'c');
    addMultiSelect('state', state, 'c');
    addMultiSelect('country', country, 'c');
    addMultiSelect('title', title, 'c');
    addMultiSelect('seniority', seniority, 'c');
    addMultiSelect('stage', stage, 'c');
    addMultiSelect('status', status, 'c');
    addMultiSelect('owner_id', owner, 'c');
    if (has_email === '1') {
      whereClause += ' AND EXISTS (SELECT 1 FROM emails e WHERE e.contact_id = c.id AND e.email IS NOT NULL AND TRIM(e.email) <> \'\')';
    } else if (has_email === '0') {
      whereClause += ' AND NOT EXISTS (SELECT 1 FROM emails e WHERE e.contact_id = c.id AND e.email IS NOT NULL AND TRIM(e.email) <> \'\')';
    }
    if (has_phone === '1') {
      whereClause += ' AND EXISTS (SELECT 1 FROM phones p WHERE p.contact_id = c.id AND p.phone IS NOT NULL AND TRIM(p.phone) <> \'\')';
    } else if (has_phone === '0') {
      whereClause += ' AND NOT EXISTS (SELECT 1 FROM phones p WHERE p.contact_id = c.id AND p.phone IS NOT NULL AND TRIM(p.phone) <> \'\')';
    }
    
    // Handle exclude_status parameter (can be multiple values separated by pipe or multiple parameters)
    if (exclude_status) {
      let excludeStatuses = [];
      
      if (Array.isArray(exclude_status)) {
        // Multiple exclude_status parameters sent
        excludeStatuses = exclude_status.map(s => s.trim()).filter(Boolean);
      } else {
        // Single exclude_status parameter with pipe-separated values
        excludeStatuses = exclude_status.split('|').map(s => s.trim()).filter(Boolean);
      }
      
      if (excludeStatuses.length > 0) {
        whereClause += ` AND c.status NOT IN (${excludeStatuses.map(() => '?').join(',')})`;
        params.push(...excludeStatuses);
      }
    }

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM contacts c LEFT JOIN companies co ON c.company_id = co.id LEFT JOIN departments d ON c.department_id = d.id LEFT JOIN users u ON c.owner_id = u.id${whereClause}`;
    const [[{ total }]] = await pool.execute(countSql, params);

    // Main query
    let sql = `SELECT
      c.id AS contact_id,
      c.first_name,
      c.last_name,
      c.title,
      c.seniority,
      c.status,
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
      c.is_duplicate,
      c.duplicate_of,
      co.id AS company_id,
      co.name AS company_name,
      co.website AS company_website,
      co.linkedin_url AS company_linkedin_url,
      co.facebook_url AS company_facebook_url,
      co.twitter_url AS company_twitter_url,
      co.industry AS company_industry,
      co.num_employees AS company_num_employees,
      co.annual_revenue AS company_annual_revenue,
      co.total_funding AS company_total_funding,
      co.latest_funding AS company_latest_funding,
      co.latest_funding_amount AS company_latest_funding_amount,
      co.last_raised_at AS company_last_raised_at,
      co.address AS company_address,
      co.city AS company_city,
      co.state AS company_state,
      co.country AS company_country,
      co.phone AS company_phone,
      co.seo_description AS company_seo_description,
      co.keywords AS company_keywords,
      co.subsidiary_of AS company_subsidiary_of,
      co.custom_fields AS company_custom_fields,
      co.created_at AS company_created_at,
      co.updated_at AS company_updated_at,
      d.id AS department_id,
      d.name AS department_name,
      u.id AS owner_id,
      u.first_name AS owner_first_name,
      u.last_name AS owner_last_name,
      u.email AS owner_email,
      u.role AS owner_role
    FROM contacts c
    LEFT JOIN companies co ON c.company_id = co.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN users u ON c.owner_id = u.id
    ${whereClause}
    ORDER BY c.id DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
    const [rows] = await pool.execute(sql, params);
    if (!rows || !Array.isArray(rows)) {
      return res.json({ contacts: [], pagination: { total: 0, total_pages: 0, current_page: page, per_page: limit } });
    }
    // Fetch emails and phones for these contacts
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
        status: row.status,
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
        c.status,
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
      status: safe(row.status),
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

// Helper to normalize empty strings to null
function normalizeEmpty(val) {
  if (typeof val === 'string' && val.trim() === '') return null;
  return val;
}

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

    // Normalize all fields
    first_name = normalizeEmpty(first_name);
    last_name = normalizeEmpty(last_name);
    title = normalizeEmpty(title);
    seniority = normalizeEmpty(seniority);
    department = normalizeEmpty(department);
    company_name = normalizeEmpty(company_name);
    owner_id = normalizeEmpty(owner_id);
    stage = normalizeEmpty(stage);
    lists = normalizeEmpty(lists);
    last_contacted = normalizeEmpty(last_contacted);
    person_linkedin_url = normalizeEmpty(person_linkedin_url);
    contact_owner = normalizeEmpty(contact_owner);
    address = normalizeEmpty(address);
    city = normalizeEmpty(city);
    state = normalizeEmpty(state);
    country = normalizeEmpty(country);
    postal_code = normalizeEmpty(postal_code);
    Object.keys(customFields).forEach(k => { customFields[k] = normalizeEmpty(customFields[k]); });
    emails = Array.isArray(emails) ? emails.map(e => ({ ...e, email: normalizeEmpty(e.email) })) : [];
    phones = Array.isArray(phones) ? phones.map(p => ({ ...p, phone: normalizeEmpty(p.phone) })) : [];

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
      first_name,
      last_name,
      title,
      seniority,
      status,
      department, // department name or object
      company, // company object or name
      company_name, // company name (fallback)
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

    // Normalize all fields
    const norm = v => normalizeEmpty(v);
    const upd_first_name = norm(first_name);
    const upd_last_name = norm(last_name);
    const upd_title = norm(title);
    const upd_seniority = norm(seniority);
    const upd_status = norm(status);
    const upd_stage = norm(stage);
    const upd_lists = norm(lists);
    const upd_last_contacted = norm(last_contacted);
    const upd_person_linkedin_url = norm(person_linkedin_url);
    const upd_contact_owner = norm(contact_owner);
    const upd_address = norm(address);
    const upd_city = norm(city);
    const upd_state = norm(state);
    const upd_country = norm(country);
    const upd_postal_code = norm(postal_code);
    Object.keys(customFields).forEach(k => { customFields[k] = norm(customFields[k]); });

    // Handle company lookup/creation
    let company_id = null;
    let companyName = company_name;
    if (company && typeof company === 'object' && company.name) {
      companyName = company.name;
    } else if (company && typeof company === 'string') {
      companyName = company;
    }
    
    if (companyName) {
      const [companies] = await pool.execute('SELECT id FROM companies WHERE name = ?', [companyName]);
      if (companies.length > 0) {
        company_id = companies[0].id;
      } else {
        const [result] = await pool.execute(
          'INSERT INTO companies (name) VALUES (?)',
          [companyName]
        );
        company_id = result.insertId;
      }
    }

    // Handle department lookup/creation
    let department_id = null;
    let departmentName = department;
    if (department && typeof department === 'object' && department.name) {
      departmentName = department.name;
    } else if (department && typeof department === 'string') {
      departmentName = department;
    }
    
    if (departmentName) {
      const [departments] = await pool.execute('SELECT id FROM departments WHERE name = ?', [departmentName]);
      if (departments.length > 0) {
        department_id = departments[0].id;
      } else {
        const [result] = await pool.execute(
          'INSERT INTO departments (name) VALUES (?)',
          [departmentName]
        );
        department_id = result.insertId;
      }
    }

    // Prepare custom_fields JSON
    const customFieldsJson = Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : null;

    // Update contact
    await pool.execute(
      `UPDATE contacts SET 
        first_name = ?, last_name = ?, title = ?, seniority = ?, status = ?, 
        department_id = ?, company_id = ?, owner_id = ?, stage = ?, lists = ?, 
        last_contacted = ?, person_linkedin_url = ?, contact_owner = ?, address = ?, 
        city = ?, state = ?, country = ?, postal_code = ?, custom_fields = ?
      WHERE id = ?`,
      [
        upd_first_name || null,
        upd_last_name || null,
        upd_title || null,
        upd_seniority || null,
        upd_status || null,
        department_id || null,
        company_id || null,
        owner_id || null,
        upd_stage || null,
        upd_lists || null,
        upd_last_contacted || null,
        upd_person_linkedin_url || null,
        upd_contact_owner || null,
        upd_address || null,
        upd_city || null,
        upd_state || null,
        upd_country || null,
        upd_postal_code || null,
        customFieldsJson,
        id
      ]
    );

    // Handle emails update
    if (Array.isArray(emails)) {
      // Delete existing emails
      await pool.execute('DELETE FROM emails WHERE contact_id = ?', [id]);
      
      // Insert new emails
      for (const emailObj of emails) {
        if (emailObj.email) {
          await pool.execute(
            `INSERT INTO emails (contact_id, email, type, status, source, confidence, catch_all_status, last_verified_at, is_primary, unsubscribe)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
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
      }
    }

    // Handle phones update
    if (Array.isArray(phones)) {
      // Delete existing phones
      await pool.execute('DELETE FROM phones WHERE contact_id = ?', [id]);
      
      // Insert new phones
      for (const phoneObj of phones) {
        if (phoneObj.phone) {
          await pool.execute(
            `INSERT INTO phones (contact_id, phone, type)
             VALUES (?, ?, ?)`,
            [
              id,
              phoneObj.phone,
              phoneObj.type || 'work'
            ]
          );
        }
      }
    }

    // Fetch updated contact with full details
    const [contacts] = await pool.execute(
      `SELECT 
        c.*,
        comp.name as company_name,
        comp.website as company_website,
        comp.industry as company_industry,
        comp.city as company_city,
        comp.state as company_state,
        comp.country as company_country,
        d.name as department_name,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM contacts c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN departments d ON c.department_id = d.id
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

    // Fetch emails and phones
    const [contactEmails] = await pool.execute('SELECT * FROM emails WHERE contact_id = ?', [id]);
    const [contactPhones] = await pool.execute('SELECT * FROM phones WHERE contact_id = ?', [id]);

    updatedContact.emails = contactEmails;
    updatedContact.phones = contactPhones;

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

// Bulk import contacts - ULTRA FAST VERSION
export const importContacts = async (req, res) => {
  try {
    const { files, mappings } = req.body;
    if (!files || !Array.isArray(files) || !mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    let totalImported = 0;
    const errors = [];
    const allRows = [];
    
    // Collect all rows
    files.forEach((fileData, fileIndex) => {
      if (fileData && Array.isArray(fileData) && mappings[fileIndex]) {
        fileData.forEach(row => {
          allRows.push({ row, mapping: mappings[fileIndex], fileIndex });
        });
      }
    });

    console.log(`Starting import of ${allRows.length} rows`);

    // Pre-cache all companies and departments to avoid repeated lookups
    const companyCache = new Map();
    const departmentCache = new Map();
    
    // Get all existing companies and departments in one query
    const [existingCompanies] = await pool.execute('SELECT id, name FROM companies');
    existingCompanies.forEach(company => {
      companyCache.set(company.name, company.id);
    });

    const [existingDepartments] = await pool.execute('SELECT id, name FROM departments');
    existingDepartments.forEach(dept => {
      departmentCache.set(dept.name, dept.id);
    });

    // Collect all unique companies and departments from the import data
    const newCompanies = new Set();
    const newDepartments = new Set();
    
    for (const { row, mapping } of allRows) {
      Object.entries(mapping).forEach(([fileColumn, crmField]) => {
        if (crmField === 'company_name' && row[fileColumn]) {
          const companyName = normalizeEmpty(row[fileColumn]);
          if (companyName && !companyCache.has(companyName)) {
            newCompanies.add(companyName);
          }
        } else if (crmField === 'department' && row[fileColumn]) {
          const deptName = normalizeEmpty(row[fileColumn]);
          if (deptName && !departmentCache.has(deptName)) {
            newDepartments.add(deptName);
          }
        }
      });
    }

    // Batch insert new companies
    if (newCompanies.size > 0) {
      const companyValues = Array.from(newCompanies).map(name => [name]);
      const companySql = 'INSERT INTO companies (name) VALUES (?)';
      for (const values of companyValues) {
        const [result] = await pool.execute(companySql, values);
        companyCache.set(values[0], result.insertId);
      }
      console.log(`Created ${newCompanies.size} new companies`);
    }

    // Batch insert new departments
    if (newDepartments.size > 0) {
      const deptValues = Array.from(newDepartments).map(name => [name]);
      const deptSql = 'INSERT INTO departments (name) VALUES (?)';
      for (const values of deptValues) {
        const [result] = await pool.execute(deptSql, values);
        departmentCache.set(values[0], result.insertId);
      }
      console.log(`Created ${newDepartments.size} new departments`);
    }

    // Process contacts in batches - UNLIMITED VERSION
    const BATCH_SIZE = 1000; // Larger batch size for unlimited processing
    const contactBatches = [];
    const emailBatches = [];
    const phoneBatches = [];

    for (let i = 0; i < allRows.length; i++) {
      const { row, mapping, fileIndex } = allRows[i];
      
      try {
        const contactData = {};
        const customFields = {};
        const emails = [];
        const phones = [];
        let company_id = null;
        let department_id = null;

        // Process mapping
        Object.entries(mapping).forEach(([fileColumn, crmField]) => {
          if (crmField && crmField !== '-- Ignore --' && row[fileColumn] !== undefined) {
            if (crmField.startsWith('custom_fields.')) {
              const customFieldName = crmField.replace('custom_fields.', '');
              customFields[customFieldName] = row[fileColumn];
            } else if (crmField === 'email' || crmField === 'secondary_email' || crmField === 'tertiary_email' || crmField === 'personal_email') {
              const emailObj = { email: row[fileColumn], type: crmField === 'email' ? 'primary' : crmField.replace('_email', '') };
              emails.push(emailObj);
            } else if (crmField.endsWith('_phone') && crmField !== 'company_phone') {
              phones.push({ phone: row[fileColumn], type: crmField.replace('_phone', '') });
            } else if (crmField === 'company_name') {
              contactData.company_name = row[fileColumn];
            } else if (crmField === 'department') {
              contactData.department = row[fileColumn];
            } else if (crmField === 'contact_address') { contactData.address = row[fileColumn]; }
            else if (crmField === 'contact_city') { contactData.city = row[fileColumn]; }
            else if (crmField === 'contact_state') { contactData.state = row[fileColumn]; }
            else if (crmField === 'contact_country') { contactData.country = row[fileColumn]; }
            else if (crmField === 'contact_postal_code') { contactData.postal_code = row[fileColumn]; }
            else {
              contactData[crmField] = row[fileColumn];
            }
          }
        });

        // Normalize fields
        Object.keys(contactData).forEach(k => { contactData[k] = normalizeEmpty(contactData[k]); });
        Object.keys(customFields).forEach(k => { customFields[k] = normalizeEmpty(customFields[k]); });
        emails.forEach(e => { e.email = normalizeEmpty(e.email); });
        phones.forEach(p => { p.phone = normalizeEmpty(p.phone); });

        // Get company and department IDs from cache
        if (contactData.company_name) {
          company_id = companyCache.get(contactData.company_name) || null;
        }
        if (contactData.department) {
          department_id = departmentCache.get(contactData.department) || null;
        }

        // Prepare contact data
        contactData.custom_fields = Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : null;
        
        const contactValues = [
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
        ];

        contactBatches.push(contactValues);
        
        // Store emails and phones
        if (emails.length > 0) {
          emailBatches.push({ emails, batchIndex: contactBatches.length - 1 });
        }
        if (phones.length > 0) {
          phoneBatches.push({ phones, batchIndex: contactBatches.length - 1 });
        }

        totalImported++;

        // Log progress for large imports
        if (totalImported % 10000 === 0) {
          console.log(`Processed ${totalImported} contacts...`);
        }

        // Process batches when we reach the batch size
        if (contactBatches.length >= BATCH_SIZE) {
          await processBatchesFast(contactBatches, emailBatches, phoneBatches);
          contactBatches.length = 0;
          emailBatches.length = 0;
          phoneBatches.length = 0;
        }

      } catch (error) {
        errors.push(`File ${fileIndex + 1}, Row ${i + 1}: ${error.message}`);
      }
    }

    // Process remaining batches
    if (contactBatches.length > 0) {
      await processBatchesFast(contactBatches, emailBatches, phoneBatches);
    }

    console.log(`Import completed: ${totalImported} contacts imported`);

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

// Ultra-fast batch processing function
async function processBatchesFast(contactBatches, emailBatches, phoneBatches) {
  if (contactBatches.length === 0) return;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Batch insert contacts
    const contactSql = `INSERT INTO contacts (
      first_name, last_name, title, seniority, department_id, company_id, owner_id, stage, lists, last_contacted, person_linkedin_url, contact_owner, address, city, state, country, postal_code, custom_fields
    ) VALUES ${contactBatches.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`;
    
    const [result] = await connection.execute(contactSql, contactBatches.flat());

    // 2. Get the ID of the FIRST contact that was just inserted
    const firstContactId = result.insertId;
    if (firstContactId === 0) {
      throw new Error("Contact batch insertion failed, received 0 for insertId.");
    }
    
    // 3. Prepare email data for batch insert
    const emailValues = [];
    emailBatches.forEach(batch => {
      // **CRITICAL FIX HERE**: The ID of the contact is the first ID + its index in the batch.
      const contactId = firstContactId + batch.batchIndex;
      batch.emails.forEach(emailObj => {
        if (emailObj.email) { // Only insert emails that are not empty
          // The full email object for all columns
           emailValues.push([contactId, emailObj.email, emailObj.type || 'primary', emailObj.status, emailObj.source, emailObj.confidence, emailObj.catch_all_status, emailObj.last_verified_at, emailObj.is_primary || false, emailObj.unsubscribe || false]);
        }
      });
    });

    if (emailValues.length > 0) {
      const emailSql = `INSERT INTO emails (contact_id, email, type, status, source, confidence, catch_all_status, last_verified_at, is_primary, unsubscribe) VALUES ?`;
      await connection.query(emailSql, [emailValues]);
    }
    
    // 4. Prepare phone data for batch insert
    const phoneValues = [];
    phoneBatches.forEach(batch => {
      const contactId = firstContactId + batch.batchIndex;
      batch.phones.forEach(phoneObj => {
        if (phoneObj.phone) { // Only insert phones that are not empty
          phoneValues.push([contactId, phoneObj.phone, phoneObj.type || 'work']);
        }
      });
    });

    if (phoneValues.length > 0) {
      const phoneSql = `INSERT INTO phones (contact_id, phone, type) VALUES ?`;
      await connection.query(phoneSql, [phoneValues]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Batch processing error:', error); // Log the specific error
    throw error; // Re-throw the error to be caught by the main function
  } finally {
    connection.release();
  }
}

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
// Mark duplicates API
export const markDuplicates = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // 0. Clear previous duplicate markings (only for non-merged duplicates)
    await connection.query('UPDATE contacts SET is_duplicate = 0, duplicate_of = NULL WHERE is_duplicate = 1');

    // 1. Load all contacts (id, first_name, last_name, company_id) excluding already merged contacts
    const [contacts] = await connection.query(
      'SELECT id, first_name, last_name, company_id FROM contacts WHERE is_duplicate != 2'
    );
    
    // 2. Load all emails (contact_id, email) for non-merged contacts
    const [emails] = await connection.query(
      'SELECT e.contact_id, e.email FROM emails e ' +
      'JOIN contacts c ON e.contact_id = c.id ' +
      'WHERE c.is_duplicate != 2');

    console.log(`Processing ${contacts.length} contacts and ${emails.length} emails`);

    // 3. Find duplicate groups by direct relationships only
    const duplicateGroups = [];

    // 3a. Duplicate by email (skip empty/null emails)
    const emailMap = {};
    for (const e of emails) {
      if (!e.email || e.email.trim() === '') continue; // skip empty
      if (!emailMap[e.email]) emailMap[e.email] = [];
      emailMap[e.email].push(e.contact_id);
    }
    
    // Create groups for emails with multiple contacts
    for (const [email, contactIds] of Object.entries(emailMap)) {
      if (contactIds.length > 1) {
        console.log(`Email duplicate group: ${email} -> contacts: ${contactIds.join(', ')}`);
        duplicateGroups.push(contactIds);
      }
    }

    // 3b. Duplicate by first+last+company (skip if first or last name is empty/null)
    const nameCompanyMap = {};
    for (const c of contacts) {
      if (!c.first_name || !c.last_name || !c.company_id) continue; // skip if missing
      const key = `${(c.first_name||'').toLowerCase()}|${(c.last_name||'').toLowerCase()}|${c.company_id}`;
      if (!nameCompanyMap[key]) nameCompanyMap[key] = [];
      nameCompanyMap[key].push(c.id);
    }
    
    // Create groups for name+company combinations with multiple contacts
    for (const [key, contactIds] of Object.entries(nameCompanyMap)) {
      if (contactIds.length > 1) {
        console.log(`Name+Company duplicate group: ${key} -> contacts: ${contactIds.join(', ')}`);
        duplicateGroups.push(contactIds);
      }
    }

    console.log(`Found ${duplicateGroups.length} initial duplicate groups`);

    // 4. Merge overlapping groups (if contacts appear in multiple groups, combine them)
    const mergedGroups = [];

    for (let i = 0; i < duplicateGroups.length; i++) {
      const group = duplicateGroups[i];
      let merged = false;

      // Check if any contact in this group is already in a merged group
      for (let j = 0; j < mergedGroups.length; j++) {
        const existingGroup = mergedGroups[j];
        const hasOverlap = group.some(contactId => existingGroup.includes(contactId));
        
        if (hasOverlap) {
          // Merge this group into the existing one
          const uniqueContacts = [...new Set([...existingGroup, ...group])];
          console.log(`Merging group ${i} into group ${j}: ${group.join(', ')} + ${existingGroup.join(', ')} = ${uniqueContacts.join(', ')}`);
          mergedGroups[j] = uniqueContacts;
          merged = true;
          break;
        }
      }

      if (!merged) {
        console.log(`Creating new merged group ${mergedGroups.length}: ${group.join(', ')}`);
        mergedGroups.push([...group]);
      }
    }

    console.log(`Final merged groups:`, mergedGroups);

    // 5. For each group, pick master (lowest id), update others
    let updatedCount = 0;
    for (const group of mergedGroups) {
      if (group.length > 1) {
        const masterId = Math.min(...group);
        const dupes = group.filter(id => id !== masterId);
        console.log(`Group: ${group.join(', ')} -> Master: ${masterId}, Duplicates: ${dupes.join(', ')}`);
        if (dupes.length > 0) {
          // Only update if the contact is not already marked as merged (is_duplicate != 2)
        await connection.query(
          `UPDATE contacts SET is_duplicate = 1, duplicate_of = ? 
           WHERE id IN (${dupes.map(() => '?').join(',')}) 
           AND is_duplicate != 2`,
          [masterId, ...dupes]
        );
          updatedCount += dupes.length;
        }
      }
    }

    res.json({ 
      message: `Duplicates marked using direct relationships only (empty values skipped)`, 
      groups: mergedGroups.length, 
      duplicates: updatedCount 
    });
  } catch (error) {
    console.error('Error marking duplicates:', error);
    res.status(500).json({ error: 'Failed to mark duplicates', details: error.message });
  } finally {
    connection.release();
  }
};

// List duplicate groups API with pagination
export const getDuplicateGroups = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    // 1. Get all duplicate groups with their masters
    const [duplicateGroups] = await pool.query(`
      SELECT 
        duplicate_of as master_id,
        COUNT(*) as duplicate_count
      FROM contacts 
      WHERE is_duplicate = 1 AND duplicate_of IS NOT NULL 
      GROUP BY duplicate_of 
      HAVING COUNT(*) > 0
      ORDER BY duplicate_of
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `);

    // 2. Get total count
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total FROM (
        SELECT duplicate_of
        FROM contacts 
        WHERE is_duplicate = 1 AND duplicate_of IS NOT NULL 
        GROUP BY duplicate_of 
        HAVING COUNT(*) > 0
      ) as \`groups\`
    `);
    const total = countResult[0].total;

    // 3. Get all contacts for these groups
    const masterIds = duplicateGroups.map(g => g.master_id);
    let allContacts = [];
    if (masterIds.length > 0) {
      const [contacts] = await pool.query(`
        SELECT * FROM contacts 
        WHERE id IN (${masterIds.map(() => '?').join(',')}) 
        OR (is_duplicate = 1 AND duplicate_of IN (${masterIds.map(() => '?').join(',')}))
      `, [...masterIds, ...masterIds]);
      allContacts = contacts;
    }

    // 4. Group contacts by their master
    const groups = {};
    for (const contact of allContacts) {
      const masterId = contact.is_duplicate ? contact.duplicate_of : contact.id;
      if (!groups[masterId]) {
        groups[masterId] = {
          master: null,
          duplicates: []
        };
      }
      if (contact.is_duplicate) {
        groups[masterId].duplicates.push(contact);
      } else {
        groups[masterId].master = contact;
      }
    }

    // 5. Collect all contact IDs for fetching related data
    const allContactIds = allContacts.map(c => c.id);

    // 6. Fetch all emails and phones for these contacts
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

    // 7. Fetch company and department info
    const allCompanyIds = Array.from(new Set(allContacts.map(c => c.company_id).filter(Boolean)));
    let companyMap = {};
    if (allCompanyIds.length > 0) {
      const [companies] = await pool.query(
        `SELECT * FROM companies WHERE id IN (${allCompanyIds.map(() => '?').join(',')})`,
        allCompanyIds
      );
      companies.forEach(c => { companyMap[c.id] = c; });
    }
    const allDepartmentIds = Array.from(new Set(allContacts.map(c => c.department_id).filter(Boolean)));
    let departmentMap = {};
    if (allDepartmentIds.length > 0) {
      const [departments] = await pool.query(
        `SELECT * FROM departments WHERE id IN (${allDepartmentIds.map(() => '?').join(',')})`,
        allDepartmentIds
      );
      departments.forEach(d => { departmentMap[d.id] = d; });
    }

    // 8. Attach emails, phones, company, and department to each contact
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

    // 9. Build response: [{ master, duplicates: [...] }, ...]
    const result = Object.values(groups)
      .filter(group => group.master && group.duplicates.length > 0)
      .map(group => ({
        master: enrichContact(group.master),
        duplicates: group.duplicates.map(enrichContact)
      }));

    res.json({ 
      duplicate_groups: result,
      pagination: {
        total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        per_page: limit
      }
    });
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

// Get all contacts missing an email (no email row or email is NULL/empty) with pagination
export const getContactsMissingEmails = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT c.id) as total
      FROM contacts c
      LEFT JOIN emails e ON c.id = e.contact_id AND (e.email IS NOT NULL AND TRIM(e.email) <> '')
      WHERE e.id IS NULL
         OR e.email IS NULL
         OR TRIM(e.email) = ''
    `);
    const total = countResult[0].total;

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
      ORDER BY c.id DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `);

    res.json({ 
      contacts,
      pagination: {
        total,
        total_pages: Math.ceil(total / limit),
        current_page: page,
        per_page: limit
      }
    });
  } catch (err) {
    console.error('Error fetching contacts missing emails:', err);
    res.status(500).json({ error: 'Failed to fetch contacts missing emails' });
  }
};

// Delete all contacts where is_duplicate = 2 (merged contacts)
export const deleteMergedDuplicates = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM contacts WHERE is_duplicate = 2');
    res.json({ message: 'Deleted merged duplicate contacts', deleted: result.affectedRows });
  } catch (err) {
    console.error('Error deleting merged duplicates:', err);
    res.status(500).json({ error: 'Failed to delete merged duplicates' });
  }
};

// Get all contacts where is_duplicate = 2 (merged contacts)
export const getMergedDuplicates = async (req, res) => {
  try {
    const [contacts] = await pool.execute(`
      SELECT c.id, c.first_name, c.last_name, c.company_id, co.name as company_name, c.duplicate_of, c.updated_at
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE c.is_duplicate = 2
      ORDER BY c.updated_at DESC
    `);
    res.json({ contacts });
  } catch (err) {
    console.error('Error fetching merged duplicates:', err);
    res.status(500).json({ error: 'Failed to fetch merged duplicates' });
  }
};

// Get all filter options for contacts sidebar
export const getContactFilterOptions = async (req, res) => {
  try {
    // Companies (id, name)
    const [companies] = await pool.execute('SELECT id, name FROM companies ORDER BY name');
    // Industries (distinct, non-empty)
    const [industriesRows] = await pool.execute('SELECT DISTINCT industry FROM companies WHERE industry IS NOT NULL AND TRIM(industry) <> "" ORDER BY industry');
    const industries = industriesRows.map(r => r.industry).filter(Boolean);
    // Departments (id, name)
    const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name');
    // Owners (id, first_name, last_name)
    const [owners] = await pool.execute('SELECT id, first_name, last_name FROM users WHERE is_active = 1 ORDER BY first_name, last_name');
    // Cities (distinct, non-empty)
    const [citiesRows] = await pool.execute('SELECT DISTINCT city FROM contacts WHERE city IS NOT NULL AND TRIM(city) <> "" ORDER BY city');
    const cities = citiesRows.map(r => r.city).filter(Boolean);
    // States (distinct, non-empty)
    const [statesRows] = await pool.execute('SELECT DISTINCT state FROM contacts WHERE state IS NOT NULL AND TRIM(state) <> "" ORDER BY state');
    const states = statesRows.map(r => r.state).filter(Boolean);
    // Countries (distinct, non-empty)
    const [countriesRows] = await pool.execute('SELECT DISTINCT country FROM contacts WHERE country IS NOT NULL AND TRIM(country) <> "" ORDER BY country');
    const countries = countriesRows.map(r => r.country).filter(Boolean);
    // Stages (distinct, non-empty)
    const [stagesRows] = await pool.execute('SELECT DISTINCT stage FROM contacts WHERE stage IS NOT NULL AND TRIM(stage) <> "" ORDER BY stage');
    const stages = stagesRows.map(r => r.stage).filter(Boolean);
    // Titles (distinct, non-empty)
    const [titlesRows] = await pool.execute('SELECT DISTINCT title FROM contacts WHERE title IS NOT NULL AND TRIM(title) <> "" ORDER BY title');
    const titles = titlesRows.map(r => r.title).filter(Boolean);
    // Seniorities (distinct, non-empty)
    const [seniorityRows] = await pool.execute('SELECT DISTINCT seniority FROM contacts WHERE seniority IS NOT NULL AND TRIM(seniority) <> "" ORDER BY seniority');
    const seniorities = seniorityRows.map(r => r.seniority).filter(Boolean);
    res.json({ companies, industries, departments, owners, cities, states, countries, stages, titles, seniorities });
  } catch (error) {
    console.error('Get contact filter options error:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
};

export const importContactsFromFiles = async (req, res) => {
  try {
    const { files, mappings } = req.body;
    if (!files || !Array.isArray(files) || !mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    let totalImported = 0;
    const errors = [];
    const allRows = [];
    
    // Dynamically import parsing functions
    const { parseCSVFile, parseExcelFile } = await import('./importController.js');
    
    // Step 1: Parse all files and collect all rows
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex];
      const mapping = mappings[fileIndex];
      if (!file.path || !mapping) continue;
      
      try {
        console.log(`Processing file: ${file.filename}`);
        const ext = path.extname(file.filename).toLowerCase();
        let parsedData;
        
        if (ext === '.csv') {
          parsedData = await parseCSVFile(file.path);
        } else if (ext === '.xlsx' || ext === '.xls') {
          parsedData = await parseExcelFile(file.path);
        } else {
          throw new Error('Unsupported file type');
        }
        
        parsedData.data.forEach(row => {
          allRows.push({ row, mapping, fileIndex });
        });
        
        console.log(`Added ${parsedData.data.length} rows from ${file.filename}`);
      } catch (error) {
        errors.push(`File ${file.filename}: ${error.message}`);
      }
    }

    console.log(`Starting import of ${allRows.length} total rows.`);

    // Step 2: Aggregate all unique company data from all rows
    const companiesToProcess = new Map();
    const mappableCompanyFields = getAllMappableFields()
      .filter(f => f.group === 'Company')
      .map(f => f.value);

    for (const { row, mapping } of allRows) {
      const companyData = {};
      let companyName = null;

      for (const [fileColumn, crmField] of Object.entries(mapping)) {
        if (mappableCompanyFields.includes(crmField) && row[fileColumn]) {
          const value = normalizeEmpty(row[fileColumn]);
          if (value) {
            companyData[crmField] = value;
            // The key for the company name is now correctly 'name'
            if (crmField === 'name') {
              companyName = value;
            }
          }
        }
      }

      if (companyName) {
        if (!companiesToProcess.has(companyName)) {
          companiesToProcess.set(companyName, companyData);
        } else {
          const existingData = companiesToProcess.get(companyName);
          // Merge data, new data overwrites old if present
          companiesToProcess.set(companyName, { ...existingData, ...companyData });
        }
      }
    }
    
    console.log(`Found ${companiesToProcess.size} unique companies to process.`);

    // Step 3: Upsert all companies and build a reliable cache
    const companyCache = new Map();
    const [existingCompanies] = await pool.execute('SELECT id, name FROM companies');
    existingCompanies.forEach(c => companyCache.set(c.name, c.id));

    for (const [name, data] of companiesToProcess.entries()) {
      // **CRITICAL FIX HERE**: Correctly separate the name from the rest of the data.
      // The `name` property is removed from `dbData` so it's not duplicated in the SQL.
      const { name: companyNameValue, ...dbData } = data;
      const fields = Object.keys(dbData);
      
      if (fields.length === 0 && !companyCache.has(name)) {
        // Only a name was provided, no other data. Just insert the name.
        const [result] = await pool.execute(`INSERT INTO companies (name) VALUES (?)`, [name]);
        companyCache.set(name, result.insertId);
        continue;
      }
      
      const values = Object.values(dbData);
      const companyId = companyCache.get(name);

      if (companyId) {
        if (fields.length > 0) {
          const setClause = fields.map(f => `${f} = ?`).join(', ');
          await pool.execute(`UPDATE companies SET ${setClause} WHERE id = ?`, [...values, companyId]);
        }
      } else {
        const allFields = ['name', ...fields];
        const allValues = [name, ...values];
        const placeholders = allValues.map(() => '?').join(', ');
        const [result] = await pool.execute(
          `INSERT INTO companies (${allFields.join(',')}) VALUES (${placeholders})`,
          allValues
        );
        companyCache.set(name, result.insertId);
      }
    }
    console.log('Finished processing companies. Company cache is now accurate.');

    // Step 4: Process contacts, departments, emails, and phones
    const departmentCache = new Map();
    const [existingDepartments] = await pool.execute('SELECT id, name FROM departments');
    existingDepartments.forEach(d => departmentCache.set(d.name, d.id));
    
    const BATCH_SIZE = 1000;
    const contactBatches = [];
    const emailBatches = [];
    const phoneBatches = [];

    for (let i = 0; i < allRows.length; i++) {
      const { row, mapping } = allRows[i];
      try {
        const contactData = {};
        const customFields = {};
        const emails = [];
        const phones = [];

        Object.entries(mapping).forEach(([fileColumn, crmField]) => {
          if (crmField && crmField !== '-- Ignore --' && row[fileColumn] !== undefined) {
             if (crmField.startsWith('custom_fields.')) {
              customFields[crmField.replace('custom_fields.', '')] = row[fileColumn];
            } else if (['email', 'secondary_email', 'tertiary_email', 'personal_email'].includes(crmField)) {
              emails.push({ email: row[fileColumn], type: crmField === 'email' ? 'primary' : crmField.replace('_email', '') });
            } else if (crmField.endsWith('_phone') && crmField !== 'company_phone') {
              phones.push({ phone: row[fileColumn], type: crmField.replace('_phone', '') });
            } else {
              contactData[crmField] = row[fileColumn];
            }
          }
        });

        Object.keys(contactData).forEach(k => { contactData[k] = normalizeEmpty(contactData[k]); });
        // ... (normalization for customFields, emails, phones)

        const company_id = contactData.name ? companyCache.get(contactData.name) : null;
        
        let department_id = null;
        if (contactData.department) {
          if (!departmentCache.has(contactData.department)) {
            const [result] = await pool.execute('INSERT INTO departments (name) VALUES (?)', [contactData.department]);
            departmentCache.set(contactData.department, result.insertId);
          }
          department_id = departmentCache.get(contactData.department);
        }
        
        const contactValues = [
          contactData.first_name || null,
          contactData.last_name || null,
          contactData.title || null,
          contactData.seniority || null,
          department_id,
          company_id, // This will now be a valid ID or null
          contactData.owner_id || null,
          contactData.stage || null,
          contactData.lists || null,
          contactData.last_contacted || null,
          contactData.person_linkedin_url || null,
          contactData.contact_owner || null,
          contactData.contact_address || null,
          contactData.contact_city || null,
          contactData.contact_state || null,
          contactData.contact_country || null,
          contactData.contact_postal_code || null,
          Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : null,
        ];

        contactBatches.push(contactValues);
        const currentBatchIndex = contactBatches.length - 1;

        if (emails.some(e => e.email)) {
          emailBatches.push({ emails, batchIndex: currentBatchIndex });
        }
        if (phones.some(p => p.phone)) {
          phoneBatches.push({ phones, batchIndex: currentBatchIndex });
        }
        
        totalImported++;

        if (contactBatches.length >= BATCH_SIZE) {
          await processBatchesFast(contactBatches, emailBatches, phoneBatches);
          contactBatches.length = 0; emailBatches.length = 0; phoneBatches.length = 0;
        }

      } catch (error) {
        errors.push(`Row processing error (approx. row ${i + 1}): ${error.message}`);
      }
    }

    if (contactBatches.length > 0) {
      await processBatchesFast(contactBatches, emailBatches, phoneBatches);
    }
    
    // Clean up uploaded files
    for (const file of files) {
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) { console.error(`Failed to delete file: ${file.path}`); }
      }
    }

    console.log(`Import completed: ${totalImported} contacts processed.`);
    res.json({
      message: 'Import completed',
      total_imported: totalImported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed: ' + error.message });
  }
};

// Clear all duplicate markings
export const clearDuplicates = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('UPDATE contacts SET is_duplicate = 0, duplicate_of = NULL WHERE is_duplicate = 1 OR duplicate_of IS NOT NULL');
    res.json({ message: 'All duplicate markings cleared successfully' });
  } catch (error) {
    console.error('Error clearing duplicates:', error);
    res.status(500).json({ error: 'Failed to clear duplicates', details: error.message });
  } finally {
    connection.release();
  }
};

// Helper to filter out empty/null emails/phones
function filterNonEmpty(arr, field) {
  return (Array.isArray(arr) ? arr : []).filter(e => e && typeof e[field] === 'string' && e[field].trim() !== '');
}

// Get all available statuses
export const getStatuses = async (req, res) => {
  try {
    const statuses = [
      { value: 'new', label: 'New', color: 'blue' },
      { value: 'contacted', label: 'Contacted', color: 'yellow' },
      { value: 'unsubscribed', label: 'Unsubscribed', color: 'red' },
      { value: 'wrong-email', label: 'Wrong Email', color: 'red' },
      { value: 'qualified', label: 'Qualified', color: 'green' },
      { value: 'proposal', label: 'Proposal', color: 'purple' },
      { value: 'negotiation', label: 'Negotiation', color: 'orange' },
      { value: 'closed_won', label: 'Closed Won', color: 'green' },
      { value: 'closed_lost', label: 'Closed Lost', color: 'red' },
      { value: 'inactive', label: 'Inactive', color: 'gray' }
    ];
    res.json({ statuses });
  } catch (error) {
    console.error('Get statuses error:', error);
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
};

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const [departments] = await pool.execute('SELECT id, name FROM departments ORDER BY name');
    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

// Update contact status
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

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

    await pool.execute(
      'UPDATE contacts SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ 
      message: 'Contact status updated successfully',
      status 
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ error: 'Failed to update contact status' });
  }
};

// Bulk update contact statuses
export const bulkUpdateContactStatuses = async (req, res) => {
  try {
    const { contact_ids, status } = req.body;

    if (!Array.isArray(contact_ids) || contact_ids.length === 0 || !status) {
      return res.status(400).json({ error: 'Contact IDs array and status are required' });
    }

    // Check if user has permission to update these contacts
    const [existingContacts] = await pool.execute(
      `SELECT id, owner_id FROM contacts WHERE id IN (${contact_ids.map(() => '?').join(',')})`,
      contact_ids
    );

    if (existingContacts.length === 0) {
      return res.status(404).json({ error: 'No contacts found' });
    }

    // Check ownership for all contacts
    const unauthorizedContacts = existingContacts.filter(
      contact => contact.owner_id !== req.user.id && !['admin', 'manager'].includes(req.user.role)
    );

    if (unauthorizedContacts.length > 0) {
      return res.status(403).json({ 
        error: 'Access denied. You can only edit your own contacts.',
        unauthorized_count: unauthorizedContacts.length
      });
    }

    await pool.execute(
      `UPDATE contacts SET status = ? WHERE id IN (${contact_ids.map(() => '?').join(',')})`,
      [status, ...contact_ids]
    );

    res.json({ 
      message: 'Contact statuses updated successfully',
      updated_count: contact_ids.length,
      status 
    });
  } catch (error) {
    console.error('Bulk update contact statuses error:', error);
    res.status(500).json({ error: 'Failed to update contact statuses' });
  }
};

// Bulk update contact statuses from CSV
export const bulkUpdateStatusesFromCSV = async (req, res) => {
  try {
    const { csvData } = req.body;

    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    const results = {
      total_rows: csvData.length,
      updated: 0,
      not_found: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const email = row.email?.trim();
      const status = row.status?.trim();

      if (!email || !status) {
        results.errors.push(`Row ${i + 1}: Missing email or status`);
        continue;
      }

      try {
        // Find contact by email
        const [contacts] = await pool.execute(
          `SELECT c.id, c.owner_id 
           FROM contacts c 
           JOIN emails e ON c.id = e.contact_id 
           WHERE e.email = ?`,
          [email]
        );

        if (contacts.length === 0) {
          results.not_found++;
          results.errors.push(`Row ${i + 1}: No contact found with email ${email}`);
          continue;
        }

        const contact = contacts[0];

        // Check ownership
        if (contact.owner_id !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
          results.errors.push(`Row ${i + 1}: Access denied for contact with email ${email}`);
          continue;
        }

        // Update status
        await pool.execute(
          'UPDATE contacts SET status = ? WHERE id = ?',
          [status, contact.id]
        );

        results.updated++;

      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      message: 'Bulk status update completed',
      results
    });

  } catch (error) {
    console.error('Bulk update statuses from CSV error:', error);
    res.status(500).json({ error: 'Failed to update statuses from CSV' });
  }
};