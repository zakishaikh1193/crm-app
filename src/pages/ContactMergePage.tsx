import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, Grid, TextField, Select, MenuItem, Checkbox, FormControlLabel, FormGroup, Divider, Alert
} from '@mui/material';
import api from '../config/axiosConfig';
import type { FC } from 'react';

interface Email {
  id?: number;
  contact_id?: number;
  email: string;
  type: string;
  is_primary?: boolean;
}

interface Phone {
  id?: number;
  contact_id?: number;
  phone: string;
  type: string;
}

interface CustomFields {
  [key: string]: string | undefined;
}

interface Contact {
  id: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  seniority?: string;
  department?: string;
  company?: string;
  owner_id?: number;
  stage?: string;
  lists?: string;
  last_contacted?: string;
  person_linkedin_url?: string;
  contact_owner?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  custom_fields?: CustomFields;
  emails: Email[];
  phones: Phone[];
}

// Helper to get all unique values for a field from contacts
const getUniqueValues = (contacts: Contact[], field: keyof Contact): any[] => {
  const values = contacts.map((c) => c[field]).filter((v) => v !== undefined && v !== null);
  return Array.from(new Set(values));
};

const getAllCustomFieldKeys = (contacts: Contact[]): string[] => {
  const keys = new Set<string>();
  contacts.forEach((c) => {
    if (c.custom_fields && typeof c.custom_fields === 'object') {
      Object.keys(c.custom_fields).forEach((k) => keys.add(k));
    }
  });
  return Array.from(keys);
};

const getAllEmails = (contacts: Contact[]): Email[] => {
  const emails: Email[] = [];
  contacts.forEach((c) => {
    if (Array.isArray(c.emails)) {
      c.emails.forEach((e) => emails.push(e));
    }
  });
  // Deduplicate by email address
  const seen = new Set<string>();
  return emails.filter((e) => {
    if (!e.email || seen.has(e.email)) return false;
    seen.add(e.email);
    return true;
  });
};

const getAllPhones = (contacts: Contact[]): Phone[] => {
  const phones: Phone[] = [];
  contacts.forEach((c) => {
    if (Array.isArray(c.phones)) {
      c.phones.forEach((p) => phones.push(p));
    }
  });
  // Deduplicate by phone
  const seen = new Set<string>();
  return phones.filter((p) => {
    if (!p.phone || seen.has(p.phone)) return false;
    seen.add(p.phone);
    return true;
  });
};

const relevantFields: (keyof Contact)[] = [
  'first_name', 'last_name', 'title', 'seniority', 'department', 'company', 'owner_id',
  'stage', 'lists', 'last_contacted', 'person_linkedin_url', 'contact_owner',
  'address', 'city', 'state', 'country', 'postal_code'
];

const ContactMergePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Remove debug logs
  const group = location.state?.duplicateGroup;
  const contacts = group ? [group.master, ...group.duplicates] : [];

  const [selected, setSelected] = useState<{
    [K in keyof Contact]?: any;
  } & { emails: Email[]; phones: Phone[]; custom_fields: CustomFields }> (
    () => {
      const initial: any = {};
      relevantFields.forEach((field) => {
        const values = getUniqueValues(contacts, field);
        initial[field] = values[0] || '';
      });
      // Emails/phones: select all by default
      initial.emails = getAllEmails(contacts);
      initial.phones = getAllPhones(contacts);
      // Custom fields: pick first value for each key
      const customKeys = getAllCustomFieldKeys(contacts);
      initial.custom_fields = {};
      customKeys.forEach((key: string) => {
        for (const c of contacts) {
          if (c.custom_fields && c.custom_fields[key] !== undefined) {
            initial.custom_fields[key] = c.custom_fields[key];
            break;
          }
        }
      });
      return initial;
    }
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!group) {
    return <Alert severity="error">No duplicate group provided.</Alert>;
  }

  const handleFieldChange = (field: keyof Contact, value: any) => {
    setSelected((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (key: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      custom_fields: { ...prev.custom_fields, [key]: value },
    }));
  };

  const handleEmailToggle = (emailObj: Email) => {
    setSelected((prev) => {
      const exists = prev.emails.some((e: Email) => e.email === emailObj.email);
      return {
        ...prev,
        emails: exists
          ? prev.emails.filter((e: Email) => e.email !== emailObj.email)
          : [...prev.emails, emailObj],
      };
    });
  };

  const handlePhoneToggle = (phoneObj: Phone) => {
    setSelected((prev) => {
      const exists = prev.phones.some((p: Phone) => p.phone === phoneObj.phone);
      return {
        ...prev,
        phones: exists
          ? prev.phones.filter((p: Phone) => p.phone !== phoneObj.phone)
          : [...prev.phones, phoneObj],
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const contact_ids = contacts.map(c => c.id);
      let fields = { ...selected };
      // Remove empty custom_fields keys
      if (fields.custom_fields) {
        Object.keys(fields.custom_fields).forEach(k => {
          if (fields.custom_fields[k] === '' || fields.custom_fields[k] === undefined) {
            delete fields.custom_fields[k];
          }
        });
      }
      fields = prepareFieldsForSubmit(fields);
      const res = await api.post('/contacts/merge', { contact_ids, fields });
      setSuccess('Contacts merged successfully!');
      setTimeout(() => navigate(`/contacts/${res.data.contact.id}`), 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to merge contacts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Merge Contacts</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Select the value you want to keep for each field. Emails and phones can be combined.
      </Typography>
      <Divider sx={{ my: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {relevantFields.map(field => (
              <Grid item xs={12} md={6} key={field}>
                <Typography variant="body2" color="text.secondary">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                <Select
                  fullWidth
                  value={selected[field] || ''}
                  onChange={e => handleFieldChange(field, e.target.value)}
                  renderValue={val => {
                    if (typeof val === 'object' && val !== null) {
                      if ('name' in val) return val.name;
                      if ('id' in val) return val.id;
                      return JSON.stringify(val);
                    }
                    return val || <em>Empty</em>;
                  }}
                >
                  {getUniqueValues(contacts, field).map((val, idx) => (
                    <MenuItem value={val} key={idx}>
                      {typeof val === 'object' && val !== null
                        ? (val.name || val.id || JSON.stringify(val))
                        : (val || <em>Empty</em>)}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            ))}
            {/* Custom Fields */}
            {getAllCustomFieldKeys(contacts).map(key => (
              <Grid item xs={12} md={6} key={key}>
                <Typography variant="body2" color="text.secondary">Custom: {key}</Typography>
                <Select
                  fullWidth
                  value={selected.custom_fields[key] || ''}
                  onChange={e => handleCustomFieldChange(key, e.target.value)}
                >
                  {contacts.map((c, idx) => (
                    c.custom_fields && c.custom_fields[key] !== undefined ? (
                      <MenuItem value={c.custom_fields[key]} key={idx}>{c.custom_fields[key] || <em>Empty</em>}</MenuItem>
                    ) : null
                  ))}
                </Select>
              </Grid>
            ))}
            {/* Emails */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Emails</Typography>
              <FormGroup>
                {getAllEmails(contacts).map((emailObj, idx) => (
                  <FormControlLabel
                    key={emailObj.email + idx}
                    control={
                      <Checkbox
                        checked={selected.emails.some((e: Email) => e.email === emailObj.email)}
                        onChange={() => handleEmailToggle(emailObj)}
                      />
                    }
                    label={`${emailObj.email} (${emailObj.type})`}
                  />
                ))}
              </FormGroup>
            </Grid>
            {/* Phones */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Phones</Typography>
              <FormGroup>
                {getAllPhones(contacts).map((phoneObj, idx) => (
                  <FormControlLabel
                    key={phoneObj.phone + idx}
                    control={
                      <Checkbox
                        checked={selected.phones.some((p: Phone) => p.phone === phoneObj.phone)}
                        onChange={() => handlePhoneToggle(phoneObj)}
                      />
                    }
                    label={`${phoneObj.phone} (${phoneObj.type})`}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Merging...' : 'Merge Contacts'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

// When submitting, send only the id for company/department fields
const prepareFieldsForSubmit = (fields: any) => {
  const out = { ...fields };
  if (out.company && typeof out.company === 'object' && out.company.id) {
    out.company_id = out.company.id;
    delete out.company;
  }
  if (out.department && typeof out.department === 'object' && out.department.id) {
    out.department_id = out.department.id;
    delete out.department;
  }
  return out;
};

export default ContactMergePage; 