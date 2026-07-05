import { Router } from 'express';
import * as c from './fees.controller.js';

const router = Router();

// --- School side (behind adminGuard; '/fees' mapped to the 'fees' module) ---
router.get('/api/admin/fees/settings', c.getFeesSettings);
router.put('/api/admin/fees/settings', c.putFeesSettings);

router.get('/api/admin/fees/structure', c.getFeeStructure);
router.post('/api/admin/fees/structure', c.postFeeStructure);
router.delete('/api/admin/fees/structure/:id', c.deleteFeeStructure);

router.post('/api/admin/fees/generate', c.postGenerateInvoices);

router.get('/api/admin/fees/invoices', c.getInvoices);
router.patch('/api/admin/fees/invoices/:id', c.patchInvoice);
router.delete('/api/admin/fees/invoices/:id', c.deleteInvoice);
router.post('/api/admin/fees/invoices/:id/mark-paid', c.postInvoiceMarkPaid);

router.get('/api/admin/fees/payments', c.getPayments);
router.post('/api/admin/fees/payments/:id/verify', c.postPaymentVerify);
router.post('/api/admin/fees/payments/:id/reject', c.postPaymentReject);

router.get('/api/admin/fees/summary', c.getSummary);

// --- Parent / student side (inline JWT auth in the controller) ---
router.get('/api/student/fees', c.getStudentFees);
router.post('/api/student/fees/pay', c.postStudentFeePay);

export default router;
