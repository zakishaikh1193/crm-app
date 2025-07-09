import express from 'express';
import { 
  getContactFields,
  getContacts, 
  getContact, 
  createContact, 
  updateContact, 
  deleteContact,
  importContacts,
  getDashboardStats,
  markDuplicates
} from '../controllers/contactController.js';
import { authenticateUserOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All contact routes require authentication
router.use(authenticateUserOrAdmin);

router.get('/fields', getContactFields);
router.get('/', getContacts);
router.post('/import', importContacts);
router.get('/dashboard-stats', getDashboardStats);
router.get('/:id', getContact);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/mark-duplicates', markDuplicates);

export default router;