import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

// Create invoice (admin)
router.post('/', authenticate, authorizeAdmin, invoiceController.createInvoice);

// Get invoices
router.get('/', authenticate, invoiceController.getInvoices);

// Get single invoice
router.get('/:id', authenticate, invoiceController.getInvoice);

// Download invoice PDF
router.get('/:id/download', authenticate, invoiceController.downloadInvoice);

// Create recurring invoice
router.post('/recurring', authenticate, authorizeAdmin, invoiceController.createRecurringInvoice);

// Get recurring invoices
router.get('/recurring/list', authenticate, authorizeAdmin, invoiceController.getRecurringInvoices);

// Update recurring invoice
router.put('/recurring/:id', authenticate, authorizeAdmin, invoiceController.updateRecurringInvoice);

// Delete recurring invoice
router.delete('/recurring/:id', authenticate, authorizeAdmin, invoiceController.deleteRecurringInvoice);

// Get invoice settings
router.get('/settings/get', authenticate, authorizeAdmin, invoiceController.getSettings);

// Update invoice settings
router.put('/settings/update', authenticate, authorizeAdmin, invoiceController.updateSettings);

export default router;
