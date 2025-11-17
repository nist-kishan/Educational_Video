import { supabaseAdmin } from '../config/supabase.js';

let PDFDocument = null;
let pdfkitAvailable = false;

// Load pdfkit if available (lazy loading)
const getPDFDocument = async () => {
  if (pdfkitAvailable) return PDFDocument;
  
  try {
    const pdfkit = await import('pdfkit');
    PDFDocument = pdfkit.default;
    pdfkitAvailable = true;
    return PDFDocument;
  } catch (error) {
    console.warn('⚠️ pdfkit not installed - PDF generation disabled. Run: npm install pdfkit');
    return null;
  }
};

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const { orderId, studentId, amount, items, dueDate } = req.body;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        order_id: orderId,
        student_id: studentId,
        amount,
        due_date: dueDate,
        status: 'pending',
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    // Add invoice items
    if (items && items.length > 0) {
      await supabaseAdmin.from('invoice_items').insert(
        items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }))
      );
    }

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get invoices
export const getInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: invoices, error, count } = await supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      invoices,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single invoice
export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get invoice items
    const { data: items } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);

    res.status(200).json({ success: true, invoice: { ...invoice, items } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Download invoice PDF
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if pdfkit is available
    const PDF = await getPDFDocument();
    if (!PDF) {
      return res.status(503).json({ 
        success: false, 
        message: 'PDF generation service not available. Please install pdfkit: npm install pdfkit' 
      });
    }

    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    const { data: items } = await supabaseAdmin
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);

    // Create PDF
    const doc = new PDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);

    doc.pipe(res);

    // Add content
    doc.fontSize(20).text('INVOICE', 100, 100);
    doc.fontSize(12).text(`Invoice #: ${invoice.invoice_number}`, 100, 150);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 100, 170);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 100, 190);

    doc.text('Items:', 100, 250);
    let yPosition = 280;
    items.forEach(item => {
      doc.text(`${item.description} - $${item.total}`, 100, yPosition);
      yPosition += 20;
    });

    doc.text(`Total: $${invoice.amount}`, 100, yPosition + 20);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create recurring invoice
export const createRecurringInvoice = async (req, res) => {
  try {
    const { studentId, amount, frequency, startDate, endDate } = req.body;

    const { data: recurring, error } = await supabaseAdmin
      .from('recurring_invoices')
      .insert([{
        student_id: studentId,
        amount,
        frequency,
        start_date: startDate,
        end_date: endDate,
        is_active: true,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get recurring invoices
export const getRecurringInvoices = async (req, res) => {
  try {
    const { data: recurring, error } = await supabaseAdmin
      .from('recurring_invoices')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    res.status(200).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update recurring invoice
export const updateRecurringInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: recurring, error } = await supabaseAdmin
      .from('recurring_invoices')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, recurring });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete recurring invoice
export const deleteRecurringInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('recurring_invoices')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Recurring invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get invoice settings
export const getSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('invoice_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({
      success: true,
      settings: settings || {
        company_name: 'Educational Platform',
        company_address: '',
        tax_rate: 0,
        payment_terms: 'Due upon receipt'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update invoice settings
export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('invoice_settings')
      .upsert({ ...settings, updated_at: new Date() })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, settings: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
