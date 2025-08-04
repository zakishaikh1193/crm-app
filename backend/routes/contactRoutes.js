import express from 'express';
import { 
  getContactFields,
  getContacts, 
  getContact, 
  createContact, 
  updateContact, 
  deleteContact,
  importContacts,
  importContactsFromFiles,
  getDashboardStats,
  markDuplicates,
  checkDuplicateScanStatus,
  clearDuplicates,
  getDuplicateGroups,
  mergeContacts,
  predictEmail,
  savePredictedEmail,
  getContactsMissingEmails,
  deleteMergedDuplicates,
  getMergedDuplicates,
  getContactFilterOptions,
  getStatuses,
  getDepartments,
  updateContactStatus,
  bulkUpdateContactStatuses,
  bulkUpdateStatusesFromCSV
} from '../controllers/contactController.js';
import { authenticateUserOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All contact routes require authentication
router.use(authenticateUserOrAdmin);

router.get('/fields', getContactFields);
router.get('/', getContacts);
router.post('/import', importContacts);
router.post('/import-from-files', importContactsFromFiles);
router.get('/dashboard-stats', getDashboardStats);
router.get('/duplicates', getDuplicateGroups);
router.get('/duplicates/scan-status', checkDuplicateScanStatus);
router.get('/missing-emails', getContactsMissingEmails);
router.get('/merged-duplicates', getMergedDuplicates);
router.get('/filter-options', getContactFilterOptions);
router.get('/statuses', getStatuses);
router.get('/departments', getDepartments);
router.post('/', createContact);
router.post('/mark-duplicates', markDuplicates);
router.post('/clear-duplicates', clearDuplicates);
router.post('/merge', mergeContacts);
router.post('/delete-duplicates', deleteMergedDuplicates);
router.put('/bulk-status', bulkUpdateContactStatuses);
router.post('/bulk-update-statuses-csv', bulkUpdateStatusesFromCSV);
router.get('/predict-email/:id', predictEmail);
router.post('/:id/save-predicted-email', savePredictedEmail);
router.get('/:id', getContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.put('/:id/status', updateContactStatus);


export default router;